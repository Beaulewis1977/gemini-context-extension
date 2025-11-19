import { promises as fs } from 'fs';
import { join, relative, extname, basename } from 'path';
import ignore from 'ignore';

/**
 * Represents a node in the directory tree
 */
export interface DirectoryNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  depth: number;
  children?: DirectoryNode[];
  size?: number;
  lines?: number;
  language?: string;
}

/**
 * Options for scanning directories
 */
export interface ScanOptions {
  maxDepth?: number;
  includeStats?: boolean;
  respectGitignore?: boolean;
}

/**
 * Represents file type categories
 */
export type FileType =
  | 'code'
  | 'test'
  | 'config'
  | 'documentation'
  | 'build'
  | 'data'
  | 'image'
  | 'other';

/**
 * Scanner for analyzing file system structure and content
 */
export class FileScanner {
  /**
   * Scans a directory and returns its tree structure
   * @param dirPath - Absolute path to the directory to scan
   * @param options - Scanning options (maxDepth, includeStats, respectGitignore)
   * @returns Array of directory nodes representing the file tree
   */
  async scanDirectory(dirPath: string, options: ScanOptions = {}): Promise<DirectoryNode[]> {
    const { maxDepth = 10, includeStats = true, respectGitignore = true } = options;

    // Load .gitignore if needed (create local filter to avoid shared state)
    let ignoreFilter: ReturnType<typeof ignore> | null = null;
    if (respectGitignore) {
      ignoreFilter = await this.loadGitignore(dirPath);
    }

    return this.scanRecursive(dirPath, dirPath, 0, maxDepth, includeStats, ignoreFilter);
  }

