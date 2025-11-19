# Agent Prompt: Implement Wiki Generator Phases 3 & 4

## Context

You are continuing implementation of the repository wiki generator feature for the Gemini Context Extension MCP server. **Phases 1 and 2 are COMPLETE**. Your task is to implement **Phase 3 (Configuration & Customization)** and **Phase 4 (Semantic Search with RAG)**.

## Project Status

### ✅ Completed (Phases 1 & 2)
- ✅ Repository analysis tool (`src/tools/repo-analyzer.ts`)
- ✅ File scanning utilities (`src/utils/file-scanner.ts`)
- ✅ AI-powered wiki generation (`src/tools/wiki-generator.ts`)
- ✅ Prompt building utilities (`src/utils/prompt-builder.ts`)
- ✅ MCP tools: `analyze_repository` and `generate_repository_wiki`
- ✅ All PR review bugs fixed
- ✅ README documentation updated

### 🎯 Your Tasks (Phases 3 & 4)
- ❌ Phase 3: Configuration & Customization system
- ❌ Phase 4: Semantic Search with RAG

## CRITICAL: Read These Files First

Before writing any code, you MUST read and analyze these files in order:

### 1. Planning Documents (Read First)
```
1. WIKI_GENERATOR_PLAN.md - Full implementation plan (focus on Phases 3 & 4)
2. AGENT_PROMPT_WIKI_IMPLEMENTATION.md - Original Phase 1 instructions for context
```

### 2. Existing Implementation (Study Patterns)
```
3. src/tools/repo-analyzer.ts - Understand existing tool pattern
4. src/tools/wiki-generator.ts - This will need updates for Phase 3
5. src/utils/file-scanner.ts - File system operation patterns
6. src/utils/prompt-builder.ts - Prompt construction patterns
7. src/server.ts - MCP tool registration patterns
```

### 3. Configuration Files
```
8. package.json - Current dependencies
9. README.md - Current documentation
10. tsconfig.json - TypeScript configuration
```

## Phase 3: Configuration & Customization

### Objectives
Allow repository owners to customize wiki generation through configuration files.

### Deliverables

#### 1. Configuration File Support

**Create: `.gemini/wiki.json.example`**
- Example configuration file for reference
- Include comprehensive comments
- Show all available options

**Update: `src/tools/wiki-generator.ts`**
- Add `loadConfig(repoPath: string): Promise<WikiConfig>` method
- Add `mergeConfig(defaultConfig: WikiConfig, userConfig: WikiConfig): WikiConfig` method
- Update `generate()` method to use config if present
- Validate config schema using Zod

**Create: `.gemini/wiki.schema.json`**
- JSON schema for configuration validation
- Enable IDE autocomplete for users

#### 2. Configuration Schema

Implement this interface in `src/tools/wiki-generator.ts`:

```typescript
export interface WikiConfig {
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

export interface SectionConfig {
  type: string;
  title?: string;
  enabled: boolean;
  model?: string;
  includeCodeExamples?: boolean;
  customPrompt?: string;
}

export interface DiagramConfig {
  enabled: boolean;
  types?: string[];
}

export interface GenerationConfig {
  defaultModel: string;
  maxTokensPerSection?: number;
  parallelSections?: number;
}
```

#### 3. Features to Implement

**Config Loading Logic:**
1. Check for `.gemini/wiki.json` in repository root
2. Parse and validate configuration
3. Merge with default configuration
4. Handle missing or invalid config gracefully

**Custom Sections:**
- Support user-defined custom sections with custom prompts
- Allow disabling default sections
- Support per-section model selection

**Path Exclusion:**
- Extend file scanner to respect custom exclusion patterns from config
- Merge with default exclusions (node_modules, dist, etc.)

**Git Integration (Optional):**
- Extract git history metadata using `simple-git` library
- Identify primary contributors
- Recent activity summary
- Add to repository metadata

