import { describe, it, expect, beforeAll } from '@jest/globals';
import { RepositoryAnalyzer } from '../../src/tools/repo-analyzer.js';
import { join } from 'path';
import { cwd } from 'process';

describe('Repository Analyzer E2E', () => {
  let analyzer: RepositoryAnalyzer;
  const sampleRepoPath = join(cwd(), 'tests/fixtures/sample-repo');

  beforeAll(() => {
    analyzer = new RepositoryAnalyzer();
  });

  describe('analyze()', () => {
    it('should analyze a TypeScript repository', async () => {
      const analysis = await analyzer.analyze(sampleRepoPath, {
        includeStats: true,
        maxDepth: 10,
      });

      // Verify metadata
      expect(analysis.metadata.name).toBe('sample-repo');
      expect(analysis.metadata.path).toBe(sampleRepoPath);
      expect(analysis.metadata.readme).toContain('Sample Repository');

      // Verify tech stack
      expect(analysis.techStack.primaryLanguage).toBe('TypeScript');
      expect(analysis.techStack.languages).toHaveProperty('TypeScript');
      expect(analysis.techStack.packageManagers).toContain('npm');
      expect(analysis.techStack.dependencies).toHaveProperty('express');
      expect(analysis.techStack.dependencies).toHaveProperty('zod');

      // Verify structure
      expect(analysis.structure.totalFiles).toBeGreaterThan(0);
      expect(analysis.structure.totalLines).toBeGreaterThan(0);

      // Verify statistics
      expect(analysis.statistics.codeFiles).toBeGreaterThan(0);
      expect(analysis.statistics.documentationFiles).toBeGreaterThan(0);

      // Verify timestamp
      expect(analysis.timestamp).toBeTruthy();
      expect(new Date(analysis.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should respect maxDepth parameter', async () => {
      const analysis = await analyzer.analyze(sampleRepoPath, {
        includeStats: false,
        maxDepth: 1,
      });

      expect(analysis.structure.maxDepth).toBeLessThanOrEqual(1);
    });

    it('should handle non-existent paths', async () => {
      await expect(
        analyzer.analyze('/path/that/does/not/exist')
      ).rejects.toThrow();
    });

    it('should handle file paths (not directories)', async () => {
      const filePath = join(sampleRepoPath, 'package.json');
      await expect(
        analyzer.analyze(filePath)
      ).rejects.toThrow('Path is not a directory');
    });

    it('should detect frameworks correctly', async () => {
      const analysis = await analyzer.analyze(sampleRepoPath);

      // Should detect common frameworks from dependencies
      expect(analysis.techStack.frameworks).toBeDefined();
      expect(Array.isArray(analysis.techStack.frameworks)).toBe(true);
    });

    it('should categorize files correctly', async () => {
      const analysis = await analyzer.analyze(sampleRepoPath);

      // Verify file categorization
      expect(analysis.statistics.codeFiles).toBeGreaterThan(0);
      expect(analysis.statistics.configFiles).toBeGreaterThan(0);
      expect(analysis.statistics.documentationFiles).toBeGreaterThan(0);
    });
  });
});
