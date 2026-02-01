import { FinnhubClient } from '@/lib/finnhub/client';
import { calculateStockRisk, calculateDrawdown, estimateProjectedReturn, calculateForexRisk, calculatePipMovement } from './riskCalculator';
import { computeConfidenceScore, simulateBacktestPerformance } from './accuracy';
import { Stock } from '@/lib/mongodb/models';

export interface AnalysisOptions {
    riskTolerance: string;
    investmentHorizon: string;
}

/**
 * Process a single stock for recommendation
 */
export async function processStock(symbol: string, userProfile: { investmentHorizon?: string }) {
    // Check MongoDB cache first
    const cachedStock = await Stock.findOne({ symbol });
    const isExpired = !cachedStock || (Date.now() - new Date(cachedStock.updatedAt).getTime()) > 300000;

    let stockData;

    if (isExpired) {
        // Cache expired or not found, fetch fresh data
        const [quote, profile, technicals, sentiment] = await Promise.all([
            FinnhubClient.getQuote(symbol),
            FinnhubClient.getStockProfile(symbol),
            FinnhubClient.getTechnicalIndicators(symbol),
            FinnhubClient.getNewsSentiment(symbol),
        ]);

        if (!quote || !profile || !technicals || quote.c === 0) {
            return null; // Skip if data unavailable
        }

        const candles = await FinnhubClient.getStockCandles(symbol, 'D', 30);
        const drawdown = candles && candles.c ? calculateDrawdown(candles.c) : -5;

        stockData = {
            symbol,
            name: profile.name || symbol,
            price: quote.c,
            volume: quote.v || 0,
            change24h: quote.dp || 0,
            technicals: {
                rsi: technicals.rsi || 50,
                volatility: technicals.volatility || 25,
                beta: technicals.beta || 1.0,
            },
            sentiment: sentiment?.sentiment || 0,
            drawdown,
            prevClose: quote.pc || quote.c
        };

        // Update MongoDB cache
        await Stock.findOneAndUpdate(
            { symbol },
            {
                symbol: stockData.symbol,
                name: stockData.name,
                price: stockData.price,
                volume: stockData.volume,
                change24h: stockData.change24h,
                technicals: stockData.technicals,
                sentiment: stockData.sentiment,
            },
            { upsert: true }
        );
    } else {
        stockData = {
            symbol: cachedStock.symbol,
            name: cachedStock.name,
            price: cachedStock.price,
            volume: cachedStock.volume,
            change24h: cachedStock.change24h,
            technicals: cachedStock.technicals,
            sentiment: cachedStock.sentiment,
            drawdown: -5, // Default if cached
            prevClose: cachedStock.price / (1 + cachedStock.change24h / 100)
        };
    }

    const perf = simulateBacktestPerformance(stockData.symbol, 'mean-reversion');

    const riskResult = calculateStockRisk({
        volatility: stockData.technicals.volatility,
        beta: stockData.technicals.beta,
        rsi: stockData.technicals.rsi,
        drawdown: stockData.drawdown,
        sentiment: stockData.sentiment,
    });

    const projectedReturn = estimateProjectedReturn(
        stockData.price,
        stockData.technicals.volatility,
        stockData.technicals.rsi,
        userProfile.investmentHorizon || 'medium'
    );

    const confidenceScore = computeConfidenceScore({
        rsi: stockData.technicals.rsi,
        volatility: stockData.technicals.volatility,
        sentiment: stockData.sentiment,
        historicalWinRate: perf.successRate,
        sampleSize: perf.sampleSize
    });

    return {
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        change24h: stockData.change24h,
        riskScore: riskResult.score,
        riskLevel: riskResult.level,
        projectedReturn,
        timeframe: userProfile.investmentHorizon === 'short' ? '1W' : userProfile.investmentHorizon === 'medium' ? '1M' : '3M',
        reason: riskResult.recommendation,
        matchScore: 0,
        confidenceScore,
        historicalAccuracy: `${(perf.successRate * 100).toFixed(1)}% success rate in backtests`,
    };
}

/**
 * Process a single forex pair for recommendation
 */
export async function processForexPair(pair: string, userProfile: { riskTolerance?: string }, isMajor: boolean, isMinor: boolean) {
    const [quote, technicals] = await Promise.all([
        FinnhubClient.getForexQuote(pair),
        FinnhubClient.calculateForexTechnicals(pair),
    ]);

    if (!quote || quote.c === 0) return null;

    const liquidity = isMajor ? 'major' : isMinor ? 'minor' : 'exotic';
    const spread = liquidity === 'major' ? 0.8 : liquidity === 'minor' ? 1.5 : 3.0;

    const riskResult = calculateForexRisk({
        atrVolatility: technicals?.atr || 0.001,
        leverage: userProfile.riskTolerance === 'low' ? 10 : userProfile.riskTolerance === 'medium' ? 50 : 100,
        liquidity,
        trendStrength: technicals?.trendStrength || 0,
        spreadPips: spread,
    });

    const oldRate = quote.pc || quote.c;
    const pipMovement = calculatePipMovement(oldRate, quote.c, pair);

    return {
        pair: pair.replace('_', '/'),
        rate: quote.c,
        change24h: quote.dp || 0,
        pipMovement: `${pipMovement >= 0 ? '+' : ''}${pipMovement} pips`,
        riskScore: riskResult.score,
        riskLevel: riskResult.level,
        spread: `${spread} pips`,
        projectedPips: `+${Math.round(Math.abs(technicals?.trendStrength || 5) * 10)} pips (1W)`,
        reason: riskResult.recommendation,
        matchScore: 0,
    };
}

/**
 * Run tasks in batches to respect rate limits
 */
export async function batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R | null>,
    batchSize: number = 5
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(item => processor(item)));

        for (const res of batchResults) {
            if (res) results.push(res);
        }

        // Small delay between batches to be safe
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}