#### 4. Default Configuration

Add to `src/tools/wiki-generator.ts`:

```typescript
const DEFAULT_CONFIG: WikiConfig = {
  version: '1.0',
  sections: [
    { type: 'overview', title: 'Overview', enabled: true },
    { type: 'architecture', title: 'Architecture', enabled: true },
    { type: 'setup', title: 'Getting Started', enabled: true },
    { type: 'development', title: 'Development Guide', enabled: true },
    { type: 'api', title: 'API Reference', enabled: true },
    { type: 'testing', title: 'Testing', enabled: true },
  ],
  diagrams: {
    enabled: true,
    types: ['architecture', 'dataflow'],
  },
  exclude: {
    paths: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '**/*.min.js',
      '**/*.min.css',
    ],
  },
  generation: {
    defaultModel: 'gemini-2.0-flash-exp',
    maxTokensPerSection: 2000,
    parallelSections: 3,
  },
};
```

### Phase 3 Testing Requirements

- [ ] Load and parse valid config file
- [ ] Handle missing config gracefully (use defaults)
- [ ] Merge user config with defaults correctly
- [ ] Validate config schema and reject invalid configs
- [ ] Test custom section generation with custom prompts
- [ ] Verify path exclusion works (custom patterns respected)
- [ ] Test per-section model selection
- [ ] (Optional) Test git metadata extraction if implemented

---

## Phase 4: Semantic Search with RAG

### Objectives
Enable semantic search across repository content using vector embeddings.

### Deliverables

#### 1. Create New Files

**File: `src/utils/code-chunker.ts`**

```typescript
export interface CodeChunk {
  chunkId: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  language: string;
  estimatedTokens: number;
}

export class CodeChunker {
  /**
   * Chunk file into semantic blocks
   */
  chunkFile(
    content: string,
    filePath: string,
    language: string,
    maxChunkSize: number
  ): CodeChunk[];

  /**
   * Chunk by function boundaries (basic implementation)
   */
  chunkByFunction(content: string, language: string): CodeChunk[];

  /**
   * Chunk by class boundaries (basic implementation)
   */
  chunkByClass(content: string, language: string): CodeChunk[];

  /**
   * Estimate tokens in content
   */
  private estimateTokens(content: string): number;
}
```

**Chunking Strategy:**
- Max chunk size: 512 tokens
- Overlap: 50 tokens between chunks
- Try to respect function/class boundaries using simple regex
- Fall back to fixed-size chunking if boundaries not detectable

**File: `src/utils/embedding-cache.ts`**

```typescript
export interface EmbeddingEntry {
  chunkId: string;
  filePath: string;
  content: string;
  embedding: number[]; // 768-dimensional vector
  metadata: {
    startLine: number;
    endLine: number;
    language: string;
    indexedAt: string;
  };
}

export interface EmbeddingIndex {
  metadata: {
    repoPath: string;
    indexedAt: string;
    totalChunks: number;
    model: string;
  };
  chunks: EmbeddingEntry[];
}

export class EmbeddingCache {
  /**
   * Save embeddings to cache file
   */
  async save(repoPath: string, index: EmbeddingIndex): Promise<void>;

  /**
   * Load embeddings from cache
   */
  async load(repoPath: string): Promise<EmbeddingIndex | null>;

  /**
   * Clear cache for repository
   */
  async clear(repoPath: string): Promise<void>;

  /**
   * Check if cache exists and is valid
   */
  async isCacheValid(repoPath: string, maxAge?: number): Promise<boolean>;

  /**
   * Get cache file path
   */
  private getCachePath(repoPath: string): string;
}
```

**Cache Storage:**
- Store in `.gemini/embeddings.json` in repository root
- Use gzip compression for large indexes
- Include timestamp for cache invalidation

**File: `src/tools/repo-search.ts`**

