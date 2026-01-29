/**
 * Risk Calculator for Stock Analysis
 * Calculates risk scores (0-100) using weighted formula
 */

export interface StockRiskFactors {
    volatility: number;
    beta: number;
    rsi: number;
    drawdown: number;
    sentiment: number;
}

export interface StockRiskResult {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    breakdown: {
        volatilityScore: number;
        betaScore: number;
        rsiScore: number;
        drawdownScore: number;
        sentimentScore: number;
    };
    recommendation: string;
}

/**
 * Calculate stock risk score (0-100)
 * Risk Score = (Volatility × 0.4) + (Beta × 0.2) + (RSI Factor × 0.1) + (Drawdown × 0.2) + (Sentiment × 0.2)
 * 
 * Categories:
 * - Low Risk: 0-30 (Green)
 * - Medium Risk: 30-70 (Yellow)
 * - High Risk: 70-100 (Red)
 */
export function calculateStockRisk(factors: StockRiskFactors): StockRiskResult {
    // Normalize volatility (0-100 scale, typical range 10-80%)
    const volatilityScore = Math.min((factors.volatility / 80) * 100, 100) * 0.4;

    // Normalize beta (>1.5 = high risk)
    const betaScore = Math.min((factors.beta / 1.5) * 100, 100) * 0.2;

    // RSI Factor: >70 overbought (+risk), <30 oversold (-risk)
    let rsiScore = 0;
    if (factors.rsi > 70) {
        rsiScore = ((factors.rsi - 70) / 30) * 100 * 0.1;
    } else if (factors.rsi < 30) {
        rsiScore = 0; // Low RSI reduces risk
    } else {
        rsiScore = ((factors.rsi - 30) / 40) * 50 * 0.1; // Neutral zone
    }

    // Drawdown score (max loss percentage, normalized)
    const drawdownScore = Math.min((Math.abs(factors.drawdown) / 30) * 100, 100) * 0.2;

    // Sentiment score (Finnhub sentiment: -1 to 1, inverted for risk)
    const sentimentScore = ((1 - factors.sentiment) / 2) * 100 * 0.2;

    const totalScore = Math.min(
        volatilityScore + betaScore + rsiScore + drawdownScore + sentimentScore,
        100
    );

    let level: 'Low' | 'Medium' | 'High';
    let recommendation: string;

    if (totalScore < 30) {
        level = 'Low';
        recommendation = 'Suitable for conservative investors. Stable performance expected.';
    } else if (totalScore < 70) {
        level = 'Medium';
        recommendation = 'Moderate risk. Suitable for balanced portfolios.';
    } else {
        level = 'High';
        recommendation = 'High volatility. Only for risk-tolerant investors.';
    }

    return {
        score: Math.round(totalScore),
        level,
        breakdown: {
            volatilityScore: Math.round(volatilityScore),
            betaScore: Math.round(betaScore),
            rsiScore: Math.round(rsiScore),
            drawdownScore: Math.round(drawdownScore),
            sentimentScore: Math.round(sentimentScore),
        },
        recommendation,
    };
}

/**
 * Forex Risk Calculator
 * Calculates forex pair risk scores using different factors than stocks
 */

export interface ForexRiskFactors {
    atrVolatility: number; // Average True Range
    leverage: number; // Typical leverage (1, 10, 50, 100)
    liquidity: 'major' | 'minor' | 'exotic';
    trendStrength: number; // -10 to +10
    spreadPips: number;
}

export interface ForexRiskResult {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    breakdown: {
        volatilityScore: number;
        leverageScore: number;
        liquidityScore: number;
        trendScore: number;
        spreadScore: number;
    };
    recommendation: string;
}

