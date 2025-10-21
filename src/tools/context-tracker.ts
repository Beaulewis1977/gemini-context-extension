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

export class ContextTracker {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  async analyze(mode: string = 'standard'): Promise<ContextAnalysis> {
    const geminiDir = await findGeminiDirectory();

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
    const total = 1000000; // 1M token window for gemini-2.0-flash-exp
    const percentage = Math.round((used / total) * 100);
    const available = total - used;

    const analysis: ContextAnalysis = {
      model: 'gemini-2.0-flash-exp',
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
      analysis.details = await this.getDetailedBreakdown(geminiDir);
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

  private async getDetailedBreakdown(geminiDir: string | null): Promise<Record<string, unknown>> {
    const details: Record<string, unknown> = {
      recommendations: [],
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

    details.recommendations = recommendations;
    return details;
  }
}
