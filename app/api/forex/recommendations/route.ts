import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongodb/connection';
import { FinnhubClient } from '@/lib/finnhub/client';
import { personalizeForexRecommendations } from '@/lib/analysis/personalizer';
import { processForexPair, batchProcess } from '@/lib/analysis/engine';

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

        const forexRecommendations = await batchProcess(
            allPairs,
            (pair) => processForexPair(
                pair,
                userProfile,
                major.includes(pair),
                minor.includes(pair)
            ),
            5
        );

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
