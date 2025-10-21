import { TokenCounter } from '../utils/token-counter.js';
import { findGeminiDirectory } from '../utils/project-detection.js';
import { promises as fs } from 'fs';
import { join } from 'path';

interface ModelPricing {
  input: number | { small: number; large: number; threshold: number };
  output: number | { small: number; large: number; threshold: number };
  name: string;
  contextWindow: number;
  description: string;
}

interface CostEstimate {
  model: string;
  timestamp: string;
  contextTokens: number;
  estimatedResponseTokens: number;
  costs: {
    perRequest: number;
    totalRequests: number;
    total: number;
  };
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
  comparison?: Record<
    string,
    {
      perRequest: number;
      total: number;
      savings: number;
      savingsPercent: number;
    }
  >;
  recommendations?: string[];
}

const PRICING: Record<string, ModelPricing> = {
  // Gemini 2.5 Series (Latest)
  'gemini-2.5-pro': {
    input: { small: 0.00125, large: 0.0025, threshold: 200000 },
    output: { small: 0.01, large: 0.015, threshold: 200000 },
    name: 'Gemini 2.5 Pro',
    contextWindow: 1000000,
    description: 'Most capable model for complex reasoning and coding tasks',
  },
  'gemini-2.5-flash': {
    input: 0.0003,
    output: 0.0025,
    name: 'Gemini 2.5 Flash',
    contextWindow: 1000000,
    description: 'Balanced speed and performance for everyday tasks',
  },
  'gemini-2.5-flash-lite': {
    input: 0.0001,
    output: 0.0004,
    name: 'Gemini 2.5 Flash-Lite',
    contextWindow: 1000000,
    description: 'Most cost-effective for high-volume tasks',
  },

  // Gemini 2.0 Series
  'gemini-2.0-flash-exp': {
    input: 0.0001,
    output: 0.0004,
    name: 'Gemini 2.0 Flash (Experimental)',
    contextWindow: 1000000,
    description: 'Experimental multimodal model',
  },

  // Gemini 1.5 Series
  'gemini-1.5-pro': {
    input: { small: 0.00125, large: 0.0025, threshold: 128000 },
    output: { small: 0.005, large: 0.01, threshold: 128000 },
    name: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    description: 'High-context model with 2M token window',
  },
  'gemini-1.5-flash': {
    input: { small: 0.000075, large: 0.00015, threshold: 128000 },
    output: { small: 0.0003, large: 0.0006, threshold: 128000 },
    name: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
    description: 'Cost-efficient model with long context support',
  },
};

export class CostEstimator {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  async estimate(
    model: string = 'gemini-2.5-flash',
    requestCount: number = 1
  ): Promise<CostEstimate> {
    const pricing = PRICING[model];
    if (!pricing) {
      const availableModels = Object.keys(PRICING).join(', ');
      throw new Error(`Unknown model: ${model}. Available models: ${availableModels}`);
    }

    // Get current context size
    const contextTokens = await this.estimateContextTokens();

    // Estimate average response size (conservative estimate)
    const estimatedResponseTokens = 500;

    // Calculate costs using dynamic pricing (pricing is per 1M tokens)
    const inputCost = this.calculateCost(contextTokens, pricing.input);
    const outputCost = this.calculateCost(estimatedResponseTokens, pricing.output);
    const perRequest = inputCost + outputCost;
    const total = perRequest * requestCount;

    const estimate: CostEstimate = {
      model: pricing.name,
      timestamp: new Date().toISOString(),
      contextTokens,
      estimatedResponseTokens,
      costs: {
        perRequest: this.roundToCents(perRequest),
        totalRequests: requestCount,
        total: this.roundToCents(total),
      },
      breakdown: {
        inputCost: this.roundToCents(inputCost),
        outputCost: this.roundToCents(outputCost),
      },
    };

    // Add comparison with other models
    estimate.comparison = {};
    const currentTotal = estimate.costs.total;

    for (const [modelName, modelPricing] of Object.entries(PRICING)) {
      if (modelName === model) continue;

      const altInputCost = this.calculateCost(contextTokens, modelPricing.input);
      const altOutputCost = this.calculateCost(estimatedResponseTokens, modelPricing.output);
      const altPerRequest = altInputCost + altOutputCost;
      const altTotal = altPerRequest * requestCount;

      const savings = currentTotal - altTotal;
      const savingsPercent = currentTotal > 0 ? (savings / currentTotal) * 100 : 0;

      estimate.comparison[modelPricing.name] = {
        perRequest: this.roundToCents(altPerRequest),
        total: this.roundToCents(altTotal),
        savings: this.roundToCents(savings),
        savingsPercent: Math.round(savingsPercent),
      };
    }

    // Add recommendations
    estimate.recommendations = this.generateRecommendations(
      model,
      contextTokens,
      estimate.comparison
    );

    return estimate;
  }

