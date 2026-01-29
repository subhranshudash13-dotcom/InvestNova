import Hero from '@/components/landing/Hero';
import AnimatedStats from '@/components/landing/AnimatedStats';
import StockTicker from '@/components/landing/StockTicker';
import { NewsTicker } from '@/components/features/NewsTicker';
import Features from '@/components/landing/Features';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Navbar />
      <Hero />
      <NewsTicker />
      <Features />
      <AnimatedStats />
      <StockTicker />

      {/* Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          ⚠️ <strong>Disclaimer:</strong> InvestNova provides AI-generated insights based on public data and is NOT financial advice.
          Past performance does not guarantee future results. Always consult a licensed financial advisor before making investment decisions.
          Trade at your own risk.
        </p>
      </div>
    </div>
  );
}
