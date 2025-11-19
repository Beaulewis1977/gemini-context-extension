import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ContextTracker } from './tools/context-tracker.js';
import { CostEstimator } from './tools/cost-estimator.js';
import { RepositoryAnalyzer } from './tools/repo-analyzer.js';
import { WikiGenerator } from './tools/wiki-generator.js';
import { RepositorySearch } from './tools/repo-search.js';

const server = new McpServer({
  name: 'gemini-context-extension',
  version: '1.0.0',
});

const contextTracker = new ContextTracker();
const costEstimator = new CostEstimator();
const repoAnalyzer = new RepositoryAnalyzer();

// Initialize WikiGenerator and RepositorySearch with API key from environment
const apiKey = process.env.GEMINI_API_KEY;
const wikiGenerator = apiKey ? new WikiGenerator(apiKey) : null;
const repoSearch = apiKey ? new RepositorySearch(apiKey) : null;

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

      // Generate wiki (now passing repoPath for config loading)
      const wiki = await wikiGenerator.generate(analysis, params.repoPath, {
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

// Repository Indexing Tool (Phase 4)
server.registerTool(
  'index_repository',
  {
    description:
      'Create a searchable semantic index of a repository using embeddings. This enables semantic code search across the entire codebase. Requires GEMINI_API_KEY environment variable.',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository to index'),
      force: z
        .boolean()
        .optional()
        .describe('Force re-indexing even if cache exists (default: false)'),
      maxChunkSize: z
        .number()
        .optional()
        .describe('Maximum chunk size in characters (default: 2000)'),
      model: z.string().optional().describe('Embedding model to use (default: text-embedding-004)'),
    }).shape,
  },
  async (params) => {
    try {
      // Check if repository search is available
      if (!repoSearch) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error:
                  'Repository search not available. Please set GEMINI_API_KEY environment variable.',
                hint: 'Get a free API key at https://aistudio.google.com/app/apikey',
              }),
            },
          ],
        };
      }

      // Index the repository
      const metadata = await repoSearch.indexRepository(params.repoPath, {
        force: params.force ?? false,
        maxChunkSize: params.maxChunkSize,
        model: params.model,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: `Repository indexed successfully`,
                metadata,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      console.error('Indexing error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error:
                error instanceof Error ? error.message : 'Unknown error occurred during indexing',
            }),
          },
        ],
      };
    }
  }
);

// Repository Search Tool (Phase 4)
server.registerTool(
  'search_repository',
  {
    description:
      'Perform semantic search across an indexed repository. Returns code snippets most relevant to your query using AI embeddings. Repository must be indexed first using index_repository.',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to indexed repository'),
      query: z.string().describe('Natural language search query'),
      topK: z.number().optional().describe('Number of results to return (default: 5, max: 20)'),
      minScore: z.number().optional().describe('Minimum similarity score 0-1 (default: 0.5)'),
      includeContext: z
        .boolean()
        .optional()
        .describe('Include surrounding context for results (default: false)'),
    }).shape,
  },
  async (params) => {
    try {
      // Check if repository search is available
      if (!repoSearch) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error:
                  'Repository search not available. Please set GEMINI_API_KEY environment variable.',
              }),
            },
          ],
        };
      }

      // Validate topK
      const topK = Math.min(params.topK || 5, 20);

      // Search the repository
      const results = await repoSearch.search(params.repoPath, params.query, {
        topK,
        minScore: params.minScore,
        includeContext: params.includeContext,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: params.query,
                resultsCount: results.length,
                results: results.map((r) => ({
                  file: r.filePath,
                  lines: `${r.startLine}-${r.endLine}`,
                  language: r.language,
                  similarity: r.score.toFixed(3),
                  content: r.content,
                  ...(r.context && { context: r.context }),
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error:
                error instanceof Error ? error.message : 'Unknown error occurred during search',
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
