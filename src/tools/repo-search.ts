import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileScanner, DirectoryNode } from '../utils/file-scanner.js';
import { CodeChunker } from '../utils/code-chunker.js';
import { EmbeddingCache, EmbeddingEntry, IndexMetadata } from '../utils/embedding-cache.js';

/**
 * Search result with similarity score
 */
export interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;
  context?: string;
  language: string;
}

/**
 * Options for indexing a repository
 */
export interface IndexOptions {
  force?: boolean; // Force re-index even if cache exists
  maxChunkSize?: number; // Maximum chunk size in characters
  model?: string; // Embedding model to use
  excludePatterns?: string[]; // File patterns to exclude
}

/**
 * Options for searching a repository
 */
export interface SearchOptions {
  topK?: number; // Number of results to return (default: 5)
  minScore?: number; // Minimum similarity score (default: 0.5)
  includeContext?: boolean; // Include surrounding context (default: false)
}

/**
 * Performs semantic search on repository code using embeddings
 */
export class RepositorySearch {
  private genAI: GoogleGenerativeAI | null = null;
  private scanner: FileScanner;
  private chunker: CodeChunker;
  private cache: EmbeddingCache;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    this.scanner = new FileScanner();
    this.chunker = new CodeChunker();
    this.cache = new EmbeddingCache();
  }

  /**
   * Index a repository for semantic search
   */
  async indexRepository(repoPath: string, options?: IndexOptions): Promise<IndexMetadata> {
    if (!this.genAI) {
      throw new Error('Gemini API key not provided. Cannot generate embeddings.');
    }

    const {
      force = false,
      maxChunkSize = 2000,
      model = 'text-embedding-004',
      excludePatterns = [],
    } = options || {};

    // Check if cache exists and we're not forcing re-index
    if (!force) {
      const existingIndex = await this.cache.load(repoPath);
      if (existingIndex) {
        console.log('Using existing embedding cache');
        return existingIndex.metadata;
      }
    }

    console.log('Starting repository indexing...');

    // Scan repository
    const files = await this.scanner.scanDirectory(repoPath, {
      maxDepth: 10,
      includeStats: false,
      respectGitignore: true,
    });

    // Collect all code files
    const codeFiles = this.collectCodeFiles(files, excludePatterns);
    console.log(`Found ${codeFiles.length} code files to index`);

    // Generate embeddings for all chunks
    const allEntries: EmbeddingEntry[] = [];
    let processedFiles = 0;

    for (const file of codeFiles) {
      try {
        const fullPath = join(repoPath, file.path);
        const content = await fs.readFile(fullPath, 'utf-8');

        // Chunk the file
        const language = file.language || 'unknown';
        const chunks = this.chunker.chunkFile(content, file.path, language, {
          maxChunkSize,
        });

        // Generate embeddings for each chunk
        for (const chunk of chunks) {
          const embedding = await this.generateEmbedding(chunk.content, model);

          allEntries.push({
            chunkId: chunk.chunkId,
            filePath: chunk.filePath,
            content: chunk.content,
            embedding,
            metadata: {
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              language: chunk.language,
            },
          });
        }

        processedFiles++;
        if (processedFiles % 10 === 0) {
          console.log(`Processed ${processedFiles}/${codeFiles.length} files...`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error);
        // Continue with next file
      }
    }

    console.log(`Generated ${allEntries.length} embeddings`);

    // Save to cache
    await this.cache.save(repoPath, allEntries, model);

    return {
      repoPath,
      indexedAt: new Date().toISOString(),
      totalChunks: allEntries.length,
      model,
      version: '1.0',
    };
  }

  /**
   * Search repository using semantic search
   */
  async search(repoPath: string, query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.genAI) {
      throw new Error('Gemini API key not provided. Cannot perform search.');
    }

    const { topK = 5, minScore = 0.5, includeContext = false } = options || {};

    // Load cached embeddings
    const index = await this.cache.load(repoPath);
    if (!index) {
      throw new Error('Repository has not been indexed. Please run index_repository first.');
    }

    console.log(`Searching ${index.chunks.length} chunks...`);

    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(query, index.metadata.model);

    // Find top K similar chunks
    const topResults = EmbeddingCache.findTopK(queryEmbedding, index.chunks, topK);

    // Filter by minimum score and convert to SearchResult
    const results: SearchResult[] = topResults
      .filter((result) => result.score >= minScore)
      .map((result) => ({
        filePath: result.entry.filePath,
        startLine: result.entry.metadata.startLine,
        endLine: result.entry.metadata.endLine,
        content: result.entry.content,
        score: result.score,
        language: result.entry.metadata.language,
        ...(includeContext && {
          context: this.extractContext(result.entry),
        }),
      }));

    return results;
  }

  /**
   * Update index for specific files (incremental update)
   */
  async updateIndex(repoPath: string, changedFiles: string[]): Promise<void> {
    if (!this.genAI) {
      throw new Error('Gemini API key not provided. Cannot update index.');
    }

    // Load existing index
    const index = await this.cache.load(repoPath);
    if (!index) {
      throw new Error('Repository has not been indexed. Please run index_repository first.');
    }

    const updatedEntries: EmbeddingEntry[] = [];

    for (const filePath of changedFiles) {
      try {
        const fullPath = join(repoPath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        const language = this.scanner.detectLanguage(fullPath);

        // Chunk the file
        const chunks = this.chunker.chunkFile(content, filePath, language);

        // Generate embeddings
        for (const chunk of chunks) {
          const embedding = await this.generateEmbedding(chunk.content, index.metadata.model);

          updatedEntries.push({
            chunkId: chunk.chunkId,
            filePath: chunk.filePath,
            content: chunk.content,
            embedding,
            metadata: {
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              language: chunk.language,
            },
          });
        }
      } catch (error) {
        console.error(`Error updating file ${filePath}:`, error);
      }
    }

    // Update cache
    await this.cache.update(repoPath, updatedEntries);
  }

  /**
   * Generate embedding for text using Gemini Embedding API
   */
  private async generateEmbedding(text: string, model: string): Promise<number[]> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Collect all code files from directory tree
   */
  private collectCodeFiles(
    nodes: DirectoryNode[],
    excludePatterns: string[],
    result: DirectoryNode[] = []
  ): DirectoryNode[] {
    for (const node of nodes) {
      if (node.type === 'file' && node.language && node.language !== 'unknown') {
        // Check if file matches any exclude pattern
        const shouldExclude = excludePatterns.some((pattern) => node.path.includes(pattern));

        if (!shouldExclude) {
          result.push(node);
        }
      }

      if (node.children) {
        this.collectCodeFiles(node.children, excludePatterns, result);
      }
    }

    return result;
  }

  /**
   * Extract context around a code chunk
   */
  private extractContext(entry: EmbeddingEntry): string {
    // Simple context extraction - just return the chunk content
    // A more sophisticated version would read the file and include surrounding lines
    return `${entry.filePath}:${entry.metadata.startLine}-${entry.metadata.endLine}`;
  }

  /**
   * Get index metadata without loading all embeddings
   */
  async getIndexMetadata(repoPath: string): Promise<IndexMetadata | null> {
    return await this.cache.getMetadata(repoPath);
  }

  /**
   * Check if repository is indexed
   */
  async isIndexed(repoPath: string): Promise<boolean> {
    return await this.cache.exists(repoPath);
  }

  /**
   * Clear index for a repository
   */
  async clearIndex(repoPath: string): Promise<void> {
    await this.cache.clear(repoPath);
  }
}
