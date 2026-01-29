'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrendingUp, BarChart3, Shield } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('@/components/landing/Globe').then(mod => mod.Globe), {
    ssr: false,
    loading: () => <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900 via-black to-purple-900 opacity-20" />
});

export default function Hero() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* 3D Globe Background */}
            <Globe />

            {/* Background Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background -z-10" />

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold tracking-wide uppercase">
                        Next-Gen Trading Intelligence
                    </div>
                    <h1 className="text-5xl md:text-8xl font-extrabold mb-8 tracking-tight">
                        <span className="text-gradient">InvestNova</span>
                    </h1>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 max-w-3xl mx-auto leading-tight">
                        AI Analyzes Stocks & Forex Markets Instantly
                    </p>
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Get Personalized Recommendations with Risk Scores Before You Invest
                    </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="button-primary text-lg px-12 py-5 w-full sm:w-auto"
                    >
                        Start Analyzing Free
                    </button>
                    <button
                        onClick={() => {
                            const featuresSection = document.getElementById('features');
                            featuresSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-12 py-5 rounded-full border border-border bg-background/50 backdrop-blur-md font-semibold hover:bg-muted transition-all w-full sm:w-auto hover:border-primary/30"
                    >
                        View Demo
                    </button>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                    className="flex flex-wrap justify-center gap-4 mt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <div className="glass-panel px-6 py-3 flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Real-Time Data</span>
                    </div>
                    <div className="glass-panel px-6 py-3 flex items-center gap-2 text-sm font-medium">
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        <span>AI-Powered Analysis</span>
                    </div>
                    <div className="glass-panel px-6 py-3 flex items-center gap-2 text-sm font-medium">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Risk Assessment</span>
                    </div>
                </motion.div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
    );
}
