"use client";

import { motion } from "framer-motion";
import {
    Cpu,
    Activity,
    LayoutDashboard,
    Zap,
    ShieldCheck,
    LineChart,
    Globe as GlobeIcon
} from "lucide-react";

const features = [
    {
        title: "AI Analysis Engine",
        description: "Sophisticated algorithms scan millions of data points to identify high-probability trading setups.",
        icon: Cpu,
        color: "text-blue-500",
        delay: 0.1
    },
    {
        title: "Real-Time Signals",
        description: "Receive instant buy/sell alerts with clear entry, target, and stop-loss levels.",
        icon: Activity,
        color: "text-yellow-500",
        delay: 0.2
    },
    {
        title: "Risk Management",
        description: "Automated risk assessment scores help you protect your capital and manage portfolio exposure.",
        icon: ShieldCheck,
        color: "text-green-500",
        delay: 0.3
    },
    {
        title: "Global Markets",
        description: "Unified coverage across major Stock exchanges and Forex currency pairs in one dashboard.",
        icon: GlobeIcon,
        color: "text-purple-500",
        delay: 0.4
    },
    {
        title: "Predictive Analytics",
        description: "Foresee market shifts before they happen with our backtest-validated predictive models.",
        icon: LineChart,
        color: "text-pink-500",
        delay: 0.5
    },
    {
        title: "Personalized Insights",
        description: "Recommendations tailored specifically to your unique risk tolerance and investment goals.",
        icon: LayoutDashboard,
        color: "text-orange-500",
        delay: 0.6
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        Powerful Tools for <span className="text-gradient">Modern Traders</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Everything you need to analyze, trade, and grow your wealth with confidence.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay }}
                            className="glass-panel group hover:border-primary/50 transition-all p-8 flex flex-col items-start"
                        >
                            <div className={`p-4 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors mb-6`}>
                                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
