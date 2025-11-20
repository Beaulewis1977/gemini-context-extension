# Architecture Overview

High-level architecture of the Gemini Context Extension.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│           Claude Desktop (Host)                  │
├─────────────────────────────────────────────────┤
│                MCP Protocol                      │
│               (stdio transport)                  │
├─────────────────────────────────────────────────┤
│      Gemini Context Extension (MCP Server)      │
│  ┌───────────────────────────────────────────┐  │
│  │  7 MCP Tools                              │  │
│  │  - track_context_usage                     │  │
│  │  - estimate_api_cost                       │  │
│  │  - compare_gemini_models                   │  │
│  │  - analyze_repository                      │  │
│  │  - generate_repository_wiki                │  │
│  │  - index_repository                        │  │
│  │  - search_repository                       │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Utilities                                 │  │
│  │  - file-scanner                            │  │
│  │  - gemini-client                           │  │
│  │  - token-counter                           │  │
│  │  - code-chunker                            │  │
│  │  - embedding-cache                         │  │
│  │  - prompt-builder                          │  │
│  │  - project-detection                       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      ├──→ File System (read-only)
                      ├──→ Google Gemini API (optional)
                      └──→ Local Cache (.gemini/)
```

## Component Layers

### 1. MCP Server Layer
- Entry point: `src/server.ts`
- Registers 7 tools with MCP SDK
- Handles tool invocations
- Returns JSON responses

### 2. Tools Layer
- **Context Tracker**: Analyzes token usage
- **Cost Estimator**: Calculates API costs
- **Repository Analyzer**: Scans codebases
- **Wiki Generator**: Creates documentation
- **Repository Search**: Semantic code search

### 3. Utilities Layer
- **File Scanner**: Directory traversal, language detection
- **Gemini Client**: API communication wrapper
- **Token Counter**: Estimates/counts tokens
- **Code Chunker**: Splits code semantically
- **Embedding Cache**: Persistent embedding storage
- **Prompt Builder**: Constructs AI prompts
- **Project Detection**: Finds Gemini directories

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.5
- **MCP SDK**: @modelcontextprotocol/sdk v1.0.4
- **AI SDK**: @google/generative-ai v0.24.1
- **Validation**: Zod v3.23.8
- **File Patterns**: ignore v7.0.5

## Design Principles

1. **Separation of Concerns**: Tools vs utilities
2. **Optional Dependencies**: API key only for AI features
3. **Graceful Degradation**: Works without API key
4. **Security First**: Environment variables, no hardcoding
5. **Performance**: Caching, parallel processing
6. **Type Safety**: Full TypeScript coverage

See [MCP Integration](./MCP_INTEGRATION.md) and [Data Flow](./DATA_FLOW.md) for details.
