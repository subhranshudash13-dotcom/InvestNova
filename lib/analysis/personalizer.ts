/**
 * Personalization Engine
 * Ranks stocks and forex pairs based on user preferences
 */

import { StockRiskResult, ForexRiskResult } from './riskCalculator';

export interface UserProfile {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentHorizon: 'short' | 'medium' | 'long'; // days, weeks, months
    investmentAmount: number;
    preferredAssets?: 'stocks' | 'forex' | 'both';
}

export interface StockRecommendation {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    projectedReturn: number;
    timeframe: string;
    reason: string;
    matchScore: number; // How well it matches user profile (0-100)
}

export interface ForexRecommendation {
    pair: string;
    rate: number;
    change24h: number;
    pipMovement: string;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    spread: string;
    projectedPips: string;
    reason: string;
    matchScore: number;
}

/**
 * Calculate match score between asset and user profile
 */
function calculateMatchScore(
    assetRiskScore: number,
    assetType: 'stock' | 'forex',
    userProfile: UserProfile
): number {
    let matchScore = 100;

    // Risk tolerance matching
    if (userProfile.riskTolerance === 'low') {
        if (assetRiskScore < 30) matchScore += 20;
        else if (assetRiskScore > 70) matchScore -= 40;
        else matchScore -= 10;
    } else if (userProfile.riskTolerance === 'medium') {
        if (assetRiskScore >= 30 && assetRiskScore <= 70) matchScore += 20;
        else matchScore -= 10;
    } else {
        // high risk tolerance
        if (assetRiskScore > 50) matchScore += 20;
        else matchScore -= 5;
    }

    // Investment horizon matching
    if (userProfile.investmentHorizon === 'short') {
        // Short-term traders prefer forex or volatile stocks
        if (assetType === 'forex') matchScore += 15;
        if (assetRiskScore > 40) matchScore += 10; // Higher volatility for trading
    } else if (userProfile.investmentHorizon === 'long') {
        // Long-term investors prefer stable stocks
        if (assetType === 'stock') matchScore += 15;
        if (assetRiskScore < 50) matchScore += 10; // Lower risk for long-term
    }

    // Asset preference
    if (userProfile.preferredAssets) {
        if (userProfile.preferredAssets === assetType) matchScore += 10;
        else if (userProfile.preferredAssets !== 'both') matchScore -= 5;
    }

    return Math.min(Math.max(matchScore, 0), 100);
}

/**
 * Personalize and rank stock recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function personalizeStockRecommendations(
    stocks: any[],
    userProfile: UserProfile
): StockRecommendation[] {
    const recommendations = stocks.map((stock) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchScore = calculateMatchScore((stock as any).riskScore, 'stock', userProfile);

        return {
            ...stock,
            matchScore,
        };
    });

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Personalize and rank forex recommendations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function personalizeForexRecommendations(
    forexPairs: any[],
    userProfile: UserProfile
): ForexRecommendation[] {
    const recommendations = forexPairs.map((pair) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchScore = calculateMatchScore((pair as any).riskScore, 'forex', userProfile);

        return {
            ...pair,
            matchScore,
        };
    });

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generate balanced portfolio recommendation (stocks + forex)
 */
export function generateBalancedPortfolio(
    stocks: StockRecommendation[],
    forexPairs: ForexRecommendation[],
    userProfile: UserProfile
): {
    stocks: StockRecommendation[];
    forex: ForexRecommendation[];
    allocation: {
        stocks: number;
        forex: number;
        cash: number;
    };
} {
    let stockAllocation = 60;
    let forexAllocation = 30;
    let cashAllocation = 10;

    // Adjust allocation based on profile
    if (userProfile.riskTolerance === 'low') {
        stockAllocation = 70;
        forexAllocation = 15;
        cashAllocation = 15;
    } else if (userProfile.riskTolerance === 'high') {
        stockAllocation = 40;
        forexAllocation = 50;
        cashAllocation = 10;
    }

    if (userProfile.investmentHorizon === 'short') {
        // Short-term: more forex for day trading
        forexAllocation += 10;
        stockAllocation -= 10;
    } else if (userProfile.investmentHorizon === 'long') {
        // Long-term: more stocks
        stockAllocation += 10;
        forexAllocation -= 10;
    }

    return {
        stocks: stocks.slice(0, 5),
        forex: forexPairs.slice(0, 3),
        allocation: {
            stocks: stockAllocation,
            forex: forexAllocation,
            cash: cashAllocation,
        },
    };
}
