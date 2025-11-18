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
  'gemini-3-pro-preview': { name: 'Gemini 3 Pro (Preview)', contextWindow: 1000000 },
  'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash (Experimental)', contextWindow: 1000000 },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', contextWindow: 2000000 },
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', contextWindow: 1000000 },
};

/**
 * Tracks context window usage for Gemini models.
 *
 * Uses Gemini API countTokens when available for accurate counts.
 * Falls back to heuristic estimation (~3.5 chars/token) when API is unavailable.
 *
 * To enable API-based counting, set GEMINI_API_KEY environment variable.
 */
export class ContextTracker {
  private tokenCounter: TokenCounter;

  constructor() {
    this.tokenCounter = new TokenCounter();
  }

  async analyze(
    mode: string = 'standard',
    modelId: string = 'gemini-2.5-flash'
  ): Promise<ContextAnalysis> {
    // Validate mode
    const validModes = ['compact', 'standard', 'detailed'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid analysis mode: ${mode}. Valid modes are: ${validModes.join(', ')}`);
    }

    const geminiDir = await findGeminiDirectory();

    // Get model info
    const modelInfo = MODEL_CONTEXT_WINDOWS[modelId] || MODEL_CONTEXT_WINDOWS['gemini-2.5-flash'];

    // System and built-in tool token counts
    // Note: These are conservative estimates. For exact counts, these would need
    // to be measured from actual Gemini system prompts
    const systemContext = 12000;
    const builtInTools = 18000;

    // Count MCP servers, extensions, and context files
    // Uses Gemini API when available for accurate counts
    const mcpServers = await this.countMcpServerTokens(geminiDir, modelId);
    const extensions = await this.countExtensionTokens(geminiDir, modelId);
    const contextFiles = await this.countContextFileTokens(geminiDir, modelId);

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

  private async countMcpServerTokens(geminiDir: string | null, _modelId: string): Promise<number> {
    if (!geminiDir) return 0;

    try {
      const settingsPath = join(geminiDir, 'settings.json');
      const settingsContent = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);

      if (!settings.mcpServers) return 0;

      // Estimate ~5k tokens per MCP server
      // This is a rough estimate for server configuration and tool definitions
      // Actual token usage may vary significantly based on tool complexity
      const serverCount = Object.keys(settings.mcpServers).length;
      return serverCount * 5000;
    } catch (error) {
      // Differentiate between file-not-found and other errors
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Settings file doesn't exist - this is expected in some cases
        return 0;
      }
      // Log other errors but don't fail
      console.warn('Error reading MCP server settings:', error);
      return 0;
    }
  }

  private async countExtensionTokens(geminiDir: string | null, modelId: string): Promise<number> {
    if (!geminiDir) return 0;

    try {
      const extensionsDir = join(dirname(geminiDir), 'extensions');
      const extensions = await fs.readdir(extensionsDir);

      // Collect all extension context files
      const contents: string[] = [];
      for (const ext of extensions) {
        const contextFile = join(extensionsDir, ext, 'GEMINI.md');
        try {
          const content = await fs.readFile(contextFile, 'utf-8');
          contents.push(content);
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
            console.warn(`Error reading extension context file ${contextFile}:`, error);
          }
          // No context file or read error - skip this extension
        }
      }

      // Use batch counting for efficiency
      if (contents.length === 0) return 0;
      return await this.tokenCounter.countBatch(contents, modelId);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Extensions directory doesn't exist
        return 0;
      }
      console.warn('Error reading extensions directory:', error);
      return 0;
    }
  }

  private async countContextFileTokens(geminiDir: string | null, modelId: string): Promise<number> {
    if (!geminiDir) return 0;

    const contents: string[] = [];
    let currentDir = geminiDir;

    // Walk up directory tree and collect all context files
    while (currentDir) {
      try {
        const contextFile = join(currentDir, 'GEMINI.md');
        const content = await fs.readFile(contextFile, 'utf-8');
        contents.push(content);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
          console.warn(`Error reading context file at ${currentDir}:`, error);
        }
        // No context file at this level or read error - continue
      }

      const parent = dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }

    // Use batch counting for efficiency
    if (contents.length === 0) return 0;
    return await this.tokenCounter.countBatch(contents, modelId);
  }

  private async getDetailedBreakdown(
    geminiDir: string | null,
    contextWindow: number
  ): Promise<Record<string, unknown>> {
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
      recommendations.push(
        'You are using Gemini 1.5 Pro with a 2M token context window - ideal for large codebases'
      );
    } else if (contextWindow === 1000000) {
      recommendations.push(
        'Consider Gemini 1.5 Pro for 2M token context if you need more capacity'
      );
    }

    details.recommendations = recommendations;
    return details;
  }
}
