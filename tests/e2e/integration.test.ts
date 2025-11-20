import { describe, it, expect } from '@jest/globals';
import { RepositoryAnalyzer } from '../../src/tools/repo-analyzer.js';
import { ContextTracker } from '../../src/tools/context-tracker.js';
import { CostEstimator } from '../../src/tools/cost-estimator.js';
import { join } from 'path';
import { cwd } from 'process';

describe('Integration Tests', () => {
  const sampleRepoPath = join(cwd(), 'tests/fixtures/sample-repo');

  describe('Complete workflow without API key', () => {
    it('should analyze repository, track context, and estimate costs', async () => {
      // Step 1: Analyze repository
      const analyzer = new RepositoryAnalyzer();
      const analysis = await analyzer.analyze(sampleRepoPath);

      expect(analysis.metadata.name).toBe('sample-repo');
      expect(analysis.techStack.primaryLanguage).toBe('TypeScript');

      // Step 2: Track context usage
      const tracker = new ContextTracker();
      const contextAnalysis = await tracker.analyze('standard', 'gemini-2.5-flash');

      expect(contextAnalysis.usage.used).toBeGreaterThan(0);
      expect(contextAnalysis.usage.percentage).toBeGreaterThanOrEqual(0);

      // Step 3: Estimate costs
      const estimator = new CostEstimator();
      const costEstimate = await estimator.estimate('gemini-2.5-flash', 10);

      expect(costEstimate.costs.totalRequests).toBe(10);
      expect(costEstimate.costs.total).toBeGreaterThan(0);

      // Verify all tools worked together
      expect(analysis).toBeTruthy();
      expect(contextAnalysis).toBeTruthy();
      expect(costEstimate).toBeTruthy();
    });

    it('should compare models and estimate costs for each', async () => {
      const estimator = new CostEstimator();

      // Get all models
      const models = estimator.getAllModels();
      expect(models.length).toBeGreaterThan(0);

      // Estimate cost for each model
      for (const model of models.slice(0, 3)) { // Test first 3 to save time
        const estimate = await estimator.estimate(model.id, 1);
        expect(estimate.costs.perRequest).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle multiple repositories', async () => {
      const analyzer = new RepositoryAnalyzer();

      // Analyze the same repo multiple times (simulating multiple repos)
      const results = await Promise.all([
        analyzer.analyze(sampleRepoPath),
        analyzer.analyze(sampleRepoPath),
        analyzer.analyze(sampleRepoPath),
      ]);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.metadata.name).toBe('sample-repo');
      });
    });
  });

  describe('Error handling integration', () => {
    it('should handle errors gracefully across tools', async () => {
      const analyzer = new RepositoryAnalyzer();

      // Test with invalid path
      await expect(
        analyzer.analyze('/invalid/path')
      ).rejects.toThrow();

      // Verify other tools still work
      const tracker = new ContextTracker();
      const analysis = await tracker.analyze();
      expect(analysis).toBeTruthy();
    });
  });
});
