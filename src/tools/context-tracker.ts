import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { TokenCounter } from '../utils/token-counter.js';
import { findGeminiDirectory } from '../utils/project-detection.js';

export interface ContextAnalysis {
  model: string;
  timestamp: string;
  usage: {
    used: number;
    total: number;
    percentage: number;
    available: number;
  };
  breakdown: {
    systemContext: number;
    builtInTools: number;
    mcpServers: number;
    extensions: number;
    contextFiles: number;
  };
  details?: Record<string, unknown>;
}

interface ModelContextWindow {
  name: string;
  contextWindow: number;
}

const MODEL_CONTEXT_WINDOWS: Record<string, ModelContextWindow> = {
  'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', contextWindow: 1000000 },
  'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', contextWindow: 1000000 },
  'gemini-2.5-flash-lite': { name: 'Gemini 2.5 Flash-Lite', contextWindow: 1000000 },
  'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash (Experimental)', contextWindow: 1000000 },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', contextWindow: 2000000 },
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', contextWindow: 1000000 },
};

export class ContextTracker {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  async analyze(mode: string = 'standard', modelId: string = 'gemini-2.5-flash'): Promise<ContextAnalysis> {
    const geminiDir = await findGeminiDirectory();

    // Get model info
    const modelInfo = MODEL_CONTEXT_WINDOWS[modelId] || MODEL_CONTEXT_WINDOWS['gemini-2.5-flash'];

    // Estimate system context (~12k tokens for base Gemini)
    const systemContext = 12000;

    // Estimate built-in tools (~18k tokens)
    const builtInTools = 18000;

    // Count MCP servers
    const mcpServers = await this.countMcpServerTokens(geminiDir);

    // Count extensions
    const extensions = await this.countExtensionTokens(geminiDir);

    // Count context files
    const contextFiles = await this.countContextFileTokens(geminiDir);

    const used = systemContext + builtInTools + mcpServers + extensions + contextFiles;
    const total = modelInfo.contextWindow;
    const percentage = Math.round((used / total) * 100);
    const available = total - used;

    const analysis: ContextAnalysis = {
      model: modelInfo.name,
      timestamp: new Date().toISOString(),
      usage: {
        used,
        total,
        percentage,
        available,
      },
      breakdown: {
        systemContext,
        builtInTools,
        mcpServers,
        extensions,
        contextFiles,
      },
    };

    if (mode === 'detailed') {
      analysis.details = await this.getDetailedBreakdown(geminiDir, modelInfo.contextWindow);
    }

    return analysis;
  }

  private async countMcpServerTokens(geminiDir: string | null): Promise<number> {
    if (!geminiDir) return 0;

    try {
      const settingsPath = join(geminiDir, 'settings.json');
      const settingsContent = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);

      if (!settings.mcpServers) return 0;

      // Estimate ~5k tokens per MCP server
      const serverCount = Object.keys(settings.mcpServers).length;
      return serverCount * 5000;
    } catch {
      return 0;
    }
  }

  private async countExtensionTokens(geminiDir: string | null): Promise<number> {
    if (!geminiDir) return 0;

    try {
      const extensionsDir = join(dirname(geminiDir), 'extensions');
      const extensions = await fs.readdir(extensionsDir);

      let total = 0;
      for (const ext of extensions) {
        const contextFile = join(extensionsDir, ext, 'GEMINI.md');
        try {
          const content = await fs.readFile(contextFile, 'utf-8');
          total += this.tokenCounter.estimate(content);
        } catch {
          // No context file
        }
      }

      return total;
    } catch {
      return 0;
    }
  }

  private async countContextFileTokens(geminiDir: string | null): Promise<number> {
    if (!geminiDir) return 0;

    let total = 0;
    let currentDir = geminiDir;

    // Walk up directory tree
    while (currentDir) {
      try {
        const contextFile = join(currentDir, 'GEMINI.md');
        const content = await fs.readFile(contextFile, 'utf-8');
        total += this.tokenCounter.estimate(content);
      } catch {
        // No context file at this level
      }

      const parent = dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }

    return total;
  }

  private async getDetailedBreakdown(geminiDir: string | null, contextWindow: number): Promise<Record<string, unknown>> {
    const details: Record<string, unknown> = {
      recommendations: [],
      modelInfo: {
        contextWindow,
        contextWindowFormatted: `${(contextWindow / 1000000).toFixed(1)}M tokens`,
      },
    };

    // Add optimization recommendations
    const recommendations: string[] = [];

    if (geminiDir) {
      try {
        const settingsPath = join(geminiDir, 'settings.json');
        const settingsContent = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsContent);

        if (settings.mcpServers && Object.keys(settings.mcpServers).length > 3) {
          recommendations.push('Consider disabling unused MCP servers to reduce context usage');
        }
      } catch {
        // Ignore
      }
    }

    if (contextWindow === 2000000) {
      recommendations.push('You are using Gemini 1.5 Pro with a 2M token context window - ideal for large codebases');
    } else if (contextWindow === 1000000) {
      recommendations.push('Consider Gemini 1.5 Pro for 2M token context if you need more capacity');
    }

    details.recommendations = recommendations;
    return details;
  }
}
