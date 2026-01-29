import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongodb/connection';
import { ForexPair } from '@/lib/mongodb/models';
import { FinnhubClient } from '@/lib/finnhub/client';
import { calculateForexRisk, calculatePipMovement } from '@/lib/analysis/riskCalculator';
import { personalizeForexRecommendations } from '@/lib/analysis/personalizer';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!userProfile) {
            return NextResponse.json(
                { error: 'Please complete your profile first' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get major, minor, and exotic forex pairs
        const { major, minor, exotic } = await FinnhubClient.getMajorForexPairs();
        const allPairs = [...major, ...minor.slice(0, 5), ...exotic.slice(0, 3)]; // Top 20 pairs

        const forexRecommendations = [];

        for (const pair of allPairs) {
            try {
                const [quote, technicals] = await Promise.all([
                    FinnhubClient.getForexQuote(pair),
                    FinnhubClient.calculateForexTechnicals(pair),
                ]);

                if (!quote || quote.c === 0) continue;

                const liquidity = major.includes(pair) ? 'major' : minor.includes(pair) ? 'minor' : 'exotic';
                const spread = liquidity === 'major' ? 0.8 : liquidity === 'minor' ? 1.5 : 3.0;

                const riskResult = calculateForexRisk({
                    atrVolatility: technicals?.atr || 0.001,
                    leverage: userProfile.riskTolerance === 'low' ? 10 : userProfile.riskTolerance === 'medium' ? 50 : 100,
                    liquidity,
                    trendStrength: technicals?.trendStrength || 0,
                    spreadPips: spread,
                });

                const oldRate = quote.pc || quote.c;
                const pipMovement = calculatePipMovement(oldRate, quote.c, pair);

                forexRecommendations.push({
                    pair: pair.replace('_', '/'),
                    rate: quote.c,
                    change24h: quote.dp || 0,
                    pipMovement: `${pipMovement >= 0 ? '+' : ''}${pipMovement} pips`,
                    riskScore: riskResult.score,
                    riskLevel: riskResult.level,
                    spread: `${spread} pips`,
                    projectedPips: `+${Math.round(Math.abs(technicals?.trendStrength || 5) * 10)} pips (1W)`,
                    reason: riskResult.recommendation,
                    matchScore: 0,
                });
            } catch (error) {
                console.error(`Error analyzing ${pair}:`, error);
                continue;
            }
        }

        const personalizedRecommendations = personalizeForexRecommendations(
            forexRecommendations,
            {
                riskTolerance: userProfile.riskTolerance || 'medium',
                investmentHorizon: userProfile.investmentHorizon || 'medium',
                investmentAmount: userProfile.investmentAmount || 10000,
                preferredAssets: userProfile.preferredAssets || 'both',
            }
        );

        const topRecommendations = personalizedRecommendations.slice(0, 10);

        await supabase.from('forex_recommendations').upsert({
            user_id: user.id,
            pairs: topRecommendations,
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            recommendations: topRecommendations,
            count: topRecommendations.length,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error generating forex recommendations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate forex recommendations' },
            { status: 500 }
        );
    }
}
