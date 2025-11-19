import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { FileScanner, DirectoryNode } from '../utils/file-scanner.js';

/**
 * Options for repository analysis
 */
export interface AnalyzerOptions {
  includeStats?: boolean;
  maxDepth?: number;
}

/**
 * Repository metadata
 */
export interface RepositoryMetadata {
  name: string;
  path: string;
  description?: string;
  readme?: string;
  license?: string;
}

/**
 * Technology stack information
 */
export interface TechStack {
  primaryLanguage: string;
  languages: Record<string, number>; // language -> line count
  frameworks: string[];
  packageManagers: string[];
  dependencies: Record<string, string>;
}

/**
 * Repository structure information
 */
export interface RepositoryStructure {
  totalFiles: number;
  totalLines: number;
  maxDepth: number;
  directories: DirectoryNode[];
}

/**
 * Repository statistics
 */
export interface RepositoryStatistics {
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  documentationFiles: number;
}

/**
 * Complete repository analysis result
 */
export interface RepositoryAnalysis {
  metadata: RepositoryMetadata;
  techStack: TechStack;
  structure: RepositoryStructure;
  statistics: RepositoryStatistics;
  timestamp: string;
}

/**
 * Analyzes repository structure, tech stack, and statistics without using AI
 */
export class RepositoryAnalyzer {
  private scanner: FileScanner;

  constructor() {
    this.scanner = new FileScanner();
  }

  /**
   * Analyze a repository and return comprehensive information
   */
  async analyze(repoPath: string, options?: AnalyzerOptions): Promise<RepositoryAnalysis> {
    const { includeStats = true, maxDepth = 10 } = options || {};

    // Verify the path exists
    try {
      const stats = await fs.stat(repoPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${repoPath}`);
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Repository path does not exist: ${repoPath}`);
      }
      throw error;
    }

    // Scan directory structure
    const directories = await this.scanner.scanDirectory(repoPath, {
      maxDepth,
      includeStats,
      respectGitignore: true,
    });

    // Extract metadata
    const metadata = await this.extractMetadata(repoPath);

    // Detect tech stack
    const techStack = await this.detectTechStack(repoPath, directories);

    // Calculate structure statistics
    const structure = this.analyzeStructure(directories);

    // Categorize files
    const statistics = this.calculateStatistics(directories);

    return {
      metadata,
      techStack,
      structure,
      statistics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract repository metadata (README, LICENSE, etc.)
   */
  private async extractMetadata(repoPath: string): Promise<RepositoryMetadata> {
    const metadata: RepositoryMetadata = {
      name: basename(repoPath),
      path: repoPath,
    };

    // Try to find and read README
    const readmeVariants = ['README.md', 'readme.md', 'README', 'README.txt'];
    for (const variant of readmeVariants) {
      try {
        const readmePath = join(repoPath, variant);
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        metadata.readme = readmeContent;

        // Extract description from first paragraph
        const lines = readmeContent.split('\n');
        const firstParagraph = lines.find((line) => line.trim() && !line.startsWith('#'));
        if (firstParagraph) {
          metadata.description = firstParagraph.trim();
        }
        break;
      } catch {
        // Try next variant
      }
    }

    // Try to find and read LICENSE
    const licenseVariants = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'COPYING'];
    for (const variant of licenseVariants) {
      try {
        const licensePath = join(repoPath, variant);
        const licenseContent = await fs.readFile(licensePath, 'utf-8');

        // Try to detect license type from content
        const licenseType = this.detectLicenseType(licenseContent);
        metadata.license = licenseType || 'Custom License';
        break;
      } catch {
        // Try next variant
      }
    }

    return metadata;
  }

  /**
   * Detect license type from license file content
   */
  private detectLicenseType(content: string): string | null {
    const licensePatterns: Record<string, RegExp> = {
      'MIT License': /MIT License/i,
      'Apache License 2.0': /Apache License.*Version 2\.0/i,
      'GPL-3.0': /GNU GENERAL PUBLIC LICENSE.*Version 3/i,
      'GPL-2.0': /GNU GENERAL PUBLIC LICENSE.*Version 2/i,
      'BSD-3-Clause': /BSD 3-Clause/i,
      'BSD-2-Clause': /BSD 2-Clause/i,
      'ISC License': /ISC License/i,
      'Mozilla Public License 2.0': /Mozilla Public License.*Version 2\.0/i,
    };

    for (const [name, pattern] of Object.entries(licensePatterns)) {
      if (pattern.test(content)) {
        return name;
      }
    }

    return null;
  }

