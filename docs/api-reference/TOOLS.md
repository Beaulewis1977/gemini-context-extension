# Tools API Reference

Complete API reference for all 7 MCP tools.

## Tool 1: track_context_usage

**Purpose**: Monitor context window utilization

**Parameters**:
```typescript
{
  mode?: 'compact' | 'standard' | 'detailed',
  model?: string
}
```

**Returns**:
```typescript
{
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
  details?: {
    recommendations: string[];
    modelInfo: object;
  };
}
```

---

## Tool 2: estimate_api_cost

**Purpose**: Calculate API costs

**Parameters**:
```typescript
{
  model?: string,
  requestCount?: number
}
```

**Returns**:
```typescript
{
  model: string;
  contextTokens: number;
  estimatedResponseTokens: number;
  costs: {
    perRequest: number;
    totalRequests: number;
    total: number;
  };
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
  comparison: Record<string, {
    perRequest: number;
    total: number;
    savings: number;
    savingsPercent: number;
  }>;
  recommendations: string[];
}
```

---

## Tool 3: compare_gemini_models

**Purpose**: Compare all Gemini models

**Parameters**: None

**Returns**:
```typescript
{
  timestamp: string;
  currentContextTokens: number;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    description: string;
    pricing: {
      input: string;
      output: string;
    };
    currentUsage: {
      contextTokens: number;
      costPerRequest: number;
      inputCost: number;
      outputCost: number;
    };
  }>;
}
```

---

## Tool 4: analyze_repository

**Purpose**: Analyze codebase structure

**Parameters**:
```typescript
{
  repoPath: string;
  includeStats?: boolean;
  maxDepth?: number;
}
```

**Returns**:
```typescript
{
  metadata: {
    name: string;
    path: string;
    description?: string;
    readme?: string;
    license?: string;
  };
  techStack: {
    primaryLanguage: string;
    languages: Record<string, number>;
    frameworks: string[];
    packageManagers: string[];
    dependencies: Record<string, string>;
  };
  structure: {
    totalFiles: number;
    totalLines: number;
    maxDepth: number;
    directories: DirectoryNode[];
  };
  statistics: {
    codeFiles: number;
    testFiles: number;
    configFiles: number;
    documentationFiles: number;
  };
  timestamp: string;
}
```

---

## Tool 5: generate_repository_wiki

**Purpose**: Generate AI documentation

**Parameters**:
```typescript
{
  repoPath: string;
  model?: string;
  sections?: string[];
  includeDiagrams?: boolean;
  outputFormat?: 'json' | 'markdown';
}
```

**Returns**:
```typescript
{
  title: string;
  description: string;
  sections: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  diagrams: Array<{
    title: string;
    type: 'architecture' | 'dataflow' | 'directory' | 'dependency';
    syntax: string;
  }>;
  metadata: {
    generatedAt: string;
    model: string;
    totalTokens: number;
    estimatedCost: number;
  };
}
```

---

## Tool 6: index_repository

**Purpose**: Create semantic index

**Parameters**:
```typescript
{
  repoPath: string;
  force?: boolean;
  maxChunkSize?: number;
  model?: string;
  excludePatterns?: string[];
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  metadata: {
    repoPath: string;
    indexedAt: string;
    totalChunks: number;
    model: string;
    version: string;
  };
}
```

---

## Tool 7: search_repository

**Purpose**: Semantic code search

**Parameters**:
```typescript
{
  repoPath: string;
  query: string;
  topK?: number;
  minScore?: number;
  includeContext?: boolean;
}
```

**Returns**:
```typescript
{
  query: string;
  resultsCount: number;
  results: Array<{
    file: string;
    lines: string;
    language: string;
    similarity: string;
    content: string;
    context?: string;
  }>;
}
```

---

See [UTILITIES.md](./UTILITIES.md) for utility functions and [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md) for complete type definitions.
