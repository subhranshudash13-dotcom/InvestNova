"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    TrendingUp,
    TrendingDown,
    RefreshCcw,
    ShieldCheck,
    AlertTriangle,
    Clock,
    BarChart
} from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
    id: string;
    symbol: string;
    type: 'stock' | 'forex';
    action: 'buy' | 'sell' | 'hold';
    confidence_score: number;
    risk_level: 'low' | 'medium' | 'high';
    price_at_recommendation: number;
    target_price: number;
    stop_loss: number;
    analysis_snippet: string;
    created_at: string;
}

export default function RecommendationsPage() {
    const { user } = useUser();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/api/recommendations/generate', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                // Filter by confidence (Mocked for now, will use accuracy framework)
                setRecommendations(data.recommendations || []);
            }
        } catch (error) {
            toast.error('Failed to load recommendations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) fetchRecommendations();
    }, [user]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRecommendations();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">AI Recommendations</h1>
                        <p className="text-muted-foreground">High-confidence signals based on your risk profile.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[300px] w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
                    <p className="text-muted-foreground">Generated insights with ≥ 85% confidence score.</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2 rounded-full"
                >
                    <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Signals
                </Button>
            </div>

            {recommendations.length === 0 ? (
                <Card className="glass-panel p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <BarChart className="w-12 h-12 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No High-Confidence Signals</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Our engine is scanning the markets. We only show recommendations when the computed confidence exceeds 85%.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec) => (
                        <RecommendationCard key={rec.id} rec={rec} />
                    ))}
                </div>
            )}

            <div className="glass-panel p-6 border-orange-500/20 bg-orange-500/5 rounded-2xl">
                <div className="flex gap-4 items-start">
                    <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-bold text-orange-500 mb-1 uppercase tracking-wider text-[10px]">Prediction Disclaimer</p>
                        InvestNova&apos;s AI recommendations are based on historical patterns and probabilistic modeling. Trading involves significant risk. Past performance is not indicative of future results. Never invest more than you can afford to lose.
                    </div>
                </div>
            </div>
        </div>
    );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
    return (
        <Card className="glass-panel overflow-hidden border-border/50 hover:border-primary/30 transition-all group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-2xl tracking-tighter uppercase">{rec.symbol}</span>
                            <Badge variant="outline" className="text-[10px] uppercase">{rec.type}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(rec.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                    <Badge className={
                        rec.action === 'buy' ? 'bg-green-500 text-white' :
                            rec.action === 'sell' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                    }>
                        {rec.action.toUpperCase()}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Entry Price</div>
                        <div className="font-mono font-bold">${rec.price_at_recommendation.toFixed(rec.type === 'forex' ? 4 : 2)}</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Target</div>
                        <div className="font-mono font-bold text-green-500">${rec.target_price.toFixed(rec.type === 'forex' ? 4 : 2)}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-muted-foreground">Confidence Score</span>
                            <span className="font-bold text-primary">{(rec.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{ width: `${rec.confidence_score * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-3 border border-border/50 rounded-lg bg-background/50">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Risk Level: <span className="text-foreground uppercase">{rec.risk_level}</span></span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-muted/30 border-t border-border/50 group-hover:bg-primary/5 transition-colors">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{rec.analysis_snippet}&quot;
                </p>
            </div>
        </Card>
    );
}
