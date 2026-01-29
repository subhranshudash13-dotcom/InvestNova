"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
    { name: "Safe", value: 30 },
    { name: "Moderate", value: 40 },
    { name: "Risky", value: 30 },
];

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

import { useState, useEffect } from "react";

export function RiskGauge({ score }: { score: number }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[200px] w-full animate-pulse bg-muted rounded-full opacity-20" />;

    // Calculate needle rotation (-90 to 90 degrees)
    const rotation = -90 + (score / 100) * 180;

    return (
        <div className="relative h-[200px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Needle */}
            <div
                className="absolute bottom-0 left-1/2 w-1 h-[90px] bg-foreground origin-bottom transition-all duration-1000 ease-out z-10"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground rounded-full" />
            </div>

            {/* Center Pivot */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-foreground rounded-full z-20" />

            <div className="absolute top-1/2 mt-8 text-center">
                <span className="text-3xl font-bold">{score}</span>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Risk Score</div>
            </div>
        </div>
    );
}
