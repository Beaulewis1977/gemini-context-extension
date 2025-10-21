import { TokenCounter } from '../utils/token-counter.js';
import { findGeminiDirectory } from '../utils/project-detection.js';
import { promises as fs } from 'fs';
import { join } from 'path';

interface ModelPricing {
  input: number;
  output: number;
  name: string;
  contextWindow: number;
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
  comparison?: Record<string, { perRequest: number; total: number }>;
}

const PRICING: Record<string, ModelPricing> = {
  'gemini-2.0-flash-exp': {
    input: 0.00001,
    output: 0.00003,
    name: 'Gemini 2.0 Flash',
    contextWindow: 1000000,
  },
  'gemini-1.5-pro': {
    input: 0.00125,
    output: 0.005,
    name: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
  },
  'gemini-1.5-flash': {
    input: 0.00001,
    output: 0.00003,
    name: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
  },
};

export class CostEstimator {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  async estimate(
    model: string = 'gemini-2.0-flash-exp',
    requestCount: number = 1
  ): Promise<CostEstimate> {
    const pricing = PRICING[model];
    if (!pricing) {
      throw new Error(`Unknown model: ${model}. Available: ${Object.keys(PRICING).join(', ')}`);
    }

    // Get current context size
    const contextTokens = await this.estimateContextTokens();

    // Estimate average response size (conservative estimate)
    const estimatedResponseTokens = 500;

    // Calculate costs (pricing is per 1k tokens)
    const inputCost = (contextTokens / 1000) * pricing.input;
    const outputCost = (estimatedResponseTokens / 1000) * pricing.output;
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
    for (const [modelName, modelPricing] of Object.entries(PRICING)) {
      if (modelName === model) continue;

      const altInputCost = (contextTokens / 1000) * modelPricing.input;
      const altOutputCost = (estimatedResponseTokens / 1000) * modelPricing.output;
      const altPerRequest = altInputCost + altOutputCost;
      const altTotal = altPerRequest * requestCount;

      estimate.comparison[modelPricing.name] = {
        perRequest: this.roundToCents(altPerRequest),
        total: this.roundToCents(altTotal),
      };
    }

    return estimate;
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
}
