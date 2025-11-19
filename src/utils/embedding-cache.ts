import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/**
 * Represents an embedding entry with metadata
 */
export interface EmbeddingEntry {
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

/**
 * Metadata about the embedding index
 */
export interface IndexMetadata {
  repoPath: string;
  indexedAt: string;
  totalChunks: number;
  model: string;
  version: string;
}

/**
 * Complete embedding index structure
 */
export interface EmbeddingIndex {
  metadata: IndexMetadata;
  chunks: EmbeddingEntry[];
}

/**
 * Manages persistent storage of embeddings
 */
export class EmbeddingCache {
  private readonly CACHE_DIR = '.gemini';
  private readonly CACHE_FILE = 'embeddings.json';
  private readonly CACHE_VERSION = '1.0';

  /**
   * Save embeddings to cache
   */
  async save(
    repoPath: string,
    entries: EmbeddingEntry[],
    model: string = 'text-embedding-004'
  ): Promise<void> {
    const cachePath = this.getCachePath(repoPath);

    // Ensure cache directory exists
    const cacheDir = dirname(cachePath);
    await fs.mkdir(cacheDir, { recursive: true });

    const index: EmbeddingIndex = {
      metadata: {
        repoPath,
        indexedAt: new Date().toISOString(),
        totalChunks: entries.length,
        model,
        version: this.CACHE_VERSION,
      },
      chunks: entries,
    };

    // Write to file
    await fs.writeFile(cachePath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * Load embeddings from cache
   */
  async load(repoPath: string): Promise<EmbeddingIndex | null> {
    const cachePath = this.getCachePath(repoPath);

    try {
      const content = await fs.readFile(cachePath, 'utf-8');
      const index = JSON.parse(content) as EmbeddingIndex;

      // Validate version
      if (index.metadata.version !== this.CACHE_VERSION) {
        console.warn(
          `Cache version mismatch. Expected ${this.CACHE_VERSION}, got ${index.metadata.version}`
        );
        return null;
      }

      return index;
    } catch (error) {
      // Cache doesn't exist or can't be read
      return null;
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async exists(repoPath: string): Promise<boolean> {
    const index = await this.load(repoPath);
    return index !== null;
  }

  /**
   * Clear cache for a repository
   */
  async clear(repoPath: string): Promise<void> {
    const cachePath = this.getCachePath(repoPath);

    try {
      await fs.unlink(cachePath);
    } catch {
      // File doesn't exist or can't be deleted - that's fine
    }
  }

  /**
   * Get cache metadata without loading all embeddings
   */
  async getMetadata(repoPath: string): Promise<IndexMetadata | null> {
    const index = await this.load(repoPath);
    return index?.metadata || null;
  }

  /**
   * Update specific embeddings in the cache
   */
  async update(repoPath: string, updates: EmbeddingEntry[]): Promise<void> {
    const index = await this.load(repoPath);

    if (!index) {
      throw new Error('Cannot update cache that does not exist');
    }

    // Create a map of existing chunks
    const chunkMap = new Map<string, EmbeddingEntry>();
    for (const entry of index.chunks) {
      chunkMap.set(entry.chunkId, entry);
    }

    // Update or add new chunks
    for (const update of updates) {
      chunkMap.set(update.chunkId, update);
    }

    // Convert back to array
    const updatedChunks = Array.from(chunkMap.values());

    // Update metadata
    index.metadata.indexedAt = new Date().toISOString();
    index.metadata.totalChunks = updatedChunks.length;
    index.chunks = updatedChunks;

    // Save updated index
    const cachePath = this.getCachePath(repoPath);
    await fs.writeFile(cachePath, JSON.stringify(index, null, 2), 'utf-8');
  }

  /**
   * Get cache file size in bytes
   */
  async getCacheSize(repoPath: string): Promise<number> {
    const cachePath = this.getCachePath(repoPath);

    try {
      const stats = await fs.stat(cachePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Get the full cache file path
   */
  private getCachePath(repoPath: string): string {
    return join(repoPath, this.CACHE_DIR, this.CACHE_FILE);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0;
    }

    return dotProduct / denominator;
  }

  /**
   * Find top K most similar embeddings to a query embedding
   */
  static findTopK(
    queryEmbedding: number[],
    entries: EmbeddingEntry[],
    k: number = 5
  ): Array<{ entry: EmbeddingEntry; score: number }> {
    // Calculate similarities
    const similarities = entries.map((entry) => ({
      entry,
      score: this.cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Sort by score descending
    similarities.sort((a, b) => b.score - a.score);

    // Return top K
    return similarities.slice(0, k);
  }
}