```typescript
export interface IndexOptions {
  force?: boolean;           // Force re-index
  maxChunkSize?: number;     // Default: 512 tokens
  includeTests?: boolean;    // Include test files (default: false)
}

export interface SearchOptions {
  topK?: number;             // Number of results (default: 5)
  minScore?: number;         // Minimum similarity score (default: 0.5)
  filePattern?: string;      // Filter by file pattern
}

export interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;             // Similarity score 0-1
  context?: string;          // Surrounding context
}

export interface IndexMetadata {
  repoPath: string;
  indexedAt: string;
  totalChunks: number;
  totalFiles: number;
  model: string;
  estimatedCost: number;
}

export class RepositorySearch {
  constructor(private apiKey: string);

  /**
   * Index repository for semantic search
   */
  async indexRepository(
    repoPath: string,
    options?: IndexOptions
  ): Promise<IndexMetadata>;

  /**
   * Search repository using semantic search
   */
  async search(
    repoPath: string,
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult[]>;

  /**
   * Update index for changed files only
   */
  async updateIndex(
    repoPath: string,
    changedFiles: string[]
  ): Promise<void>;

  /**
   * Generate embedding for text using Gemini
   */
  private async generateEmbedding(text: string): Promise<number[]>;

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number;
}
```

#### 2. Update Server

**Update: `src/server.ts`**

Register two new MCP tools:

```typescript
server.registerTool(
  'index_repository',
  {
    description: 'Create searchable index of repository using embeddings',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      force: z.boolean().optional().describe('Force re-index (default: false)'),
      maxChunkSize: z.number().optional().describe('Max tokens per chunk (default: 512)'),
      includeTests: z.boolean().optional().describe('Include test files (default: false)'),
    }).shape,
  },
  async (params) => {
    try {
      const repoSearch = new RepositorySearch(process.env.GEMINI_API_KEY || '');
      const metadata = await repoSearch.indexRepository(params.repoPath, {
        force: params.force ?? false,
        maxChunkSize: params.maxChunkSize ?? 512,
        includeTests: params.includeTests ?? false,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(metadata, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Repository indexing error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error occurred during indexing',
            }),
          },
        ],
      };
    }
  }
);

server.registerTool(
  'search_repository',
  {
    description: 'Search repository content using semantic search',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      query: z.string().describe('Search query'),
      topK: z.number().optional().describe('Number of results (default: 5)'),
      minScore: z.number().optional().describe('Minimum similarity score (default: 0.5)'),
      filePattern: z.string().optional().describe('Filter by file pattern (e.g., "*.ts")'),
    }).shape,
  },
  async (params) => {
    try {
      const repoSearch = new RepositorySearch(process.env.GEMINI_API_KEY || '');
      const results = await repoSearch.search(params.repoPath, params.query, {
        topK: params.topK ?? 5,
        minScore: params.minScore ?? 0.5,
        filePattern: params.filePattern,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query: params.query,
              results,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Repository search error:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error occurred during search',
            }),
          },
        ],
      };
    }
  }
);
```

#### 3. Gemini Embedding API Integration

**Use these models:**
- Embedding: `text-embedding-004` (768 dimensions)
- Model documentation: https://ai.google.dev/gemini-api/docs/embeddings

**Implementation in `repo-search.ts`:**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

private async generateEmbedding(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(this.apiKey);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

  const result = await model.embedContent(text);
  return result.embedding.values;
}
```

**Similarity Calculation:**

```typescript
private cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vector dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Phase 4 Implementation Strategy

1. **Code Chunking**
   - Scan repository using existing FileScanner
   - Filter out non-code files, tests (unless includeTests=true)
   - Chunk each file into semantic blocks
   - Estimate tokens per chunk (reuse TokenCounter utility)

2. **Embedding Generation**
   - Generate embeddings for all chunks using Gemini API
   - Use batch processing to optimize API calls
   - Implement retry logic with exponential backoff
   - Track token usage and costs

