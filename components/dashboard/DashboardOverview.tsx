"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import charts to ensure zero SSR footprint
const RiskGauge = dynamic(() => import('@/components/charts/RiskGauge').then(mod => mod.RiskGauge), {
    ssr: false,
    loading: () => <div className="h-[120px] w-full animate-pulse bg-muted/20 rounded-xl" />
});

const CandlestickChart = dynamic(() => import('@/components/charts/CandlestickChart').then(mod => mod.CandlestickChart), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />
});

const NewsTicker = dynamic(() => import('@/components/features/NewsTicker').then(mod => mod.NewsTicker), {
    ssr: false,
    loading: () => <div className="h-10 w-full bg-muted/20 animate-pulse rounded-full" />
});

interface DashboardOverviewProps {
    user: {
        email?: string | null;
    };
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
    const [recommendations, setRecommendations] = useState<Array<{
        symbol: string;
        name: string;
        price: number;
        change24h: number;
        riskScore: number;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await fetch('/api/recommendations/generate', {
                method: isRefresh ? 'POST' : 'GET',
            });
            const data = await response.json();

            if (data.success) {
                setRecommendations(data.recommendations || []);
                if (isRefresh) toast.success('Market analysis updated');
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to update market data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const topPerformers = recommendations
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5);

    const avgRisk = recommendations.length > 0
        ? Math.round(recommendations.reduce((acc, curr) => acc + curr.riskScore, 0) / recommendations.length)
        : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <NewsTicker />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Market Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time analysis for {user?.email}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 glass-panel hover:bg-primary/10 transition-colors"
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    {refreshing ? 'Analyzing...' : 'Refresh Data'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Portfolio Value</h3>
                    <div className="text-4xl font-bold tracking-tight">$12,450.00</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
                        <span className="bg-green-500/10 px-2 py-0.5 rounded-full">+2.4%</span>
                        <span>vs last month</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl hover:border-primary/50 transition-colors">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Risk Exposure</h3>
                    <div className="h-[120px] -mt-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <RiskGauge score={avgRisk || 65} />
                        )}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Signals</h3>
                        <div className="text-4xl font-bold">{recommendations.length}</div>
                        <p className="text-sm text-muted-foreground mt-1">Opportunities identified</p>
                    </div>
                    <Button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border-0">
                        View Recommendations
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Market Performance</h3>
                        <div className="flex gap-2">
                            {['1D', '1W', '1M', '1Y'].map((tf) => (
                                <button
                                    key={tf}
                                    className="px-3 py-1 text-xs rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CandlestickChart />
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-6">AI Recommendations</h3>
                    <div className="space-y-4">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-16 w-full animate-pulse bg-muted/20 rounded-xl" />
                            ))
                        ) : topPerformers.length > 0 ? (
                            topPerformers.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {stock.symbol}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{stock.symbol}</div>
                                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">${stock.price.toFixed(2)}</div>
                                        <div className={`text-xs ${stock.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stock.change24h >= 0 ? '+' : ''}{stock.change24h.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No recommendations found. Click refresh to analyze the market.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
