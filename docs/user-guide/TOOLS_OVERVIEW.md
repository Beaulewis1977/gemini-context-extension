# Tools Overview

Complete reference for all 7 tools in the Gemini Context Extension.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Tool Categorization](#tool-categorization)
- [Detailed Tool Descriptions](#detailed-tool-descriptions)
- [Feature Comparison Matrix](#feature-comparison-matrix)
- [Common Use Cases](#common-use-cases)

---

## Quick Reference

| Tool | Purpose | Requires API Key | Speed | Typical Use |
|------|---------|------------------|-------|-------------|
| `track_context_usage` | Monitor context window usage | No | Instant | Every session |
| `estimate_api_cost` | Calculate API costs | No | Instant | Before bulk operations |
| `compare_gemini_models` | Compare all Gemini models | No | Instant | Choosing models |
| `analyze_repository` | Analyze codebase structure | No | Fast | Understanding projects |
| `generate_repository_wiki` | Create AI documentation | Yes | Slow | New projects |
| `index_repository` | Build semantic index | Yes | Medium | Code exploration |
| `search_repository` | Semantic code search | Yes | Fast | Finding code |

---

## Tool Categorization

### Analysis Tools (No API Key Required)

#### 1. Context Window Tracker
**Tool:** `track_context_usage`
**Purpose:** Real-time monitoring of context window utilization

**What it does:**
- Analyzes current token usage
- Breaks down by component (system, tools, MCP, extensions, files)
- Supports all Gemini models
- Provides optimization recommendations

**When to use:**
- Start of each Claude session
- Before adding large context files
- When approaching context limits
- To understand what's consuming tokens

**Learn more:** [Context Tracking Guide](./CONTEXT_TRACKING.md)

---

#### 2. Cost Estimator
**Tool:** `estimate_api_cost`
**Purpose:** Calculate API costs for current and projected usage

**What it does:**
- Estimates costs based on latest Gemini pricing
- Handles tiered pricing (Pro models)
- Projects costs for multiple requests
- Compares costs across all models
- Provides money-saving recommendations

**When to use:**
- Budget planning
- Before starting large operations
- Choosing between models
- Optimizing costs

**Learn more:** [Cost Estimation Guide](./COST_ESTIMATION.md)

---

#### 3. Model Comparison
**Tool:** `compare_gemini_models`
**Purpose:** Side-by-side comparison of all Gemini models

**What it does:**
- Lists all available models with specs
- Shows pricing for each model
- Displays context window sizes
- Calculates costs for your current usage
- Sorts by cost (cheapest first)

**When to use:**
- Choosing the right model for your task
- Understanding pricing differences
- Finding cost-effective alternatives
- Planning multi-model strategies

---

#### 4. Repository Analyzer
**Tool:** `analyze_repository`
**Purpose:** Comprehensive codebase analysis without AI

**What it does:**
- Scans directory structure (respects .gitignore)
- Detects 40+ programming languages
- Identifies 20+ frameworks automatically
- Extracts dependencies from package files
- Counts lines of code by language
- Categorizes files (code, tests, config, docs)
- Reads README and LICENSE

**When to use:**
- Understanding new codebases
- Project documentation
- Tech stack audits
- Before wiki generation

**Learn more:** [Repository Analysis Guide](./REPOSITORY_ANALYSIS.md)

---

### AI-Powered Tools (Require API Key)

#### 5. Wiki Generator
**Tool:** `generate_repository_wiki`
**Purpose:** AI-powered comprehensive documentation generation

**What it does:**
- Analyzes repository using AI
- Generates 6+ documentation sections
- Creates Mermaid diagrams (architecture, dataflow, etc.)
- Supports custom configurations (`.gemini/wiki.json`)
- Uses different models per section
- Compiles to markdown or JSON

**When to use:**
- New project documentation
- Updating existing docs
- Onboarding new team members
- Creating architecture docs

**Learn more:** [Wiki Generation Guide](./WIKI_GENERATION.md)

---

#### 6. Repository Indexer
**Tool:** `index_repository`
**Purpose:** Create searchable semantic index of codebase

**What it does:**
- Chunks code files intelligently
- Respects function/class boundaries
- Generates embeddings via Gemini API
- Caches locally (`.gemini/embeddings.json`)
- Supports incremental updates
- Configurable chunk sizes

**When to use:**
- Enabling semantic search
- Large codebase exploration
- Before code analysis sessions
- One-time setup for projects

**Learn more:** [Semantic Search Guide](./SEMANTIC_SEARCH.md)

---

#### 7. Semantic Search
**Tool:** `search_repository`
**Purpose:** Natural language code search powered by AI

**What it does:**
- Searches indexed repositories
- Understands semantic meaning (not just keywords)
- Ranks results by relevance
- Shows file location and line numbers
- Supports filtering by score and count
- Optional surrounding context

**When to use:**
- Finding specific implementations
- Understanding code patterns
- Locating examples
- Exploring unfamiliar codebases

**Learn more:** [Semantic Search Guide](./SEMANTIC_SEARCH.md)

---

## Detailed Tool Descriptions

### track_context_usage

**Invocation:**
```
How much context am I using?
Show me detailed context analysis for Gemini 2.5 Pro
```

**Parameters:**
```typescript
{
  mode?: 'compact' | 'standard' | 'detailed',  // Default: standard
  model?: string  // Default: gemini-2.5-flash
}
```

**Output:**
```json
{
  "model": "Gemini 2.5 Flash",
  "timestamp": "2025-11-20T10:00:00Z",
  "usage": {
    "used": 45230,
    "total": 1000000,
    "percentage": 5,
    "available": 954770
  },
  "breakdown": {
    "systemContext": 12000,
    "builtInTools": 18000,
    "mcpServers": 5000,
    "extensions": 8230,
    "contextFiles": 2000
  },
  "details": {
    "recommendations": [
      "Consider Gemini 1.5 Pro for 2M token context if you need more capacity"
    ],
    "modelInfo": {
      "contextWindow": 1000000,
      "contextWindowFormatted": "1.0M tokens"
    }
  }
}
```

**Modes:**
- **Compact**: Just usage percentage
- **Standard**: Full breakdown
- **Detailed**: + Recommendations + model info

---

### estimate_api_cost

**Invocation:**
```
What are my API costs?
Estimate cost for 100 requests with Gemini 2.5 Flash
Compare costs across all models
```

**Parameters:**
```typescript
{
  model?: string,          // Default: gemini-2.5-flash
  requestCount?: number    // Default: 1
}
```

**Output:**
```json
{
  "model": "Gemini 2.5 Flash",
  "contextTokens": 45230,
  "estimatedResponseTokens": 500,
  "costs": {
    "perRequest": 0.000016,
    "totalRequests": 1,
    "total": 0.000016
  },
  "breakdown": {
    "inputCost": 0.000014,
    "outputCost": 0.000002
  },
  "comparison": {
    "Gemini 2.5 Flash-Lite": {
      "perRequest": 0.000006,
      "total": 0.000006,
      "savings": 0.000010,
      "savingsPercent": 62
    }
  },
  "recommendations": [
    "💰 Save 62% by switching to Gemini 2.5 Flash-Lite"
  ]
}
```

---

### compare_gemini_models

**Invocation:**
```
Compare all Gemini models
Show me model comparison with current usage costs
```

**Parameters:** None

**Output:**
```json
{
  "timestamp": "2025-11-20T10:00:00Z",
  "currentContextTokens": 45230,
  "models": [
    {
      "id": "gemini-2.5-flash-lite",
      "name": "Gemini 2.5 Flash-Lite",
      "contextWindow": 1000000,
      "description": "Most cost-effective for high-volume tasks",
      "pricing": {
        "input": "$0.100000/M tokens",
        "output": "$0.400000/M tokens"
      },
      "currentUsage": {
        "contextTokens": 45230,
        "costPerRequest": 0.000006,
        "inputCost": 0.000005,
        "outputCost": 0.000001
      }
    }
    // ... more models sorted by cost
  ]
}
```

---

### analyze_repository

**Invocation:**
```
Analyze the repository at /path/to/project
What tech stack is used in /Users/dev/my-app?
Analyze /home/user/code/project with max depth 5
```

**Parameters:**
```typescript
{
  repoPath: string,           // Required: absolute path
  includeStats?: boolean,     // Default: true
  maxDepth?: number          // Default: 10
}
```

**Output:** See [Repository Analysis Guide](./REPOSITORY_ANALYSIS.md)

---

### generate_repository_wiki

**Invocation:**
```
Generate wiki for /path/to/project
Create documentation using gemini-2.5-pro
Generate only overview and architecture sections
Output wiki in JSON format
```

**Parameters:**
```typescript
{
  repoPath: string,                  // Required
  model?: string,                    // Default: gemini-2.5-flash
  sections?: string[],               // Default: all
  includeDiagrams?: boolean,         // Default: true
  outputFormat?: 'json' | 'markdown' // Default: markdown
}
```

**Output:** See [Wiki Generation Guide](./WIKI_GENERATION.md)

---

### index_repository

**Invocation:**
```
Index the repository at /path/to/project
Index /path with max chunk size 1500
Force re-index of /path/to/project
```

**Parameters:**
```typescript
{
  repoPath: string,              // Required
  force?: boolean,               // Default: false
  maxChunkSize?: number,         // Default: 2000
  model?: string,                // Default: text-embedding-004
  excludePatterns?: string[]     // Default: []
}
```

**Output:** See [Semantic Search Guide](./SEMANTIC_SEARCH.md)

---

### search_repository

**Invocation:**
```
Search for "authentication" in /path/to/project
Find API endpoints in /path/to/project
Search with top 10 results and min score 0.7
```

**Parameters:**
```typescript
{
  repoPath: string,              // Required
  query: string,                 // Required
  topK?: number,                 // Default: 5, max: 20
  minScore?: number,             // Default: 0.5
  includeContext?: boolean       // Default: false
}
```

**Output:** See [Semantic Search Guide](./SEMANTIC_SEARCH.md)

---

## Feature Comparison Matrix

| Feature | Context Tracker | Cost Estimator | Model Comparison | Repo Analyzer | Wiki Generator | Indexer | Search |
|---------|-----------------|----------------|------------------|---------------|----------------|---------|--------|
| **API Key Required** | No | No | No | No | Yes | Yes | Yes |
| **Speed** | Instant | Instant | Instant | Fast | Slow | Medium | Fast |
| **File System Access** | Yes | Yes | No | Yes | Yes | Yes | No |
| **AI Processing** | No | No | No | No | Yes | Yes | Yes |
| **Caching** | No | No | No | No | No | Yes | Uses cache |
| **Customizable** | No | No | No | Params | Yes (.json) | Params | Params |
| **Output Format** | JSON | JSON | JSON | JSON | MD/JSON | JSON | JSON |
| **Typical Duration** | <1s | <1s | <1s | 1-5s | 30-120s | 10-60s | 1-3s |

---

## Common Use Cases

### Starting a New Project

```
1. Analyze the repository structure
2. Generate comprehensive wiki documentation
3. Index for semantic search
4. Track context usage as you work
```

### Optimizing Costs

```
1. Check context usage
2. Compare models for cost differences
3. Estimate costs for planned operations
4. Choose most cost-effective model
```

### Exploring Unknown Codebase

```
1. Analyze repository to understand tech stack
2. Index repository for search
3. Search for specific patterns or implementations
4. Generate wiki for team onboarding
```

### Documentation Sprint

```
1. Analyze all repositories
2. Generate wikis with custom configurations
3. Review and edit generated docs
4. Publish to team wiki
```

---

## Next Steps

- **Detailed Guides:**
  - [Repository Analysis](./REPOSITORY_ANALYSIS.md)
  - [Wiki Generation](./WIKI_GENERATION.md)
  - [Semantic Search](./SEMANTIC_SEARCH.md)
  - [Context Tracking](./CONTEXT_TRACKING.md)
  - [Cost Estimation](./COST_ESTIMATION.md)

- **Examples:** [Real-World Examples](./EXAMPLES.md)
- **Configuration:** [Configuration Guide](../getting-started/CONFIGURATION.md)
- **API Reference:** [Tools API](../api-reference/TOOLS.md)

---

**Need help?** Check the individual tool guides or ask in [GitHub Discussions](https://github.com/Beaulewis1977/gemini-context-extension/discussions).