3. **Caching**
   - Save embeddings to `.gemini/embeddings.json`
   - Include metadata (timestamp, model, chunk count)
   - Load from cache if valid and force=false
   - Implement incremental updates for changed files

4. **Search**
   - Load embeddings from cache
   - Generate embedding for search query
   - Calculate cosine similarity with all chunks
   - Return top-K results sorted by similarity
   - Filter by minScore and filePattern if provided

### Phase 4 Testing Requirements

- [ ] Index small repository (< 1k LOC)
- [ ] Index medium repository (10k LOC)
- [ ] Verify embedding generation (check dimensions = 768)
- [ ] Test semantic search accuracy (relevant results returned)
- [ ] Verify cache persistence (load from cache works)
- [ ] Test incremental updates (only changed files re-indexed)
- [ ] Measure search performance (< 1s for 1000 chunks)
- [ ] Test file pattern filtering
- [ ] Verify minScore threshold works
- [ ] Test error handling for missing API key

---

## Dependencies to Add

You will need to add these dependencies:

```bash
# For git metadata (Phase 3 - Optional)
npm install simple-git
npm install --save-dev @types/simple-git

# No additional dependencies needed for Phase 4
# (Gemini SDK already installed from Phase 2)
```

## Implementation Guidelines

### Follow Existing Patterns

1. **Study Phase 1 & 2 code first:**
   - Read all files listed in "CRITICAL: Read These Files First" section
   - Understand existing patterns before writing new code
   - Reuse utilities like TokenCounter, FileScanner

2. **TypeScript standards:**
   - Export interfaces for all return types
   - Use Zod for schema validation
   - Proper typing (avoid `any`)
   - JSDoc comments for public methods

3. **Error Handling:**
   - Try-catch in MCP tool handlers
   - Sanitize errors (no stack trace exposure)
   - Return errors in standard format: `{ error: string }`
   - Handle missing files gracefully

4. **Testing Strategy:**
   - Test each phase independently
   - Verify backward compatibility with Phases 1 & 2
   - Test with the current repository (gemini-context-extension)
   - Create comprehensive test scenarios

### Git Workflow

1. You're already on the correct branch: `claude/wiki-generator-phase-1-016oiCdNC94LzSW72hGaB5CQ`
2. Implement Phase 3 fully and test
3. Commit: `git commit -m "Implement Phase 3: Configuration & Customization"`
4. Implement Phase 4 fully and test
5. Commit: `git commit -m "Implement Phase 4: Semantic Search with RAG"`
6. Update README.md with new features
7. Commit: `git commit -m "Update README with Phases 3 & 4 documentation"`
8. Run `npm run build && npm run lint && npm run format`
9. Commit any formatting changes
10. Push: `git push -u origin claude/wiki-generator-phase-1-016oiCdNC94LzSW72hGaB5CQ`

### Success Criteria

**Phase 3:**
- [ ] `.gemini/wiki.json.example` created with comprehensive examples
- [ ] `.gemini/wiki.schema.json` created for validation
- [ ] `WikiGenerator.loadConfig()` implemented and tested
- [ ] `WikiGenerator.mergeConfig()` implemented and tested
- [ ] Custom sections work with custom prompts
- [ ] Path exclusion patterns respected
- [ ] Per-section model selection works
- [ ] Git metadata extraction works (if implemented)
- [ ] Build passes: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] All existing tests still pass

**Phase 4:**
- [ ] `src/utils/code-chunker.ts` created with chunking logic
- [ ] `src/utils/embedding-cache.ts` created with caching logic
- [ ] `src/tools/repo-search.ts` created with search functionality
- [ ] `index_repository` MCP tool registered and working
- [ ] `search_repository` MCP tool registered and working
- [ ] Embeddings generated correctly (768 dimensions)
- [ ] Cache saves and loads properly
- [ ] Semantic search returns relevant results
- [ ] Cosine similarity calculation correct
- [ ] Performance acceptable (< 1s search time)
- [ ] Build passes: `npm run build`
- [ ] Linting passes: `npm run lint`

