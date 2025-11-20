# Type Definitions

Complete TypeScript type definitions.

## Repository Analysis Types

```typescript
interface RepositoryAnalysis {
  metadata: RepositoryMetadata;
  techStack: TechStack;
  structure: RepositoryStructure;
  statistics: RepositoryStatistics;
  timestamp: string;
}

interface RepositoryMetadata {
  name: string;
  path: string;
  description?: string;
  readme?: string;
  license?: string;
}

interface TechStack {
  primaryLanguage: string;
  languages: Record<string, number>;
  frameworks: string[];
  packageManagers: string[];
  dependencies: Record<string, string>;
}

interface RepositoryStructure {
  totalFiles: number;
  totalLines: number;
  maxDepth: number;
  directories: DirectoryNode[];
}

interface RepositoryStatistics {
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  documentationFiles: number;
}

interface DirectoryNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  depth: number;
  children?: DirectoryNode[];
  size?: number;
  lines?: number;
  language?: string;
}
```

## Wiki Generation Types

```typescript
interface WikiResult {
  title: string;
  description: string;
  sections: WikiSection[];
  diagrams: MermaidDiagram[];
  metadata: {
    generatedAt: string;
    model: string;
    totalTokens: number;
    estimatedCost: number;
  };
}

interface WikiSection {
  title: string;
  content: string;
  order: number;
}

interface MermaidDiagram {
  title: string;
  type: 'architecture' | 'dataflow' | 'directory' | 'dependency';
  syntax: string;
}

interface WikiConfig {
  version: string;
  metadata?: {
    title?: string;
    description?: string;
  };
  repoNotes?: string;
  sections?: SectionConfig[];
  diagrams?: DiagramConfig;
  exclude?: {
    paths?: string[];
  };
  generation?: GenerationConfig;
}

interface SectionConfig {
  type: string;
  title?: string;
  enabled?: boolean;
  model?: string;
  includeCodeExamples?: boolean;
  prompt?: string;
}
```

## Semantic Search Types

```typescript
interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;
  context?: string;
  language: string;
}

interface EmbeddingEntry {
  chunkId: string;
  filePath: string;
  content: string;
  embedding: number[];
  metadata: {
    startLine: number;
    endLine: number;
    language: string;
  };
}

interface IndexMetadata {
  repoPath: string;
  indexedAt: string;
  totalChunks: number;
  model: string;
  version: string;
}

interface CodeChunk {
  chunkId: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  language: string;
}
```

## Context Tracking Types

```typescript
interface ContextAnalysis {
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
```

## Cost Estimation Types

```typescript
interface CostEstimate {
  model: string;
  timestamp: string;
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
  comparison?: Record<string, {
    perRequest: number;
    total: number;
    savings: number;
    savingsPercent: number;
  }>;
  recommendations?: string[];
}
```

## Utility Types

```typescript
type FileType = 'code' | 'test' | 'config' | 'documentation' | 'build' | 'data' | 'image' | 'other';

interface ScanOptions {
  maxDepth?: number;
  includeStats?: boolean;
  respectGitignore?: boolean;
}

interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
  respectBoundaries?: boolean;
}

interface IndexOptions {
  force?: boolean;
  maxChunkSize?: number;
  model?: string;
  excludePatterns?: string[];
}

interface SearchOptions {
  topK?: number;
  minScore?: number;
  includeContext?: boolean;
}
```

---

For usage examples, see [TOOLS.md](./TOOLS.md) and [UTILITIES.md](./UTILITIES.md).
