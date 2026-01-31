"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Shield, BarChart3, Rocket, Target, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
    {
        id: 'risk',
        title: 'Define Your Risk Profile',
        description: 'How do you characterize your investment approach?',
        options: [
            { value: 'low', label: 'Conservative', icon: Shield, desc: 'Prioritize capital preservation over high returns.' },
            { value: 'medium', label: 'Balanced', icon: Target, desc: 'A mix of safety and growth potential.' },
            { value: 'high', label: 'Aggressive', icon: Rocket, desc: 'Seeking high returns with significant risk tolerance.' },
        ]
    },
    {
        id: 'horizon',
        title: 'Investment Horizon',
        description: 'How long do you plan to hold your investments?',
        options: [
            { value: 'short', label: 'Short Term', icon: TrendingUp, desc: 'Less than 1 year (Day trading / Swing).' },
            { value: 'medium', label: 'Medium Term', icon: BarChart3, desc: '1 - 5 years (Growth seeking).' },
            { value: 'long', label: 'Long Term', icon: Wallet, desc: '5+ years (Retirement / Wealth building).' },
        ]
    }
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        riskTolerance: '',
        investmentHorizon: '',
        preferredAssets: ['stocks', 'forex'],
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Final Submit
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No user found');

                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: user.user_metadata.full_name || 'Generic User',
                        risk_tolerance: formData.riskTolerance,
                        investment_horizon: formData.investmentHorizon,
                        preferred_assets: formData.preferredAssets,
                        updated_at: new Date().toISOString(),
                    });

                if (error) throw error;

                toast.success('Onboarding complete!');
                router.push('/dashboard');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to save profile';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }
    };

    const step = steps[currentStep];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <TrendingUp className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Welcome to <span className="text-gradient">InvestNova</span></h1>
                    <p className="text-muted-foreground">Tailor your intelligence engine in seconds.</p>
                </div>

                <div className="mb-8 flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-12 rounded-full transition-all ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`}
                        />
                    ))}
                </div>

                <Card className="glass-panel p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
                            <p className="text-muted-foreground mb-8">{step.description}</p>

                            <div className="grid grid-cols-1 gap-4 mb-8">
                                {step.options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFormData({
                                            ...formData,
                                            [step.id === 'risk' ? 'riskTolerance' : 'investmentHorizon']: option.value
                                        })}
                                        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${(step.id === 'risk' ? formData.riskTolerance : formData.investmentHorizon) === option.value
                                                ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                                : 'border-border hover:bg-muted'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-lg ${(step.id === 'risk' ? formData.riskTolerance : formData.investmentHorizon) === option.value
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                            }`}>
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <Button
                                className="w-full h-12 text-lg"
                                onClick={handleNext}
                                disabled={
                                    loading ||
                                    (step.id === 'risk' && !formData.riskTolerance) ||
                                    (step.id === 'horizon' && !formData.investmentHorizon)
                                }
                            >
                                {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Finish Setup' : 'Continue'}
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
