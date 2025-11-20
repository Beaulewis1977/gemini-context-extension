# Semantic Code Search Guide

Master semantic code search using AI embeddings to find code with natural language queries.

## Overview

Semantic search understands the meaning of your queries, not just keywords. Find implementations, patterns, and examples using natural language.

## Two-Step Process

### Step 1: Index Repository

```
Index the repository at /path/to/project
```

This creates embeddings and caches them locally (`.gemini/embeddings.json`).

**Parameters:**
```typescript
{
  repoPath: string,
  force?: boolean,          // Re-index (default: false)
  maxChunkSize?: number,    // Chunk size (default: 2000)
  model?: string,           // Embedding model (default: text-embedding-004)
  excludePatterns?: string[] // Glob patterns to skip
}
```

### Step 2: Search

```
Search for "authentication implementation" in /path/to/project
```

**Parameters:**
```typescript
{
  repoPath: string,
  query: string,
  topK?: number,           // Results to return (default: 5, max: 20)
  minScore?: number,       // Minimum similarity (default: 0.5)
  includeContext?: boolean // Include surrounding lines (default: false)
}
```

## Examples

### Index a Repository
```
Index /Users/dev/my-app
Index /path/to/project with max chunk size 1500
Force re-index /path/to/project
```

### Search Queries
```
Search for "user authentication logic" in /path/to/project
Find database connection setup
How does error handling work?
Show me API endpoint definitions
Find examples of async/await usage
```

### Advanced Search
```
Search with top 10 results and minimum score 0.7
Search with context included
```

## How It Works

1. **Chunking**: Code is split into semantic chunks (functions, classes)
2. **Embedding**: Each chunk gets a vector embedding from Gemini
3. **Caching**: Embeddings stored in `.gemini/embeddings.json`
4. **Searching**: Query embedding compared to code embeddings
5. **Ranking**: Results sorted by cosine similarity

## Output Format

```json
{
  "query": "authentication implementation",
  "resultsCount": 5,
  "results": [
    {
      "file": "src/auth/login.ts",
      "lines": "45-78",
      "language": "TypeScript",
      "similarity": "0.892",
      "content": "async function authenticateUser(credentials) {...}"
    }
  ]
}
```

## Similarity Scores

- **0.9-1.0**: Exact match or very close
- **0.7-0.9**: Highly relevant
- **0.5-0.7**: Somewhat relevant
- **<0.5**: Probably not relevant

## Best Practices

1. **Index once**: Cache lasts until files change
2. **Exclude large files**: Use `excludePatterns` for build artifacts
3. **Adjust chunk size**: Smaller chunks = more precise, larger = more context
4. **Use natural language**: "Find login validation" works better than "login validate"
5. **Adjust minScore**: Lower for broader results, higher for precision

## Exclude Patterns

```
Index with exclude patterns: ["**/*.test.ts", "**/node_modules/**", "dist/**"]
```

Common patterns:
- `**/*.min.js` - Minified files
- `**/node_modules/**` - Dependencies
- `dist/**`, `build/**` - Build outputs
- `**/*.test.*`, `**/*.spec.*` - Tests (if not needed)

## Cache Management

**Location**: `.gemini/embeddings.json` in repository root

**Size**: Varies by repository (typically 1-10 MB)

**Update**: Re-index when files change significantly

**Clear**: Delete `.gemini/embeddings.json` and re-index

## Performance Tips

1. **Smaller chunks**: Faster indexing, more chunks
2. **Exclude patterns**: Skip unnecessary files
3. **Incremental updates**: Only re-index changed files (coming soon)
4. **Cache reuse**: Index once, search many times

## Troubleshooting

**Repository not indexed**: Run `index_repository` first
**Poor results**: Try lowering `minScore` or adjusting query
**Slow indexing**: Use exclude patterns, reduce chunk size
**Large cache file**: Exclude test files and dependencies

See [Tools Overview](./TOOLS_OVERVIEW.md) for more details.
