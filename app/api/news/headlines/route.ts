import { NextResponse } from 'next/server';
import { FinnhubClient } from '@/lib/finnhub/client';

export async function GET() {
    try {
        const news = await FinnhubClient.getMarketNews('general', 15);

        if (!news || !Array.isArray(news)) {
            return NextResponse.json({ success: false, headlines: [] });
        }

        const headlines = news.map((item: { id: string; headline: string; related: string; url: string; datetime: number }) => ({
            id: item.id,
            headline: item.headline,
            symbol: item.related || 'MARKET',
            sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish', // Simple sentiment for demo
            impact: Math.floor(Math.random() * (95 - 40) + 40),      // Impact score
            url: item.url,
            time: new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return NextResponse.json({
            success: true,
            headlines,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return NextResponse.json({ success: false, headlines: [] }, { status: 500 });
    }
}