## Important Notes

1. **Read the plan first**: `WIKI_GENERATOR_PLAN.md` has detailed specifications for Phases 3 & 4
2. **Study existing code**: Understand patterns from Phases 1 & 2 before implementing
3. **Follow MCP patterns**: Study how tools are registered in `src/server.ts`
4. **Reuse existing utilities**: TokenCounter, FileScanner, PromptBuilder
5. **Test incrementally**: Test Phase 3 before moving to Phase 4
6. **Document your code**: Add JSDoc comments
7. **Update README**: Add documentation for new features
8. **Security**: Never expose API keys, sanitize all errors

## Testing After Implementation

### Phase 3 Testing

Test configuration system:

```bash
# Create test config in a sample repository
mkdir -p /tmp/test-repo/.gemini
cat > /tmp/test-repo/.gemini/wiki.json << 'EOF'
{
  "version": "1.0",
  "metadata": {
    "title": "Test Project"
  },
  "sections": [
    {
      "type": "overview",
      "enabled": true,
      "model": "gemini-2.0-flash-exp"
    },
    {
      "type": "custom",
      "title": "Security",
      "enabled": true,
      "customPrompt": "Analyze security measures in this codebase."
    }
  ]
}
EOF

# Test wiki generation with config
# Use Gemini CLI to invoke: generate_repository_wiki
```

### Phase 4 Testing

Test semantic search:

```bash
# Index the current repository
# Use Gemini CLI to invoke: index_repository({ repoPath: "/home/user/gemini-context-extension" })

# Search for specific functionality
# Use Gemini CLI to invoke: search_repository({
#   repoPath: "/home/user/gemini-context-extension",
#   query: "how are MCP tools registered",
#   topK: 3
# })
```

## Expected Deliverables

When complete, you should have:

### New Files (Phase 3):
1. `.gemini/wiki.json.example` - Example configuration
2. `.gemini/wiki.schema.json` - JSON schema for validation

### New Files (Phase 4):
1. `src/utils/code-chunker.ts` - Code chunking utilities
2. `src/utils/embedding-cache.ts` - Embedding cache management
3. `src/tools/repo-search.ts` - Semantic search tool

### Updated Files:
1. `src/tools/wiki-generator.ts` - Config loading and merging
2. `src/server.ts` - Two new MCP tools registered
3. `README.md` - Documentation for Phases 3 & 4
4. `package.json` - New dependencies added

### Test Results:
1. Configuration loading and merging works
2. Custom sections generate correctly
3. Repository indexing completes successfully
4. Semantic search returns relevant results
5. All builds and lints pass
6. Existing functionality (Phases 1 & 2) still works

## Cost Estimation

**Phase 4 Indexing Costs:**
- Small repo (1k LOC): ~$0.01
- Medium repo (10k LOC): ~$0.10
- Large repo (50k LOC): ~$0.50

**Phase 4 Search Costs:**
- Per query: ~$0.0001 (negligible)

## Final Checklist

Before completing this task:

- [ ] Read all required files listed above
- [ ] Understand Phases 1 & 2 implementation
- [ ] Implement Phase 3 completely
- [ ] Test Phase 3 thoroughly
- [ ] Commit Phase 3 changes
- [ ] Implement Phase 4 completely
- [ ] Test Phase 4 thoroughly
- [ ] Commit Phase 4 changes
- [ ] Update README with new features
- [ ] Commit README updates
- [ ] Run build, lint, format
- [ ] Push all changes to remote
- [ ] Verify all tools work via Gemini CLI
- [ ] Document any deviations from plan

---

**Ready to begin? Start by reading the files in the "CRITICAL: Read These Files First" section, then proceed with Phase 3 implementation!**

Good luck! 🚀
