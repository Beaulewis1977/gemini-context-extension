import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ContextTracker } from './tools/context-tracker.js';
import { CostEstimator } from './tools/cost-estimator.js';

const server = new McpServer({
  name: 'gemini-context-extension',
  version: '1.0.0',
});

const contextTracker = new ContextTracker();
const costEstimator = new CostEstimator();

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
          'Model to analyze context for (default: gemini-2.5-flash). Available: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash'
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
          'Model name (default: gemini-2.5-flash). Available: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash'
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
