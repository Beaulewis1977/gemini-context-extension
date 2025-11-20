# Utilities API Reference

Internal utility classes and functions.

## FileScanner

**Purpose**: Scan directories and detect file types

```typescript
class FileScanner {
  async scanDirectory(
    dirPath: string,
    options?: {
      maxDepth?: number;
      includeStats?: boolean;
      respectGitignore?: boolean;
    }
  ): Promise<DirectoryNode[]>

  detectLanguage(filePath: string): string
  detectFileType(filePath: string): FileType
  async countLines(filePath: string): Promise<number>
}
```

---

## GeminiClient

**Purpose**: Interface with Gemini API

```typescript
class GeminiClient {
  constructor(config?: {
    apiKey?: string;
    useApiForCounting?: boolean;
  })

  isAvailable(): boolean
  async countTokens(text: string, model?: string): Promise<number>
  async countTokensBatch(texts: string[], model?: string): Promise<number>
}
```

---

## TokenCounter

**Purpose**: Count or estimate tokens

```typescript
class TokenCounter {
  async count(text: string, model?: string): Promise<number>
  async countBatch(texts: string[], model?: string): Promise<number>
  estimate(text: string): number
  isApiAvailable(): boolean
}
```

---

## CodeChunker

**Purpose**: Split code into semantic chunks

```typescript
class CodeChunker {
  chunkFile(
    content: string,
    filePath: string,
    language: string,
    options?: {
      maxChunkSize?: number;
      overlap?: number;
    }
  ): CodeChunk[]

  chunkByFunction(
    content: string,
    filePath: string,
    language: string
  ): CodeChunk[]

  shouldChunk(content: string, maxSize?: number): boolean
  estimateChunkCount(content: string, maxChunkSize?: number, overlap?: number): number
}
```

---

## EmbeddingCache

**Purpose**: Store and retrieve embeddings

```typescript
class EmbeddingCache {
  async save(repoPath: string, entries: EmbeddingEntry[], model?: string): Promise<void>
  async load(repoPath: string): Promise<EmbeddingIndex | null>
  async exists(repoPath: string): Promise<boolean>
  async clear(repoPath: string): Promise<void>
  async getMetadata(repoPath: string): Promise<IndexMetadata | null>
  async update(repoPath: string, updates: EmbeddingEntry[]): Promise<void>
  
  static cosineSimilarity(a: number[], b: number[]): number
  static findTopK(
    queryEmbedding: number[],
    entries: EmbeddingEntry[],
    k?: number
  ): Array<{ entry: EmbeddingEntry; score: number }>
}
```

---

## PromptBuilder

**Purpose**: Build AI prompts

```typescript
class PromptBuilder {
  buildSectionPrompt(sectionType: string, analysis: RepositoryAnalysis): string
  buildDiagramPrompt(diagramType: string, analysis: RepositoryAnalysis): string
  selectRelevantCode(analysis: RepositoryAnalysis, sectionType: string): Array<{
    file: string;
    language: string;
  }>
}
```

---

See [TOOLS.md](./TOOLS.md) for MCP tools API and [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md) for types.
