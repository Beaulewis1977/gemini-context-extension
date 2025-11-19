# Repository Wiki Generator - Implementation Plan

**Version:** 1.0
**Date:** 2024-11-19
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Motivation & Goals](#motivation--goals)
3. [Technical Architecture](#technical-architecture)
4. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
5. [API & Interface Design](#api--interface-design)
6. [File Structure](#file-structure)
7. [Cost Analysis](#cost-analysis)
8. [Testing Strategy](#testing-strategy)
9. [Configuration & Customization](#configuration--customization)
10. [Future Enhancements](#future-enhancements)
11. [References](#references)

---

## Executive Summary

This plan outlines the implementation of a **repository wiki generator** as an MCP (Model Context Protocol) tool for the Gemini Context Extension. Inspired by Devin AI's Deepwiki, this feature will enable automatic generation of comprehensive documentation for code repositories using the Gemini AI API.

**Key Capabilities:**
- Analyze repository structure and tech stack
- Generate AI-powered documentation using Gemini
- Create architecture diagrams in Mermaid format
- Estimate documentation scope and costs
- Support custom configuration via `.gemini/wiki.json`
- (Optional) Semantic search using RAG and vector embeddings

**Differentiation from Deepwiki:**
- **Lightweight**: No web UI, database, or complex infrastructure
- **MCP-native**: Designed as tools for Gemini to invoke
- **Gemini-first**: Optimized for Google's Gemini API
- **Cost-aware**: Integrated with existing cost estimation tools
- **Local-first**: Works with local repositories, no hosting required

---

## Motivation & Goals

### Why Build This?

1. **Onboarding Acceleration**: Quickly understand unfamiliar codebases
2. **Documentation Automation**: Generate comprehensive docs from code structure
3. **Context Enhancement**: Provide rich context to Gemini for better code assistance
4. **Knowledge Capture**: Document tribal knowledge and architecture decisions
5. **Integration**: Natural extension of the existing context tracking features

### Success Criteria

- ✅ Analyze any local repository in < 30 seconds
- ✅ Generate comprehensive wiki with 5-10 sections in < 2 minutes
- ✅ Cost < $0.10 per average repository (using Gemini 2.5 Flash)
- ✅ Support repositories up to 100k lines of code
- ✅ Generate valid Mermaid diagrams for architecture visualization
- ✅ Seamless integration with existing MCP tools

---

## Technical Architecture

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Gemini CLI                               │
│  (User asks: "Generate wiki for my-project")                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ MCP Protocol
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server (server.ts)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tool: analyze_repository                                │   │
│  │  Tool: generate_repository_wiki                          │   │
│  │  Tool: search_repository (Phase 4)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────┬────────────────┬─────────────────┬────────────────────┘
         │                │                 │
         ▼                ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│ RepositoryAnalyzer│ │WikiGenerator │ │RepositorySearch │
│  (Phase 1)      │ │  (Phase 2)   │ │  (Phase 4)      │
└────────┬────────┘ └──────┬───────┘ └────────┬────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  File Scanner   │ │  Gemini API  │ │Embedding Cache  │
│  (utils)        │ │ (@google/... )│ │  (utils)        │
└─────────────────┘ └──────────────┘ └─────────────────┘
```

### Technology Stack

**Core Dependencies:**
- `@google/generative-ai` - Gemini API SDK
- `@modelcontextprotocol/sdk` - MCP protocol (existing)
- `zod` - Schema validation (existing)
- TypeScript - Type safety

**Utilities:**
- `fs/promises` - File system operations
- `path` - Path manipulation
- `glob` - File pattern matching (new)
- `simple-git` - Git operations (optional, Phase 3)

**No External Services Required:**
- No database needed
- No separate API server
- No vector database (Phase 4 uses in-memory or JSON cache)

### Data Flow

```text
1. User Request
   ↓
2. MCP Tool Invocation (analyze_repository)
   ↓
3. File System Scan
   ↓
4. Structure Analysis
   ↓
5. Tech Stack Detection
   ↓
6. Repository Metadata Extraction
   ↓
7. MCP Tool Invocation (generate_repository_wiki)
   ↓
8. Gemini API Calls (parallel for different sections)
   ↓
9. Mermaid Diagram Generation
   ↓
10. Markdown Compilation
    ↓
11. Return to Gemini CLI
```

---

## Phase-by-Phase Implementation

### Phase 1: Repository Analysis (Foundation)

**Timeline:** Week 1
**Complexity:** Low
**Dependencies:** None

#### Objectives

Create a robust repository analyzer that extracts structural information without AI.

#### Features

1. **Directory Scanning**
   - Recursive file tree traversal
   - Configurable depth limits
   - Respect `.gitignore` patterns
   - File type categorization

2. **Tech Stack Detection**
   - Identify frameworks (React, Next.js, FastAPI, etc.)
   - Detect languages by file extensions
   - Parse package managers (npm, pip, cargo, etc.)
   - Extract dependencies from manifest files

3. **Code Statistics**
   - Line counts by language
   - File counts by type
   - Directory structure depth
   - Total repository size

4. **Metadata Extraction**
   - README content
   - LICENSE information
   - `.gitignore` patterns
   - Repository name and description

#### Deliverables

**New File:** `src/tools/repo-analyzer.ts`

```typescript
export interface RepositoryAnalysis {
  metadata: {
    name: string;
    path: string;
    description?: string;
    readme?: string;
    license?: string;
  };
  techStack: {
    primaryLanguage: string;
    languages: Record<string, number>; // language -> line count
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

export class RepositoryAnalyzer {
  async analyze(
    repoPath: string,
    options?: AnalyzerOptions
  ): Promise<RepositoryAnalysis>;
}
```

**New File:** `src/utils/file-scanner.ts`

```typescript
export class FileScanner {
  async scanDirectory(
    path: string,
    options: ScanOptions
  ): Promise<DirectoryTree>;

  detectFileType(path: string): FileType;
  countLines(filePath: string): Promise<number>;
  shouldIgnore(path: string, patterns: string[]): boolean;
}
```

**MCP Tool Registration:**

```typescript
server.registerTool(
  'analyze_repository',
  {
    description: 'Analyze repository structure, tech stack, and statistics',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      includeStats: z.boolean().optional().describe('Include detailed statistics (default: true)'),
      maxDepth: z.number().optional().describe('Maximum directory depth to scan (default: 10)'),
    }).shape,
  },
  async (params) => { /* implementation */ }
);
```

#### Testing

- [ ] Test with TypeScript/Node.js repository
- [ ] Test with Python repository
- [ ] Test with monorepo structure
- [ ] Test with large repository (>50k LOC)
- [ ] Verify `.gitignore` handling
- [ ] Verify performance (< 30s for 100k LOC)

---

### Phase 2: AI-Powered Wiki Generation

**Timeline:** Week 2
**Complexity:** Medium
**Dependencies:** Phase 1

#### Objectives

Generate comprehensive, structured documentation using Gemini API.

#### Features

1. **Section Generation**
   - Overview/Introduction
   - Architecture & Design
   - Getting Started / Setup
   - API Reference
   - Development Guide
   - Testing Guide
   - Deployment Guide

2. **Mermaid Diagram Generation**
   - Architecture diagram (component relationships)
   - Data flow diagram
   - Directory structure diagram
   - Module dependency graph

3. **Smart Prompting**
   - Context-aware prompt construction
   - Include relevant code samples
   - Reference README and documentation
   - Adapt to repository type (library vs application)

4. **Parallel Generation**
   - Generate sections concurrently
   - Rate limiting and error handling
   - Progress tracking

#### Deliverables

**New File:** `src/tools/wiki-generator.ts`

```typescript
export interface WikiGenerationOptions {
  model?: string; // Default: gemini-2.5-flash
  sections?: string[]; // Default: all sections
  includeDiagrams?: boolean; // Default: true
  includeCodeExamples?: boolean; // Default: true
  maxTokensPerSection?: number; // Default: 2000
}

export interface WikiResult {
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

export interface WikiSection {
  title: string;
  content: string;
  order: number;
}

export interface MermaidDiagram {
  title: string;
  type: 'architecture' | 'dataflow' | 'directory' | 'dependency';
  syntax: string; // Mermaid syntax
}

export class WikiGenerator {
  constructor(apiKey: string);

  async generate(
    analysis: RepositoryAnalysis,
    options?: WikiGenerationOptions
  ): Promise<WikiResult>;

  async generateSection(
    sectionType: string,
    analysis: RepositoryAnalysis,
    model: string
  ): Promise<WikiSection>;

  async generateDiagram(
    diagramType: string,
    analysis: RepositoryAnalysis
  ): Promise<MermaidDiagram>;
}
```

**New File:** `src/utils/prompt-builder.ts`

```typescript
export class PromptBuilder {
  buildSectionPrompt(
    sectionType: string,
    analysis: RepositoryAnalysis
  ): string;

  buildDiagramPrompt(
    diagramType: string,
    analysis: RepositoryAnalysis
  ): string;

  selectRelevantCode(
    analysis: RepositoryAnalysis,
    sectionType: string
  ): string[];
}
```

**MCP Tool Registration:**

```typescript
server.registerTool(
  'generate_repository_wiki',
  {
    description: 'Generate comprehensive wiki documentation using Gemini AI',
    inputSchema: z.object({
      repoPath: z.string().describe('Absolute path to repository'),
      model: z.string().optional().describe('Gemini model (default: gemini-2.5-flash)'),
      sections: z.array(z.string()).optional().describe('Specific sections to generate'),
      includeDiagrams: z.boolean().optional().describe('Include Mermaid diagrams (default: true)'),
    }).shape,
  },
  async (params) => { /* implementation */ }
);
```

#### Prompt Engineering Strategy

**Section Prompt Template:**

```text
You are a technical documentation expert. Generate a comprehensive {SECTION_TYPE} section for the following repository.

Repository Context:
- Name: {NAME}
- Primary Language: {LANGUAGE}
- Frameworks: {FRAMEWORKS}
- Description: {DESCRIPTION}

Structure:
{DIRECTORY_TREE}

Key Files:
{KEY_FILES}

README Content:
{README}

Instructions:
1. Write clear, concise documentation
2. Include practical examples where relevant
3. Use markdown formatting
4. Target audience: developers familiar with {LANGUAGE}
5. Keep section length to approximately 500-800 words
6. Do not include generic filler content

Generate the {SECTION_TYPE} section now:
```

**Diagram Prompt Template:**

```text
Create a Mermaid diagram showing the {DIAGRAM_TYPE} for this repository.

Repository: {NAME}
Languages: {LANGUAGES}
Structure:
{STRUCTURE}

Requirements:
1. Use valid Mermaid syntax
2. Keep diagram focused and readable (max 15 nodes)
3. Show key relationships and dependencies
4. Use appropriate Mermaid diagram type
5. Return ONLY the Mermaid code block, no explanation

Generate the diagram:
```

#### Testing

- [ ] Generate wiki for sample TypeScript project
- [ ] Generate wiki for sample Python project
- [ ] Verify all sections are generated
- [ ] Validate Mermaid syntax
- [ ] Check token usage and costs
- [ ] Test error handling for API failures
- [ ] Verify parallel generation works correctly

---

### Phase 3: Configuration & Customization

**Timeline:** Week 3
**Complexity:** Low
**Dependencies:** Phase 2

#### Objectives

Allow repository owners to customize wiki generation through configuration files.

#### Features

1. **Configuration File Support**
   - `.gemini/wiki.json` in repository root
   - Override default sections
   - Custom repository notes
   - Path exclusion patterns
   - Model selection per section

2. **Template System**
   - Custom section templates
   - Variable substitution
   - Reusable content blocks

3. **Git Integration** (Optional)
   - Extract git history metadata
   - Identify primary contributors
   - Recent activity summary

#### Configuration Schema

**File:** `.gemini/wiki.json`

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Custom Project Name",
    "description": "Custom description override"
  },
  "repoNotes": "Additional context about this repository that should inform documentation generation.",
  "sections": [
    {
      "type": "overview",
      "title": "Project Overview",
      "enabled": true,
      "model": "gemini-2.5-flash"
    },
    {
      "type": "architecture",
      "title": "System Architecture",
      "enabled": true,
      "includeCodeExamples": true,
      "model": "gemini-2.5-pro"
    },
    {
      "type": "custom",
      "title": "Security Considerations",
      "prompt": "Analyze the security measures implemented in this codebase...",
      "enabled": true
    }
  ],
  "diagrams": {
    "enabled": true,
    "types": ["architecture", "dataflow"]
  },
  "exclude": {
    "paths": [
      "node_modules/**",
      "dist/**",
      ".git/**",
      "**/*.test.ts",
      "**/__tests__/**"
    ]
  },
  "generation": {
    "defaultModel": "gemini-2.5-flash",
    "maxTokensPerSection": 2000,
    "parallelSections": 3
  }
}
```

#### Deliverables

**Updated:** `src/tools/wiki-generator.ts`

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

export class WikiGenerator {
  async loadConfig(repoPath: string): Promise<WikiConfig>;
  async mergeConfig(
    defaultConfig: WikiConfig,
    userConfig: WikiConfig
  ): WikiConfig;
}
```

**New File:** `.gemini/wiki.json.example`

Example configuration file for reference.

#### Testing

- [ ] Load and parse valid config
- [ ] Handle missing config gracefully
- [ ] Merge user config with defaults
- [ ] Validate config schema
- [ ] Test custom section generation
- [ ] Verify path exclusion works

---

### Phase 4: Semantic Search with RAG (Advanced)

**Timeline:** Week 4+
**Complexity:** High
**Dependencies:** Phases 1-3

#### Objectives

Enable semantic search across repository content using vector embeddings and RAG.

#### Features

1. **Repository Indexing**
   - Chunk code files into semantic blocks
   - Generate embeddings using Gemini Embedding API
   - Store embeddings with metadata
   - Support incremental updates

2. **Semantic Search**
   - Natural language queries
   - Return relevant code snippets with context
   - Rank results by similarity
   - Include file path and line numbers

3. **Embedding Cache**
   - Local JSON-based cache
   - Cache invalidation on file changes
   - Compression for large repositories

4. **MCP Tool Integration**
   - Query repository knowledge
   - Get context for specific questions
   - Enhance code understanding

#### Deliverables

**New File:** `src/tools/repo-search.ts`

```typescript
export interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number; // Similarity score
  context?: string; // Surrounding context
}

export interface IndexMetadata {
  repoPath: string;
  indexedAt: string;
  totalChunks: number;
  model: string; // Embedding model used
}

export class RepositorySearch {
  async indexRepository(
    repoPath: string,
    options?: IndexOptions
  ): Promise<IndexMetadata>;

  async search(
    repoPath: string,
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult[]>;

  async updateIndex(
    repoPath: string,
    changedFiles: string[]
  ): Promise<void>;
}
```

**New File:** `src/utils/embedding-cache.ts`

```typescript
export interface EmbeddingEntry {
  chunkId: string;
  filePath: string;
  content: string;
  embedding: number[]; // Vector
  metadata: {
    startLine: number;
    endLine: number;
    language: string;
  };
}

export class EmbeddingCache {
  async save(
    repoPath: string,
    entries: EmbeddingEntry[]
  ): Promise<void>;

  async load(repoPath: string): Promise<EmbeddingEntry[]>;

  async clear(repoPath: string): Promise<void>;
}
```

**New File:** `src/utils/code-chunker.ts`

```typescript
export class CodeChunker {
  chunkFile(
    content: string,
    filePath: string,
    maxChunkSize: number
  ): CodeChunk[];

  chunkByFunction(content: string, language: string): CodeChunk[];
  chunkByClass(content: string, language: string): CodeChunk[];
}
```

**MCP Tool Registration:**

```typescript
server.registerTool(
  'index_repository',
  {
    description: 'Create searchable index of repository using embeddings',
    inputSchema: z.object({
      repoPath: z.string().describe('Repository path'),
      force: z.boolean().optional().describe('Force re-index (default: false)'),
    }).shape,
  },
  async (params) => { /* implementation */ }
);

server.registerTool(
  'search_repository',
  {
    description: 'Search repository content using semantic search',
    inputSchema: z.object({
      repoPath: z.string().describe('Repository path'),
      query: z.string().describe('Search query'),
      topK: z.number().optional().describe('Number of results (default: 5)'),
    }).shape,
  },
  async (params) => { /* implementation */ }
);
```

#### Embedding Strategy

**Gemini Embedding API:**
- Model: `text-embedding-004`
- Dimension: 768
- Cost: Similar to text generation pricing

**Chunking Strategy:**
- Max chunk size: 512 tokens
- Overlap: 50 tokens
- Respect function/class boundaries when possible

**Storage Format:**

```json
{
  "metadata": {
    "repoPath": "/path/to/repo",
    "indexedAt": "2025-11-19T...",
    "totalChunks": 450,
    "model": "text-embedding-004"
  },
  "chunks": [
    {
      "chunkId": "src/server.ts:1-50",
      "filePath": "src/server.ts",
      "content": "import { McpServer } from...",
      "embedding": [0.123, -0.456, ...],
      "metadata": {
        "startLine": 1,
        "endLine": 50,
        "language": "typescript"
      }
    }
  ]
}
```

#### Testing

- [ ] Index small repository (< 1k LOC)
- [ ] Index medium repository (10k LOC)
- [ ] Verify embedding generation
- [ ] Test semantic search accuracy
- [ ] Verify cache persistence
- [ ] Test incremental updates
- [ ] Measure search performance

---

## API & Interface Design

### MCP Tool Specifications

#### 1. `analyze_repository`

**Purpose:** Analyze repository structure and extract metadata

**Input:**
```typescript
{
  repoPath: string;           // Required: absolute path
  includeStats?: boolean;     // Optional: default true
  maxDepth?: number;          // Optional: default 10
}
```

**Output:**
```typescript
{
  metadata: { ... },
  techStack: { ... },
  structure: { ... },
  statistics: { ... },
  timestamp: string
}
```

**Example Usage:**
```text
User: "Analyze the repository at /home/user/my-project"
Gemini invokes: analyze_repository({ repoPath: "/home/user/my-project" })
```

#### 2. `generate_repository_wiki`

**Purpose:** Generate comprehensive wiki documentation

**Input:**
```typescript
{
  repoPath: string;             // Required
  model?: string;               // Optional: default gemini-2.5-flash
  sections?: string[];          // Optional: default all
  includeDiagrams?: boolean;    // Optional: default true
}
```

**Output:**
```typescript
{
  title: string,
  description: string,
  sections: WikiSection[],
  diagrams: MermaidDiagram[],
  metadata: {
    generatedAt: string,
    model: string,
    totalTokens: number,
    estimatedCost: number
  }
}
```

**Example Usage:**
```text
User: "Generate a wiki for my project using Gemini 3 Pro"
Gemini invokes: generate_repository_wiki({
  repoPath: "/home/user/my-project",
  model: "gemini-3-pro-preview"
})
```

#### 3. `index_repository` (Phase 4)

**Purpose:** Create searchable index using embeddings

**Input:**
```typescript
{
  repoPath: string;
  force?: boolean;              // Default: false
}
```

**Output:**
```typescript
{
  repoPath: string,
  indexedAt: string,
  totalChunks: number,
  model: string,
  estimatedCost: number
}
```

#### 4. `search_repository` (Phase 4)

**Purpose:** Semantic search across repository

**Input:**
```typescript
{
  repoPath: string;
  query: string;
  topK?: number;                // Default: 5
}
```

**Output:**
```typescript
{
  query: string,
  results: SearchResult[],
  timestamp: string
}
```

**Example Usage:**
```text
User: "How does authentication work in this project?"
Gemini invokes: search_repository({
  repoPath: "/home/user/my-project",
  query: "authentication implementation"
})
```

---

## File Structure

### After Full Implementation

```text
gemini-context-extension/
├── src/
│   ├── server.ts                      # Updated with new tools
│   ├── tools/
│   │   ├── context-tracker.ts         # Existing
│   │   ├── cost-estimator.ts          # Existing
│   │   ├── repo-analyzer.ts           # NEW - Phase 1
│   │   ├── wiki-generator.ts          # NEW - Phase 2
│   │   └── repo-search.ts             # NEW - Phase 4
│   └── utils/
│       ├── token-counter.ts           # Existing
│       ├── project-detection.ts       # Existing
│       ├── file-scanner.ts            # NEW - Phase 1
│       ├── prompt-builder.ts          # NEW - Phase 2
│       ├── code-chunker.ts            # NEW - Phase 4
│       └── embedding-cache.ts         # NEW - Phase 4
├── .gemini/
│   ├── wiki.json                      # Example config
│   └── wiki.schema.json               # JSON schema for validation
├── examples/
│   ├── sample-wiki-output.md          # Example generated wiki
│   └── sample-mermaid-diagrams.md     # Example diagrams
├── tests/
│   ├── repo-analyzer.test.ts          # Unit tests
│   ├── wiki-generator.test.ts         # Unit tests
│   └── integration.test.ts            # Integration tests
├── docs/
│   ├── WIKI_GENERATOR_GUIDE.md        # User guide
│   └── PROMPTING_STRATEGIES.md        # Prompt engineering docs
├── WIKI_GENERATOR_PLAN.md             # This document
├── package.json                       # Updated dependencies
└── README.md                          # Updated with new features
```

### New Dependencies

**package.json additions:**

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "glob": "^11.0.0",
    "ignore": "^6.0.2"
  },
  "devDependencies": {
    "@types/glob": "^8.1.0"
  }
}
```

---

## Cost Analysis

### Gemini API Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| gemini-2.5-flash | $0.0003 | $0.0025 |
| gemini-2.5-pro | $0.00125 (≤200k) | $0.01 (≤200k) |
| gemini-3-pro-preview | $0.002 (≤200k) | $0.012 (≤200k) |
| text-embedding-004 | ~$0.0001 | N/A |

### Estimated Costs per Repository

**Small Repository (1k-5k LOC):**
- Analysis tokens: ~10k (repository structure)
- Wiki generation: ~30k input + ~10k output
- Diagrams: ~5k input + ~2k output
- **Total Cost (Flash):** $0.01 - $0.03

**Medium Repository (10k-50k LOC):**
- Analysis tokens: ~50k
- Wiki generation: ~100k input + ~30k output
- Diagrams: ~20k input + ~5k output
- **Total Cost (Flash):** $0.05 - $0.15

**Large Repository (50k-100k LOC):**
- Analysis tokens: ~200k
- Wiki generation: ~300k input + ~50k output
- Diagrams: ~50k input + ~10k output
- **Total Cost (Flash):** $0.20 - $0.40

**Phase 4 (Embeddings):**
- Indexing: ~$0.01 per 100k tokens
- Search queries: negligible

### Cost Calculation Examples

**Example 1: Medium Repository with Gemini 2.5 Flash**

Token Usage:
- Repository analysis: 50,000 tokens (input)
- Wiki generation: 100,000 tokens (input) + 30,000 tokens (output)
- Diagram generation: 20,000 tokens (input) + 5,000 tokens (output)
- **Total Input:** 170,000 tokens
- **Total Output:** 35,000 tokens

Cost Calculation:
- Input cost: (170,000 / 1,000,000) × $0.0003 = $0.000051
- Output cost: (35,000 / 1,000,000) × $0.0025 = $0.0000875
- **Total:** $0.0001385 ≈ **$0.00014**

**Example 2: Large Repository with Gemini 3 Pro (≤200k tokens)**

Token Usage:
- Repository analysis: 200,000 tokens (input)
- Wiki generation: 300,000 tokens (input) + 50,000 tokens (output)
- Diagram generation: 50,000 tokens (input) + 10,000 tokens (output)
- **Total Input:** 550,000 tokens (exceeds 200k threshold)
- **Total Output:** 60,000 tokens

Cost Calculation:
- First 200k input tokens: (200,000 / 1,000,000) × $0.002 = $0.0004
- Remaining 350k input tokens: (350,000 / 1,000,000) × $0.004 = $0.0014
- First 200k output tokens (all fit): (60,000 / 1,000,000) × $0.012 = $0.00072
- **Total:** $0.0004 + $0.0014 + $0.00072 = **$0.00252**

**Example 3: Embedding Index for Large Repository**

Token Usage:
- Code chunks: 500,000 tokens
- Embedding model: text-embedding-004

Cost Calculation:
- Embedding cost: (500,000 / 1,000,000) × $0.0001 = $0.00005
- **Total:** **$0.00005** (one-time indexing cost)

### Cost Optimization Strategies

1. **Use Gemini 2.5 Flash by default** - 10x cheaper than Pro
2. **Cache repository analysis** - Avoid re-analyzing unchanged repos
3. **Selective section generation** - Generate only needed sections
4. **Batch API calls** - Reduce overhead
5. **Token-aware chunking** - Optimize prompt sizes

---

## Testing Strategy

### Unit Tests

**Phase 1:**
- [ ] File scanning with various structures
- [ ] Tech stack detection accuracy
- [ ] Line counting accuracy
- [ ] `.gitignore` pattern matching

**Phase 2:**
- [ ] Prompt construction
- [ ] Section generation
- [ ] Mermaid syntax validation
- [ ] Error handling for API failures

**Phase 4:**
- [ ] Code chunking logic
- [ ] Embedding generation
- [ ] Similarity search algorithm
- [ ] Cache persistence

### Integration Tests

- [ ] End-to-end wiki generation
- [ ] Multiple repository types (TS, Python, Go)
- [ ] Config file loading and merging
- [ ] Cost estimation accuracy
- [ ] Performance benchmarks

### Test Repositories

Create sample repositories for testing:

1. **TypeScript/Node.js** - React application
2. **Python** - FastAPI backend
3. **Monorepo** - Multiple packages
4. **Large repo** - 100k+ LOC for performance testing

### Performance Benchmarks

| Repository Size | Analysis Time | Wiki Generation Time | Total Time |
|-----------------|--------------|---------------------|------------|
| Small (1-5k LOC) | < 5s | < 30s | < 35s |
| Medium (10-50k LOC) | < 15s | < 90s | < 105s |
| Large (50-100k LOC) | < 30s | < 180s | < 210s |

---

## Configuration & Customization

### Default Configuration

```typescript
const DEFAULT_CONFIG: WikiConfig = {
  version: '1.0',
  sections: [
    { type: 'overview', enabled: true },
    { type: 'architecture', enabled: true },
    { type: 'setup', enabled: true },
    { type: 'development', enabled: true },
    { type: 'api', enabled: true },
    { type: 'testing', enabled: true },
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
    defaultModel: 'gemini-2.5-flash',
    maxTokensPerSection: 2000,
    parallelSections: 3,
  },
};
```

### Section Types

| Type | Description | Default Enabled |
|------|-------------|-----------------|
| overview | Project overview and purpose | ✅ |
| architecture | System design and architecture | ✅ |
| setup | Installation and setup guide | ✅ |
| development | Development workflow | ✅ |
| api | API reference and documentation | ✅ |
| testing | Testing guide and practices | ✅ |
| deployment | Deployment instructions | ❌ |
| contributing | Contribution guidelines | ❌ |
| security | Security considerations | ❌ |
| custom | User-defined custom section | ❌ |

---

## Future Enhancements

### Version 2.0 Features

1. **Multi-language Support**
   - Generate wikis in different languages
   - Automatic translation using Gemini

2. **Interactive Diagrams**
   - Export to interactive formats
   - SVG generation from Mermaid

3. **Continuous Documentation**
   - Git hooks for auto-regeneration
   - Incremental updates on file changes

4. **Collaboration Features**
   - Multi-contributor documentation
   - Comment and review system

5. **Advanced Search**
   - Code similarity search
   - Cross-repository search

6. **Export Formats**
   - PDF generation
   - HTML static site
   - Confluence/Notion export

7. **AI Code Review**
   - Analyze code quality
   - Suggest improvements
   - Identify anti-patterns

8. **Integration Enhancements**
   - GitHub/GitLab integration
   - CI/CD pipeline support
   - Slack/Discord notifications

---

## References

### Devin AI Deepwiki
- **Documentation:** [https://docs.devin.ai/work-with-devin/deepwiki](https://docs.devin.ai/work-with-devin/deepwiki)
- **Open Source:** [https://github.com/AsyncFuncAI/deepwiki-open](https://github.com/AsyncFuncAI/deepwiki-open)
- **Blog Post:** [https://www.marktechpost.com/devin-ai-introduces-deepwiki](https://www.marktechpost.com/devin-ai-introduces-deepwiki)

### Gemini API Documentation
- **Generative AI SDK:** [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **Embeddings API:** [https://ai.google.dev/gemini-api/docs/embeddings](https://ai.google.dev/gemini-api/docs/embeddings)
- **Pricing:** [https://ai.google.dev/pricing](https://ai.google.dev/pricing)

### MCP Protocol
- **Specification:** [https://spec.modelcontextprotocol.io/](https://spec.modelcontextprotocol.io/)
- **SDK Documentation:** [https://github.com/modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)

### Related Technologies
- **Mermaid.js:** [https://mermaid.js.org/](https://mermaid.js.org/)
- **LangChain:** [https://js.langchain.com/](https://js.langchain.com/)
- **Tree-sitter:** [https://tree-sitter.github.io/](https://tree-sitter.github.io/) (for AST parsing)

---

## Implementation Timeline

### Week 1: Phase 1 - Repository Analysis
- Days 1-2: File scanner implementation
- Days 3-4: Tech stack detection
- Days 5-6: Code statistics and testing
- Day 7: MCP tool integration and documentation

### Week 2: Phase 2 - Wiki Generation
- Days 1-2: Gemini API integration and prompt engineering
- Days 3-4: Section generation implementation
- Days 5-6: Mermaid diagram generation
- Day 7: Testing and refinement

### Week 3: Phase 3 - Configuration
- Days 1-2: Config file schema and parsing
- Days 3-4: Template system
- Days 5-6: Git integration (optional)
- Day 7: Documentation and examples

### Week 4+: Phase 4 - RAG Search (Optional)
- Week 4: Embedding generation and storage
- Week 5: Search implementation
- Week 6: Optimization and caching
- Week 7: Testing and deployment

---

## Success Metrics

### Technical Metrics
- [ ] Analysis completes in < 30s for 100k LOC
- [ ] Wiki generation costs < $0.10 per average repo
- [ ] 95%+ success rate for wiki generation
- [ ] Valid Mermaid syntax in all diagrams
- [ ] Test coverage > 80%

### Quality Metrics
- [ ] Generated docs are accurate and relevant
- [ ] Diagrams correctly represent architecture
- [ ] Code examples are syntactically correct
- [ ] Documentation is well-structured and readable

### User Experience Metrics
- [ ] Simple one-command wiki generation
- [ ] Clear error messages and recovery
- [ ] Configurable without code changes
- [ ] Integrates seamlessly with existing tools

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Gemini API rate limits | High | Implement retry logic and backoff |
| Large repository performance | Medium | Add chunking and selective analysis |
| Invalid Mermaid syntax | Low | Validate syntax before returning |
| API cost overruns | Medium | Integrate cost estimation upfront |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API key security | High | Use environment variables, never commit |
| Inconsistent output quality | Medium | Refine prompts, use few-shot examples |
| Breaking API changes | Low | Pin SDK versions, monitor updates |

---

## Approval & Sign-off

This implementation plan requires approval before proceeding:

- [ ] Technical approach reviewed
- [ ] Cost estimates approved
- [ ] Timeline acceptable
- [ ] Phase priorities confirmed
- [ ] Resource allocation confirmed

**Ready to proceed with Phase 1 implementation?**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
**Status:** Awaiting Approval
