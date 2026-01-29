'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeStock {
    symbol: string;
    price: number;
    change24h: number;
    riskScore: number;
}

export function useRealtimeStocks(userId: string | undefined) {
    const [recommendations, setRecommendations] = useState<RealtimeStock[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        if (!userId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        // Fetch initial recommendations
        const fetchRecommendations = async () => {
            const { data } = await supabase
                .from('recommendations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                setRecommendations(data[0].stocks || []);
            }
            setLoading(false);
        };

        fetchRecommendations();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('recommendations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'recommendations',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (payload.new && (payload.new as any).stocks) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setRecommendations((payload.new as any).stocks);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    return {
        recommendations,
        loading,
    };
}
