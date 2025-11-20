# MCP Integration

How the extension integrates with the Model Context Protocol.

## MCP Protocol

The Model Context Protocol (MCP) enables Claude Desktop to communicate with external servers that provide tools and context.

### Transport Layer

**Protocol**: stdio (standard input/output)
**Format**: JSON-RPC 2.0

```typescript
// src/server.ts
const server = new McpServer({
  name: 'gemini-context-extension',
  version: '1.0.0',
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Tool Registration

Each tool is registered with:
1. **Name**: Unique identifier
2. **Description**: What the tool does
3. **Input Schema**: Zod validation schema
4. **Handler**: Async function that executes the tool

```typescript
server.registerTool(
  'analyze_repository',
  {
    description: 'Analyze repository structure...',
    inputSchema: z.object({
      repoPath: z.string(),
      includeStats: z.boolean().optional(),
      maxDepth: z.number().optional(),
    }).shape,
  },
  async (params) => {
    const analysis = await repoAnalyzer.analyze(params.repoPath, params);
    return {
      content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }],
    };
  }
);
```

## Request/Response Flow

1. **User prompt** → Claude Desktop
2. **Claude decides** to use tool
3. **MCP request** → Extension (via stdio)
4. **Tool executes** → Returns JSON
5. **MCP response** → Claude Desktop
6. **Claude interprets** and responds to user

## Error Handling

All tools use try-catch with standardized error responses:

```typescript
try {
  // Tool logic
} catch (error) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }]
  };
}
```

## Manifest File

`gemini-extension.json`:
```json
{
  "manifestVersion": 1,
  "name": "gemini-context-extension",
  "version": "1.0.0",
  "main": "dist/server.js",
  "runtime": "node",
  "mcp": { "protocol": "stdio" }
}
```

See [MCP Specification](https://modelcontextprotocol.io) for protocol details.