  private calculateCost(
    tokens: number,
    pricing: number | { small: number; large: number; threshold: number }
  ): number {
    if (typeof pricing === 'number') {
      // Simple pricing
      return (tokens / 1000000) * pricing;
    } else {
      // Tiered pricing based on threshold
      const rate = tokens <= pricing.threshold ? pricing.small : pricing.large;
      return (tokens / 1000000) * rate;
    }
  }

  private generateRecommendations(
    currentModel: string,
    contextTokens: number,
    comparison: Record<
      string,
      { perRequest: number; total: number; savings: number; savingsPercent: number }
    >
  ): string[] {
    const recommendations: string[] = [];

    // Find the most cost-effective model
    const sortedModels = Object.entries(comparison).sort((a, b) => a[1].total - b[1].total);

    if (sortedModels.length > 0) {
      const cheapest = sortedModels[0];
      if (cheapest[1].savings < 0) {
        // Negative savings means the compared model is cheaper
        recommendations.push(
          `💰 Save ${Math.abs(cheapest[1].savingsPercent)}% by switching to ${cheapest[0]} ($${Math.abs(cheapest[1].savings).toFixed(4)} per request)`
        );
      }
    }

    // Check context window efficiency
    const currentPricing = PRICING[currentModel];
    if (currentPricing && contextTokens < currentPricing.contextWindow * 0.1) {
      recommendations.push(
        `📊 You're using only ${Math.round((contextTokens / currentPricing.contextWindow) * 100)}% of the ${currentPricing.name} context window`
      );
    }

    // Model-specific recommendations
    if (currentModel === 'gemini-2.5-pro' || currentModel === 'gemini-1.5-pro') {
      recommendations.push(
        "⚡ Consider Flash models for faster responses if you don't need advanced reasoning"
      );
    }

    if (contextTokens > 500000) {
      recommendations.push(
        '🔧 Large context detected. Consider using Gemini 1.5 Pro (2M token window) for maximum capacity'
      );
    }

    return recommendations;
  }

  private async estimateContextTokens(): Promise<number> {
    const geminiDir = await findGeminiDirectory();

    // Base system context
    let total = 12000; // System context
    total += 18000; // Built-in tools

    // Add MCP servers
    if (geminiDir) {
      try {
        const settingsPath = join(geminiDir, 'settings.json');
        const settingsContent = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsContent);

        if (settings.mcpServers) {
          const serverCount = Object.keys(settings.mcpServers).length;
          total += serverCount * 5000; // Estimate per server
        }
      } catch {
        // Ignore
      }
    }

    return total;
  }

  private roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // Get all available models with their information
  getAllModels(): Array<{
    id: string;
    name: string;
    contextWindow: number;
    description: string;
    pricing: {
      input: string;
      output: string;
    };
  }> {
    return Object.entries(PRICING).map(([id, pricing]) => ({
      id,
      name: pricing.name,
      contextWindow: pricing.contextWindow,
      description: pricing.description,
      pricing: {
        input: this.formatPricing(pricing.input),
        output: this.formatPricing(pricing.output),
      },
    }));
  }

  private formatPricing(
    pricing: number | { small: number; large: number; threshold: number }
  ): string {
    if (typeof pricing === 'number') {
      return `$${pricing.toFixed(6)}/M tokens`;
    } else {
      return `$${pricing.small.toFixed(6)}/M (≤${(pricing.threshold / 1000).toFixed(0)}k), $${pricing.large.toFixed(6)}/M (>${(pricing.threshold / 1000).toFixed(0)}k)`;
    }
  }
}
