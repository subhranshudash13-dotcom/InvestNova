"use client";

import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { useState, useEffect } from "react";

const data = [
    { date: "Jan", open: 120, high: 140, low: 110, close: 135 },
    { date: "Feb", open: 135, high: 155, low: 130, close: 145 },
    { date: "Mar", open: 145, high: 150, low: 135, close: 142 },
    { date: "Apr", open: 142, high: 148, low: 120, close: 125 },
    { date: "May", open: 125, high: 130, low: 115, close: 118 },
    { date: "Jun", open: 118, high: 135, low: 115, close: 130 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const { open, high, low, close } = payload[0].payload;
        return (
            <div className="glass-panel p-3 text-xs">
                <p className="font-bold mb-1">{label}</p>
                <p className="text-green-500">High: {high}</p>
                <p className="text-blue-500">Open: {open}</p>
                <p className="text-purple-500">Close: {close}</p>
                <p className="text-red-500">Low: {low}</p>
            </div>
        );
    }
    return null;
};

export function CandlestickChart() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />;

    // Preparing data for the specialized range bar trick in Recharts
    // Bar represents the body (Open-Close), ErrorBar or Line could represent wicks
    // Minimalist approach: Using Bar for body and Line for trend

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="var(--foreground)" opacity={0.5} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} domain={['auto', 'auto']} stroke="var(--foreground)" opacity={0.5} />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Trend Line */}
                    <Line
                        type="monotone"
                        dataKey="close"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                    />

                    {/* Volume/Movement Bars */}
                    <Bar dataKey="close" barSize={20} fillOpacity={0.3}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#10B981' : '#EF4444'} />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