  /**
   * Detect technology stack from project files
   */
  private async detectTechStack(
    repoPath: string,
    directories: DirectoryNode[]
  ): Promise<TechStack> {
    const languages: Record<string, number> = {};
    const frameworks: string[] = [];
    const packageManagers: string[] = [];
    const dependencies: Record<string, string> = {};

    // Count lines by language
    this.countLanguages(directories, languages);

    // Detect package managers and frameworks
    await this.detectPackageManagers(repoPath, packageManagers, frameworks, dependencies);

    // Determine primary language
    const primaryLanguage = this.getPrimaryLanguage(languages);

    return {
      primaryLanguage,
      languages,
      frameworks,
      packageManagers,
      dependencies,
    };
  }

  /**
   * Recursively count lines by language
   */
  private countLanguages(nodes: DirectoryNode[], languages: Record<string, number>): void {
    for (const node of nodes) {
      if (node.type === 'file' && node.language && node.lines) {
        if (!languages[node.language]) {
          languages[node.language] = 0;
        }
        languages[node.language] += node.lines;
      }

      if (node.children) {
        this.countLanguages(node.children, languages);
      }
    }
  }

  /**
   * Detect package managers and extract dependencies
   */
  private async detectPackageManagers(
    repoPath: string,
    packageManagers: string[],
    frameworks: string[],
    dependencies: Record<string, string>
  ): Promise<void> {
    // Node.js / npm
    try {
      const packageJsonPath = join(repoPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      packageManagers.push('npm');

      // Extract dependencies (guard against undefined)
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      for (const [name, version] of Object.entries(allDeps)) {
        dependencies[name] = version as string;
      }

      // Detect frameworks
      this.detectNodeFrameworks(allDeps, frameworks);
    } catch {
      // No package.json
    }

    // Python / pip
    try {
      const requirementsPath = join(repoPath, 'requirements.txt');
      await fs.access(requirementsPath);
      packageManagers.push('pip');

      const content = await fs.readFile(requirementsPath, 'utf-8');
      this.parsePythonRequirements(content, dependencies, frameworks);
    } catch {
      // No requirements.txt
    }

    // Python / poetry
    try {
      const pyprojectPath = join(repoPath, 'pyproject.toml');
      await fs.access(pyprojectPath);
      packageManagers.push('poetry');
    } catch {
      // No pyproject.toml
    }

    // Rust / cargo
    try {
      const cargoPath = join(repoPath, 'Cargo.toml');
      await fs.access(cargoPath);
      packageManagers.push('cargo');
      frameworks.push('Rust');
    } catch {
      // No Cargo.toml
    }

    // Go
    try {
      const goModPath = join(repoPath, 'go.mod');
      await fs.access(goModPath);
      packageManagers.push('go modules');
      frameworks.push('Go');
    } catch {
      // No go.mod
    }

    // Ruby / bundler
    try {
      const gemfilePath = join(repoPath, 'Gemfile');
      await fs.access(gemfilePath);
      packageManagers.push('bundler');
      frameworks.push('Ruby');
    } catch {
      // No Gemfile
    }

    // Java / Maven
    try {
      const pomPath = join(repoPath, 'pom.xml');
      await fs.access(pomPath);
      packageManagers.push('maven');
      frameworks.push('Java');
    } catch {
      // No pom.xml
    }

    // Java / Gradle
    try {
      const gradlePath = join(repoPath, 'build.gradle');
      await fs.access(gradlePath);
      packageManagers.push('gradle');
      frameworks.push('Java');
    } catch {
      // No build.gradle
    }
  }

  /**
   * Detect Node.js frameworks from dependencies
   */
  private detectNodeFrameworks(dependencies: Record<string, unknown>, frameworks: string[]): void {
    const frameworkDetection: Record<string, string> = {
      react: 'React',
      'react-dom': 'React',
      next: 'Next.js',
      vue: 'Vue.js',
      nuxt: 'Nuxt.js',
      '@angular/core': 'Angular',
      svelte: 'Svelte',
      express: 'Express',
      fastify: 'Fastify',
      koa: 'Koa',
      '@nestjs/core': 'NestJS',
      gatsby: 'Gatsby',
      '@remix-run/react': 'Remix',
      astro: 'Astro',
      vite: 'Vite',
      webpack: 'Webpack',
      rollup: 'Rollup',
      '@modelcontextprotocol/sdk': 'MCP',
    };

    for (const [dep, framework] of Object.entries(frameworkDetection)) {
      if (dependencies[dep] && !frameworks.includes(framework)) {
        frameworks.push(framework);
      }
    }
  }

  /**
   * Parse Python requirements.txt
   */
  private parsePythonRequirements(
    content: string,
    dependencies: Record<string, string>,
    frameworks: string[]
  ): void {
    const lines = content.split('\n');
    const frameworkDetection: Record<string, string> = {
      django: 'Django',
      flask: 'Flask',
      fastapi: 'FastAPI',
      tornado: 'Tornado',
      pyramid: 'Pyramid',
      numpy: 'NumPy',
      pandas: 'Pandas',
      tensorflow: 'TensorFlow',
      pytorch: 'PyTorch',
      scikit: 'Scikit-learn',
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Parse package==version or package>=version
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)([>=<~!]+.*)?$/);
      if (match) {
        const [, pkg, version] = match;
        dependencies[pkg] = version?.trim() || 'latest';

        // Check for frameworks
        const pkgLower = pkg.toLowerCase();
        for (const [key, framework] of Object.entries(frameworkDetection)) {
          if (pkgLower.includes(key) && !frameworks.includes(framework)) {
            frameworks.push(framework);
          }
        }
      }
    }
  }

  /**
   * Get primary language based on line counts
   */
  private getPrimaryLanguage(languages: Record<string, number>): string {
    if (Object.keys(languages).length === 0) {
      return 'Unknown';
    }

    // Filter out non-code languages
    const codeLanguages = { ...languages };
    delete codeLanguages['JSON'];
    delete codeLanguages['YAML'];
    delete codeLanguages['TOML'];
    delete codeLanguages['Markdown'];
    delete codeLanguages['Text'];
    delete codeLanguages['unknown'];

    if (Object.keys(codeLanguages).length === 0) {
      // Fallback to any language
      const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
      return sorted[0][0];
    }

    const sorted = Object.entries(codeLanguages).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  /**
   * Analyze directory structure and calculate statistics
   */
  private analyzeStructure(directories: DirectoryNode[]): RepositoryStructure {
    let totalFiles = 0;
    let totalLines = 0;
    let maxDepth = 0;

    const countStats = (nodes: DirectoryNode[]): void => {
      for (const node of nodes) {
        if (node.type === 'file') {
          totalFiles++;
          if (node.lines) {
            totalLines += node.lines;
          }
        }

        if (node.depth > maxDepth) {
          maxDepth = node.depth;
        }

        if (node.children) {
          countStats(node.children);
        }
      }
    };

    countStats(directories);

    return {
      totalFiles,
      totalLines,
      maxDepth,
      directories,
    };
  }

  /**
   * Calculate file statistics by category
   */
  private calculateStatistics(directories: DirectoryNode[]): RepositoryStatistics {
    const stats: RepositoryStatistics = {
      codeFiles: 0,
      testFiles: 0,
      configFiles: 0,
      documentationFiles: 0,
    };

    const categorize = (nodes: DirectoryNode[]): void => {
      for (const node of nodes) {
        if (node.type === 'file') {
          const fileType = this.scanner.detectFileType(node.path);

          switch (fileType) {
            case 'code':
              stats.codeFiles++;
              break;
            case 'test':
              stats.testFiles++;
              break;
            case 'config':
              stats.configFiles++;
              break;
            case 'documentation':
              stats.documentationFiles++;
              break;
          }
        }

        if (node.children) {
          categorize(node.children);
        }
      }
    };

    categorize(directories);

    return stats;
  }
}