/**
 * Calculate forex risk score (0-100)
 * Forex Risk Score = (ATR Volatility × 0.35) + (Leverage Risk × 0.25) + (Liquidity × 0.15) + (Trend Strength × 0.15) + (Spread × 0.10)
 * 
 * Categories:
 * - Low Risk: 0-30 (Green) - Major pairs, low volatility
 * - Medium Risk: 30-70 (Yellow) - Cross pairs, moderate volatility
 * - High Risk: 70-100 (Red) - Exotic pairs, high volatility periods
 */
export function calculateForexRisk(factors: ForexRiskFactors): ForexRiskResult {
    // ATR Volatility (normalized to 0-100, higher ATR = higher risk)
    const volatilityScore = Math.min((factors.atrVolatility / 0.05) * 100, 100) * 0.35;

    // Leverage risk (1:1 = low, 1:100 = high)
    const leverageScore = Math.min((factors.leverage / 100) * 100, 100) * 0.25;

    // Liquidity score
    let liquidityScore: number;
    if (factors.liquidity === 'major') {
        liquidityScore = 10 * 0.15; // Low risk
    } else if (factors.liquidity === 'minor') {
        liquidityScore = 50 * 0.15; // Medium risk
    } else {
        liquidityScore = 90 * 0.15; // High risk (exotic)
    }

    // Trend strength (strong trends = lower risk, ranging = higher risk)
    const trendScore = ((10 - Math.abs(factors.trendStrength)) / 10) * 100 * 0.15;

    // Spread score (tight spread = low risk, wide = high risk)
    const spreadScore = Math.min((factors.spreadPips / 5) * 100, 100) * 0.10;

    const totalScore = Math.min(
        volatilityScore + leverageScore + liquidityScore + trendScore + spreadScore,
        100
    );

    let level: 'Low' | 'Medium' | 'High';
    let recommendation: string;

    if (totalScore < 30) {
        level = 'Low';
        recommendation = 'Major pair with tight spread. Good for beginners.';
    } else if (totalScore < 70) {
        level = 'Medium';
        recommendation = 'Moderate risk. Suitable for experienced traders.';
    } else {
        level = 'High';
        recommendation = 'High volatility. Only for expert traders with risk management.';
    }

    return {
        score: Math.round(totalScore),
        level,
        breakdown: {
            volatilityScore: Math.round(volatilityScore),
            leverageScore: Math.round(leverageScore),
            liquidityScore: Math.round(liquidityScore),
            trendScore: Math.round(trendScore),
            spreadScore: Math.round(spreadScore),
        },
        recommendation,
    };
}

/**
 * Helper: Calculate drawdown from price history
 */
export function calculateDrawdown(prices: number[]): number {
    let maxPrice = prices[0];
    let maxDrawdown = 0;

    for (const price of prices) {
        if (price > maxPrice) {
            maxPrice = price;
        }
        const drawdown = ((price - maxPrice) / maxPrice) * 100;
        if (drawdown < maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
}

/**
 * Helper: Estimate projected return based on momentum and volatility
 */
export function estimateProjectedReturn(
    currentPrice: number,
    volatility: number,
    rsi: number,
    timeframe: 'short' | 'medium' | 'long'
): number {
    // Simple projection based on RSI momentum and volatility
    const momentumFactor = (rsi - 50) / 50; // -1 to 1
    const timeFactor = timeframe === 'short' ? 1 : timeframe === 'medium' ? 1.5 : 2;

    // Expected return = momentum × volatility × time factor
    const projectedReturn = momentumFactor * (volatility / 100) * timeFactor * 100;

    return Math.round(projectedReturn * 10) / 10; // Round to 1 decimal
}

/**
 * Helper: Calculate pip movement for forex
 */
export function calculatePipMovement(oldRate: number, newRate: number, pairType: string): number {
    // Most pairs: 1 pip = 0.0001
    // JPY pairs: 1 pip = 0.01
    const isJPYPair = pairType.includes('JPY');
    const pipSize = isJPYPair ? 0.01 : 0.0001;

    const pips = (newRate - oldRate) / pipSize;
    return Math.round(pips);
}
