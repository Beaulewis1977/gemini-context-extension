/**
 * Represents a code chunk with metadata
 */
export interface CodeChunk {
  chunkId: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  language: string;
}

/**
 * Options for code chunking
 */
export interface ChunkOptions {
  maxChunkSize?: number; // Maximum size in characters (default: 2000)
  overlap?: number; // Number of characters to overlap between chunks (default: 200)
  respectBoundaries?: boolean; // Try to respect function/class boundaries (default: true)
}

/**
 * Chunks code files into semantic blocks for embedding
 */
export class CodeChunker {
  private readonly DEFAULT_MAX_CHUNK_SIZE = 2000;
  private readonly DEFAULT_OVERLAP = 200;

  /**
   * Chunk a file into semantic blocks
   */
  chunkFile(
    content: string,
    filePath: string,
    language: string,
    options?: ChunkOptions
  ): CodeChunk[] {
    const { maxChunkSize = this.DEFAULT_MAX_CHUNK_SIZE, overlap = this.DEFAULT_OVERLAP } =
      options || {};

    const lines = content.split('\n');
    const chunks: CodeChunk[] = [];
    let currentChunk: string[] = [];
    let currentSize = 0;
    let chunkStartLine = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineSize = line.length + 1; // +1 for newline

      // If adding this line would exceed max size and we have content, create a chunk
      if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
        chunks.push(this.createChunk(currentChunk, filePath, language, chunkStartLine, i));

        // Start new chunk with overlap
        const overlapLines = this.getOverlapLines(currentChunk, overlap);
        currentChunk = overlapLines;
        currentSize = overlapLines.reduce((sum, l) => sum + l.length + 1, 0);
        chunkStartLine = i - overlapLines.length + 1;
      }

      currentChunk.push(line);
      currentSize += lineSize;
    }

    // Add final chunk if there's content
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(currentChunk, filePath, language, chunkStartLine, lines.length));
    }

    return chunks;
  }

  /**
   * Chunk code by attempting to identify function boundaries
   * This is a simplified implementation - a full version would use AST parsing
   */
  chunkByFunction(content: string, filePath: string, language: string): CodeChunk[] {
    // For simplicity, use regex to detect function-like patterns
    // A production implementation would use tree-sitter or similar AST parser
    const chunks: CodeChunk[] = [];
    const lines = content.split('\n');

    // Patterns that suggest function/class boundaries
    const boundaryPatterns = [
      /^\s*(export\s+)?(async\s+)?function\s+\w+/,
      /^\s*(export\s+)?class\s+\w+/,
      /^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?\(/,
      /^\s*(public|private|protected)\s+\w+\s*\(/,
      /^\s*def\s+\w+/, // Python
      /^\s*func\s+\w+/, // Go
      /^\s*fn\s+\w+/, // Rust
    ];

    let currentChunk: string[] = [];
    let chunkStartLine = 1;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track brace depth
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      // Check if this is a boundary line
      const isBoundary = boundaryPatterns.some((pattern) => pattern.test(line));

      // If we hit a boundary and we're at depth 0, save current chunk and start new one
      if (isBoundary && braceDepth === 0 && currentChunk.length > 0) {
        chunks.push(this.createChunk(currentChunk, filePath, language, chunkStartLine, i));
        currentChunk = [];
        chunkStartLine = i + 1;
      }

      currentChunk.push(line);

      // Also chunk if we get too large (fallback to size-based chunking)
      if (currentChunk.join('\n').length > this.DEFAULT_MAX_CHUNK_SIZE) {
        chunks.push(this.createChunk(currentChunk, filePath, language, chunkStartLine, i + 1));
        currentChunk = [];
        chunkStartLine = i + 2;
      }
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(currentChunk, filePath, language, chunkStartLine, lines.length));
    }

    return chunks.length > 0 ? chunks : this.chunkFile(content, filePath, language);
  }

  /**
   * Create a code chunk from lines
   */
  private createChunk(
    lines: string[],
    filePath: string,
    language: string,
    startLine: number,
    endLine: number
  ): CodeChunk {
    const content = lines.join('\n');
    const chunkId = `${filePath}:${startLine}-${endLine}`;

    return {
      chunkId,
      filePath,
      content,
      startLine,
      endLine,
      language,
    };
  }

  /**
   * Get overlap lines from the end of a chunk
   */
  private getOverlapLines(lines: string[], overlapChars: number): string[] {
    const overlapLines: string[] = [];
    let currentSize = 0;

    // Take lines from the end until we reach overlap size
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (currentSize + line.length + 1 > overlapChars) {
        break;
      }
      overlapLines.unshift(line);
      currentSize += line.length + 1;
    }

    return overlapLines;
  }

  /**
   * Estimate if a file should be chunked based on its size
   */
  shouldChunk(content: string, maxSize: number = this.DEFAULT_MAX_CHUNK_SIZE): boolean {
    return content.length > maxSize;
  }

  /**
   * Count total chunks that would be created for a file
   */
  estimateChunkCount(
    content: string,
    maxChunkSize: number = this.DEFAULT_MAX_CHUNK_SIZE,
    overlap: number = this.DEFAULT_OVERLAP
  ): number {
    if (!this.shouldChunk(content, maxChunkSize)) {
      return 1;
    }

    const effectiveChunkSize = maxChunkSize - overlap;
    return Math.ceil(content.length / effectiveChunkSize);
  }
}
