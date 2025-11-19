import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ContextTracker } from './tools/context-tracker.js';
import { CostEstimator } from './tools/cost-estimator.js';
import { RepositoryAnalyzer } from './tools/repo-analyzer.js';
import { WikiGenerator } from './tools/wiki-generator.js';

const server = new McpServer({
  name: 'gemini-context-extension',
  version: '1.0.0',
});

const contextTracker = new ContextTracker();
const costEstimator = new CostEstimator();
const repoAnalyzer = new RepositoryAnalyzer();

// Initialize WikiGenerator with API key from environment
const apiKey = process.env.GEMINI_API_KEY;
const wikiGenerator = apiKey ? new WikiGenerator(apiKey) : null;

// Context Window Tracker Tool
server.registerTool(
  'track_context_usage',
  {
    description:
      'Tracks and analyzes context window usage, showing token counts and capacity utilization for any Gemini model',
    inputSchema: z.object({
      mode: z
        .enum(['compact', 'standard', 'detailed'])
        .optional()
        .describe('Output detail level (default: standard)'),
      model: z
        .string()
        .optional()
        .describe(
          'Model to analyze context for (default: gemini-2.5-flash). Available: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3-pro-preview, gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash'
        ),
    }).shape,
  },
  async (params) => {
    try {
      const mode = params.mode || 'standard';
      const model = params.model || 'gemini-2.5-flash';
      const analysis = await contextTracker.analyze(mode, model);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }
);

// Cost Estimator Tool
server.registerTool(
  'estimate_api_cost',
  {
    description:
      'Estimates API costs based on token usage and model pricing, with budget tracking and recommendations',
    inputSchema: z.object({
      model: z
        .string()
        .optional()
        .describe(
          'Model name (default: gemini-2.5-flash). Available: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3-pro-preview, gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash'
        ),
      requestCount: z.number().optional().describe('Number of requests to estimate (default: 1)'),
    }).shape,
  },
  async (params) => {
    try {
      const model = params.model || 'gemini-2.5-flash';
      const requestCount = params.requestCount || 1;
      const estimate = await costEstimator.estimate(model, requestCount);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(estimate, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }
);

// Model Comparison Tool
server.registerTool(
  'compare_gemini_models',
  {
    description:
      'Compare all available Gemini models showing pricing, context windows, and cost estimates for current usage',
    inputSchema: z.object({}).shape,
  },
  async () => {
    try {
      const models = costEstimator.getAllModels();
      const contextTokens = await contextTracker.analyze('compact');

      // Calculate cost for each model using current context
      const comparison = await Promise.all(
        models.map(async (model) => {
          try {
            const estimate = await costEstimator.estimate(model.id, 1);
            return {
              ...model,
              currentUsage: {
                contextTokens: estimate.contextTokens,
                costPerRequest: estimate.costs.perRequest,
                inputCost: estimate.breakdown.inputCost,
                outputCost: estimate.breakdown.outputCost,
              },
            };
          } catch {
            return {
              ...model,
              currentUsage: {
                contextTokens: 0,
                costPerRequest: 0,
                inputCost: 0,
                outputCost: 0,
              },
            };
          }
        })
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                timestamp: new Date().toISOString(),
                currentContextTokens: contextTokens.usage.used,
                models: comparison.sort(
                  (a, b) => a.currentUsage.costPerRequest - b.currentUsage.costPerRequest
                ),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }
);

// Repository Analyzer Tool
server.registerTool(
  'analyze_repository',
  {
    description:
      'Analyze repository structure, tech stack, and statistics. Detects languages, frameworks, dependencies, and provides comprehensive codebase insights without using AI.',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository to analyze'),
      includeStats: z
        .boolean()
        .optional()
        .describe('Include detailed statistics like line counts (default: true)'),
      maxDepth: z.number().optional().describe('Maximum directory depth to scan (default: 10)'),
    }).shape,
  },
  async (params) => {
    try {
      const analysis = await repoAnalyzer.analyze(params.repoPath, {
        includeStats: params.includeStats ?? true,
        maxDepth: params.maxDepth ?? 10,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }
);

// Wiki Generator Tool
server.registerTool(
  'generate_repository_wiki',
  {
    description:
      'Generate comprehensive wiki documentation for a repository using Gemini AI. Analyzes the codebase and creates detailed documentation sections including overview, architecture, setup guides, and Mermaid diagrams. Requires GEMINI_API_KEY environment variable.',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      model: z
        .string()
        .optional()
        .describe(
          'Gemini model to use (default: gemini-2.5-flash). Options: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-1.5-pro, gemini-1.5-flash'
        ),
      sections: z
        .array(z.string())
        .optional()
        .describe(
          'Specific sections to generate (default: all). Options: overview, architecture, setup, development, api, testing'
        ),
      includeDiagrams: z.boolean().optional().describe('Include Mermaid diagrams (default: true)'),
      outputFormat: z
        .enum(['json', 'markdown'])
        .optional()
        .describe(
          'Output format: json (structured data) or markdown (compiled document). Default: markdown'
        ),
    }).shape,
  },
  async (params) => {
    try {
      // Check if wiki generator is available
      if (!wikiGenerator) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error:
                  'Wiki generator not available. Please set GEMINI_API_KEY environment variable to enable wiki generation.',
                hint: 'Get a free API key at https://aistudio.google.com/app/apikey',
              }),
            },
          ],
        };
      }

      // First analyze the repository
      const analysis = await repoAnalyzer.analyze(params.repoPath, {
        includeStats: true,
        maxDepth: 10,
      });

      // Generate wiki
      const wiki = await wikiGenerator.generate(analysis, {
        model: params.model,
        sections: params.sections,
        includeDiagrams: params.includeDiagrams ?? true,
      });

      // Return in requested format
      const outputFormat = params.outputFormat || 'markdown';
      const output =
        outputFormat === 'markdown'
          ? wikiGenerator.compileMarkdown(wiki)
          : JSON.stringify(wiki, null, 2);

      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      };
    } catch (error) {
      // Log detailed error server-side
      console.error('Wiki generation error:', error);

      // Return sanitized error to client
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred during wiki generation',
            }),
          },
        ],
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini Context Extension MCP server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
