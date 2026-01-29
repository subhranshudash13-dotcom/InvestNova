/**
 * Finnhub API Client for real-time stock and forex data
 * Free tier: 60 API calls/minute
 * Documentation: https://finnhub.io/docs/api
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Rate limiter: Track API calls to stay within 60/min limit
let apiCallTimestamps: number[] = [];

function checkRateLimit(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    apiCallTimestamps = apiCallTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    if (apiCallTimestamps.length >= 60) {
        throw new Error('Finnhub API rate limit reached (60 calls/minute). Please try again in a moment.');
    }

    apiCallTimestamps.push(now);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    checkRateLimit();

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Finnhub-Token': FINNHUB_API_KEY,
                },
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                }
                throw new Error(`Finnhub API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

// ============ STOCK API Methods ============

export async function getQuote(symbol: string) {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}`;
    return fetchWithRetry(url);
}

export async function getStockProfile(symbol: string) {
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}`;
    return fetchWithRetry(url);
}

export async function getMarketNews(category = 'general', limit = 10) {
    const url = `${FINNHUB_BASE_URL}/news?category=${category}&minId=0`;
    return fetchWithRetry(url);
}

export async function getNewsSentiment(symbol: string) {
    const url = `${FINNHUB_BASE_URL}/news-sentiment?symbol=${symbol}`;
    return fetchWithRetry(url);
}

export async function getTrendingStocks() {
    // Get top S&P 500 stocks - for demo, using a predefined list
    // In production, you'd fetch from a market data endpoint
    const topStocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
        'META', 'TSLA', 'BRK.B', 'V', 'JNJ',
        'WMT', 'JPM', 'MA', 'PG', 'UNH',
        'DIS', 'HD', 'BAC', 'ADBE', 'CRM',
        'NFLX', 'CMCSA', 'XOM', 'PFE', 'CSCO',
        'VZ', 'INTC', 'T', 'ABT', 'NKE',
        'KO', 'MRK', 'PEP', 'AVGO', 'COST',
        'TMO', 'ACN', 'ABBV', 'MCD', 'DHR',
        'TXN', 'NEE', 'LIN', 'BMY', 'PM',
        'ORCL', 'UNP', 'HON', 'QCOM', 'AMD'
    ];

    return topStocks;
}

export async function getStockCandles(symbol: string, resolution: string = 'D', daysBack: number = 7) {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (daysBack * 24 * 60 * 60);
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`;
    return fetchWithRetry(url);
}

// Calculate technical indicators
export async function getTechnicalIndicators(symbol: string) {
    // Get historical data for calculations
    const candles = await getStockCandles(symbol, 'D', 30);

    if (!candles || candles.s !== 'ok') {
        return null;
    }

    const closes = candles.c;

    // Calculate RSI (14-day)
    const rsi = calculateRSI(closes, 14);

    // Calculate Volatility (30-day standard deviation)
    const volatility = calculateVolatility(closes);

    // Calculate Beta (simplified - would need market data for accurate calculation)
    const beta = 1.0; // Placeholder - requires S&P 500 correlation

    return {
        rsi,
        volatility,
        beta,
    };
}

// ============ FOREX API Methods ============

export async function getForexRates(baseCurrency = 'USD') {
    const url = `${FINNHUB_BASE_URL}/forex/rates?base=${baseCurrency}`;
    return fetchWithRetry(url);
}

export async function getForexCandles(pair: string, resolution: string = '60', daysBack: number = 7) {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (daysBack * 24 * 60 * 60);
    const url = `${FINNHUB_BASE_URL}/forex/candle?symbol=OANDA:${pair}&resolution=${resolution}&from=${from}&to=${to}`;
    return fetchWithRetry(url);
}

export async function getForexSymbols(exchange = 'OANDA') {
    const url = `${FINNHUB_BASE_URL}/forex/symbol?exchange=${exchange}`;
    return fetchWithRetry(url);
}

export async function getMajorForexPairs() {
    // Return major, minor, and exotic forex pairs
    return {
        major: [
            'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF',
            'AUD_USD', 'USD_CAD', 'NZD_USD'
        ],
        minor: [
            'EUR_GBP', 'EUR_AUD', 'GBP_JPY', 'EUR_JPY',
            'GBP_AUD', 'AUD_JPY', 'EUR_CHF'
        ],
        exotic: [
            'USD_TRY', 'USD_ZAR', 'USD_MXN', 'USD_SGD',
            'EUR_TRY', 'GBP_ZAR'
        ]
    };
}

export async function getForexQuote(pair: string) {
    // Finnhub uses OANDA exchange format
    const url = `${FINNHUB_BASE_URL}/quote?symbol=OANDA:${pair}`;
    return fetchWithRetry(url);
}

export async function calculateForexTechnicals(pair: string) {
    const candles = await getForexCandles(pair, '60', 14);

    if (!candles || candles.s !== 'ok') {
        return null;
    }

    const closes = candles.c;
    const highs = candles.h;
    const lows = candles.l;

    // Calculate ATR (Average True Range) - 14 periods
    const atr = calculateATR(highs, lows, closes, 14);

    // Calculate trend strength (ADX would be ideal, simplified here)
    const trendStrength = calculateTrendStrength(closes);

    return {
        atr,
        trendStrength,
        volatility: calculateVolatility(closes),
    };
}

// ============ Helper Functions for Technical Analysis ============

function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Default neutral

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
}

function calculateVolatility(prices: number[]): number {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualized volatility (assuming 252 trading days)
    return stdDev * Math.sqrt(252) * 100;
}

function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    const trueRanges = [];

    for (let i = 1; i < highs.length; i++) {
        const tr = Math.max(
            highs[i] - lows[i],
            Math.abs(highs[i] - closes[i - 1]),
            Math.abs(lows[i] - closes[i - 1])
        );
        trueRanges.push(tr);
    }

    const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    return atr;
}

function calculateTrendStrength(prices: number[]): number {
    if (prices.length < 2) return 0;

    // Simple trend calculation: compare recent prices to earlier prices
    const recent = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const earlier = prices.slice(0, 7).reduce((a, b) => a + b, 0) / 7;

    const change = ((recent - earlier) / earlier) * 100;

    // Return percentage trend strength
    return Math.min(Math.max(change, -10), 10); // Capped at ±10%
}

export const FinnhubClient = {
    // Stock methods
    getQuote,
    getStockProfile,
    getMarketNews,
    getNewsSentiment,
    getTrendingStocks,
    getStockCandles,
    getTechnicalIndicators,

    // Forex methods
    getForexRates,
    getForexCandles,
    getForexSymbols,
    getMajorForexPairs,
    getForexQuote,
    calculateForexTechnicals,
};