  /**
   * Recursively scan directory structure
   */
  private async scanRecursive(
    rootPath: string,
    currentPath: string,
    depth: number,
    maxDepth: number,
    includeStats: boolean,
    ignoreFilter: ReturnType<typeof ignore> | null
  ): Promise<DirectoryNode[]> {
    if (depth > maxDepth) {
      return [];
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const nodes: DirectoryNode[] = [];

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);
        const relativePath = relative(rootPath, fullPath);

        // Check if should be ignored
        if (this.shouldIgnore(relativePath, ignoreFilter)) {
          continue;
        }

        if (entry.isDirectory()) {
          // Skip common large directories even if not in .gitignore
          if (this.isCommonIgnoreDir(entry.name)) {
            continue;
          }

          const children = await this.scanRecursive(
            rootPath,
            fullPath,
            depth + 1,
            maxDepth,
            includeStats,
            ignoreFilter
          );

          nodes.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            depth,
            children,
          });
        } else if (entry.isFile()) {
          const node: DirectoryNode = {
            name: entry.name,
            path: relativePath,
            type: 'file',
            depth,
          };

          if (includeStats) {
            const stats = await fs.stat(fullPath);
            node.size = stats.size;
            node.language = this.detectLanguage(fullPath);

            // Only count lines for text files
            if (node.language && node.language !== 'unknown') {
              try {
                node.lines = await this.countLines(fullPath);
              } catch {
                // If we can't count lines (binary file, etc.), skip
                node.lines = 0;
              }
            }
          }

          nodes.push(node);
        }
      }

      return nodes;
    } catch (error) {
      // If we can't read a directory, return empty array
      console.warn(`Warning: Could not read directory ${currentPath}:`, error);
      return [];
    }
  }

  /**
   * Load .gitignore file and create an ignore filter
   * @param rootPath - Root directory to search for .gitignore
   * @returns Ignore filter instance or null if no .gitignore found
   */
  private async loadGitignore(rootPath: string): Promise<ReturnType<typeof ignore> | null> {
    const gitignorePath = join(rootPath, '.gitignore');

    try {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      return ignore().add(gitignoreContent);
    } catch {
      // No .gitignore file or can't read it
      return null;
    }
  }

  /**
   * Check if a path should be ignored based on .gitignore patterns
   * @param relativePath - Path relative to repository root
   * @param ignoreFilter - Ignore filter instance to use
   * @returns True if path should be ignored
   */
  private shouldIgnore(
    relativePath: string,
    ignoreFilter: ReturnType<typeof ignore> | null
  ): boolean {
    if (!ignoreFilter) {
      return false;
    }

    return ignoreFilter.ignores(relativePath);
  }

  /**
   * Check if directory is commonly ignored (even without .gitignore)
   */
  private isCommonIgnoreDir(dirName: string): boolean {
    const commonIgnoreDirs = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      'dist',
      'build',
      'out',
      'target',
      '__pycache__',
      '.pytest_cache',
      '.mypy_cache',
      'venv',
      'env',
      '.venv',
      '.env',
      'coverage',
      '.nyc_output',
      'vendor',
    ];

    return commonIgnoreDirs.includes(dirName);
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    const fileName = basename(filePath).toLowerCase();

    // Language mapping by extension
    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.mjs': 'JavaScript',
      '.cjs': 'JavaScript',
      '.py': 'Python',
      '.pyw': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.c': 'C',
      '.h': 'C',
      '.cpp': 'C++',
      '.cc': 'C++',
      '.cxx': 'C++',
      '.hpp': 'C++',
      '.cs': 'C#',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.kts': 'Kotlin',
      '.scala': 'Scala',
      '.r': 'R',
      '.sh': 'Shell',
      '.bash': 'Shell',
      '.zsh': 'Shell',
      '.fish': 'Shell',
      '.ps1': 'PowerShell',
      '.sql': 'SQL',
      '.html': 'HTML',
      '.htm': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'Sass',
      '.less': 'Less',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.toml': 'TOML',
      '.xml': 'XML',
      '.md': 'Markdown',
      '.markdown': 'Markdown',
      '.rst': 'reStructuredText',
      '.txt': 'Text',
      '.vue': 'Vue',
      '.svelte': 'Svelte',
      '.dart': 'Dart',
      '.lua': 'Lua',
      '.pl': 'Perl',
      '.ex': 'Elixir',
      '.exs': 'Elixir',
      '.erl': 'Erlang',
      '.hrl': 'Erlang',
      '.clj': 'Clojure',
      '.cljs': 'ClojureScript',
      '.elm': 'Elm',
      '.hs': 'Haskell',
      '.ml': 'OCaml',
      '.fs': 'F#',
      '.jl': 'Julia',
      '.nim': 'Nim',
      '.zig': 'Zig',
      '.v': 'Verilog',
      '.sol': 'Solidity',
    };

    // Special filename cases
    const specialFiles: Record<string, string> = {
      dockerfile: 'Dockerfile',
      makefile: 'Makefile',
      rakefile: 'Ruby',
      gemfile: 'Ruby',
      'cargo.toml': 'TOML',
      'go.mod': 'Go Module',
      'go.sum': 'Go Module',
    };

    if (specialFiles[fileName]) {
      return specialFiles[fileName];
    }

    return languageMap[ext] || 'unknown';
  }

  /**
   * Detect file type category
   */
  detectFileType(filePath: string): FileType {
    const fileName = basename(filePath).toLowerCase();
    const ext = extname(filePath).toLowerCase();

    // Test files
    if (
      fileName.includes('.test.') ||
      fileName.includes('.spec.') ||
      fileName.includes('_test.') ||
      fileName.includes('_spec.') ||
      filePath.includes('__tests__') ||
      filePath.includes('/tests/') ||
      filePath.includes('/test/')
    ) {
      return 'test';
    }

    // Config files
    const configPatterns = [
      'package.json',
      'tsconfig.json',
      'webpack.config',
      'vite.config',
      'rollup.config',
      'babel.config',
      '.eslintrc',
      '.prettierrc',
      'jest.config',
      'vitest.config',
      '.gitignore',
      '.dockerignore',
      'dockerfile',
      'docker-compose',
      'makefile',
      'cargo.toml',
      'go.mod',
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'gemfile',
    ];

    if (
      configPatterns.some((pattern) => fileName.includes(pattern)) ||
      ['.yaml', '.yml', '.toml', '.ini', '.env', '.properties'].includes(ext)
    ) {
      return 'config';
    }

    // Documentation
    if (['.md', '.txt', '.rst', '.adoc'].includes(ext) || fileName.startsWith('readme')) {
      return 'documentation';
    }

    // Build artifacts
    if (
      filePath.includes('/dist/') ||
      filePath.includes('/build/') ||
      filePath.includes('/out/') ||
      ['.min.js', '.min.css', '.map'].includes(ext)
    ) {
      return 'build';
    }

    // Data files
    if (['.json', '.csv', '.xml', '.sql', '.db', '.sqlite'].includes(ext)) {
      return 'data';
    }

    // Images
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
      return 'image';
    }

    // Code files
    const codeExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '.cjs',
      '.py',
      '.pyw',
      '.java',
      '.go',
      '.rs',
      '.c',
      '.h',
      '.cpp',
      '.cc',
      '.cxx',
      '.hpp',
      '.cs',
      '.rb',
      '.php',
      '.swift',
      '.kt',
      '.kts',
      '.scala',
      '.r',
      '.sh',
      '.bash',
      '.ps1',
      '.vue',
      '.svelte',
      '.dart',
      '.lua',
      '.pl',
      '.ex',
      '.exs',
      '.erl',
      '.hrl',
      '.clj',
      '.cljs',
      '.elm',
      '.hs',
      '.ml',
      '.fs',
      '.jl',
      '.nim',
      '.zig',
      '.v',
      '.sol',
    ];

    if (codeExtensions.includes(ext)) {
      return 'code';
    }

    return 'other';
  }

  /**
   * Count lines in a file
   */
  async countLines(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').length;
      return lines;
    } catch {
      // If file is binary or can't be read, return 0
      return 0;
    }
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }
}
