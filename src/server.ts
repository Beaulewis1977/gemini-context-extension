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
      'Tracks and analyzes context window usage, showing token counts and capacity utilization',
    inputSchema: z.object({
      mode: z
        .enum(['compact', 'standard', 'detailed'])
        .optional()
        .describe('Output detail level (default: standard)'),
    }).shape,
  },
  async (params) => {
    try {
      const mode = params.mode || 'standard';
      const analysis = await contextTracker.analyze(mode);

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
    description: 'Estimates API costs based on token usage and model pricing, with budget tracking',
    inputSchema: z.object({
      model: z.string().optional().describe('Model name (default: gemini-2.0-flash-exp)'),
      requestCount: z.number().optional().describe('Number of requests to estimate (default: 1)'),
    }).shape,
  },
  async (params) => {
    try {
      const model = params.model || 'gemini-2.0-flash-exp';
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
