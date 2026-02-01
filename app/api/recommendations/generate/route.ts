import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongodb/connection';
import { UserRecommendation } from '@/lib/mongodb/models';
import { FinnhubClient } from '@/lib/finnhub/client';
import { personalizeStockRecommendations } from '@/lib/analysis/personalizer';
import { processStock, batchProcess } from '@/lib/analysis/engine';

export async function POST(request: Request) {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get user profile from Supabase
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

        // 3. Connect to MongoDB
        await connectDB();

        // 4. Get trending stocks
        const trendingStocks = await FinnhubClient.getTrendingStocks();
        const topStocks = trendingStocks.slice(0, 30); // Analyze top 30 for better performance

        // 5. Analyze stocks in batches
        const stockRecommendations = await batchProcess(
            topStocks,
            (symbol) => processStock(symbol, userProfile),
            5 // Batch size of 5
        );

        // 6. Personalize recommendations
        const personalizedRecommendations = personalizeStockRecommendations(
            stockRecommendations,
            {
                riskTolerance: userProfile.riskTolerance || 'medium',
                investmentHorizon: userProfile.investmentHorizon || 'medium',
                investmentAmount: userProfile.investmentAmount || 10000,
                preferredAssets: userProfile.preferredAssets || 'both',
            }
        );

        // 7. Save to Supabase for realtime updates
        const topRecommendations = personalizedRecommendations.slice(0, 10);

        await supabase.from('recommendations').upsert({
            user_id: user.id,
            stocks: topRecommendations,
            created_at: new Date().toISOString(),
        });

        // 8. Also save to MongoDB
        await UserRecommendation.findOneAndUpdate(
            { userId: user.id },
            {
                userId: user.id,
                stocks: topRecommendations.map(rec => ({
                    symbol: rec.symbol,
                    riskScore: rec.riskScore,
                    projectedReturn: rec.projectedReturn,
                    reason: rec.reason,
                })),
                forexPairs: [],
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            recommendations: topRecommendations,
            count: topRecommendations.length,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve existing recommendations
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: recommendations } = await supabase
            .from('recommendations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!recommendations || recommendations.length === 0) {
            return NextResponse.json({
                success: true,
                recommendations: [],
                message: 'No recommendations yet. Generate your first analysis!',
            });
        }

        return NextResponse.json({
            success: true,
            recommendations: recommendations[0].stocks || [],
            generatedAt: recommendations[0].created_at,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
