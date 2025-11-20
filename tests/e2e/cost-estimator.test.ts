import { describe, it, expect, beforeAll } from '@jest/globals';
import { CostEstimator } from '../../src/tools/cost-estimator.js';

describe('Cost Estimator E2E', () => {
  let estimator: CostEstimator;

  beforeAll(() => {
    estimator = new CostEstimator();
  });

  describe('estimate()', () => {
    it('should estimate costs for default model', async () => {
      const estimate = await estimator.estimate();

      expect(estimate.model).toBe('Gemini 2.5 Flash');
      expect(estimate.contextTokens).toBeGreaterThan(0);
      expect(estimate.estimatedResponseTokens).toBe(500);
      expect(estimate.costs.perRequest).toBeGreaterThan(0);
      expect(estimate.costs.totalRequests).toBe(1);
      expect(estimate.costs.total).toBe(estimate.costs.perRequest);
      expect(estimate.breakdown.inputCost).toBeGreaterThan(0);
      expect(estimate.breakdown.outputCost).toBeGreaterThan(0);
    });

    it('should estimate costs for multiple requests', async () => {
      const estimate = await estimator.estimate('gemini-2.5-flash', 100);

      expect(estimate.costs.totalRequests).toBe(100);
      expect(estimate.costs.total).toBeCloseTo(estimate.costs.perRequest * 100, 10);
    });

    it('should compare costs across models', async () => {
      const estimate = await estimator.estimate('gemini-2.5-flash');

      expect(estimate.comparison).toBeDefined();
      expect(Object.keys(estimate.comparison!).length).toBeGreaterThan(0);

      // Verify comparison structure
      const firstModel = Object.values(estimate.comparison!)[0];
      expect(firstModel.perRequest).toBeGreaterThanOrEqual(0);
      expect(firstModel.total).toBeGreaterThanOrEqual(0);
      expect(firstModel.savings).toBeDefined();
      expect(firstModel.savingsPercent).toBeDefined();
    });

    it('should provide recommendations', async () => {
      const estimate = await estimator.estimate('gemini-2.5-pro');

      expect(estimate.recommendations).toBeDefined();
      expect(Array.isArray(estimate.recommendations)).toBe(true);
    });

    it('should handle different models', async () => {
      const flashEstimate = await estimator.estimate('gemini-2.5-flash');
      const proEstimate = await estimator.estimate('gemini-2.5-pro');
      const liteEstimate = await estimator.estimate('gemini-2.5-flash-lite');

      // Flash-Lite should be cheapest
      expect(liteEstimate.costs.perRequest).toBeLessThan(flashEstimate.costs.perRequest);
      expect(flashEstimate.costs.perRequest).toBeLessThan(proEstimate.costs.perRequest);
    });

    it('should validate request count', async () => {
      await expect(
        estimator.estimate('gemini-2.5-flash', 0)
      ).rejects.toThrow('Request count must be at least 1');

      await expect(
        estimator.estimate('gemini-2.5-flash', -1)
      ).rejects.toThrow();

      await expect(
        estimator.estimate('gemini-2.5-flash', 1.5)
      ).rejects.toThrow('Request count must be an integer');
    });

    it('should throw error for invalid model', async () => {
      await expect(
        estimator.estimate('invalid-model')
      ).rejects.toThrow('Unknown model');
    });

    it('should calculate costs correctly', async () => {
      const estimate = await estimator.estimate('gemini-2.5-flash');

      const totalCost = estimate.breakdown.inputCost + estimate.breakdown.outputCost;
      expect(totalCost).toBeCloseTo(estimate.costs.perRequest, 10);
    });
  });

  describe('getAllModels()', () => {
    it('should return all available models', () => {
      const models = estimator.getAllModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);

      // Verify model structure
      const firstModel = models[0];
      expect(firstModel.id).toBeTruthy();
      expect(firstModel.name).toBeTruthy();
      expect(firstModel.contextWindow).toBeGreaterThan(0);
      expect(firstModel.description).toBeTruthy();
      expect(firstModel.pricing.input).toBeTruthy();
      expect(firstModel.pricing.output).toBeTruthy();
    });

    it('should include all major models', () => {
      const models = estimator.getAllModels();
      const modelIds = models.map(m => m.id);

      expect(modelIds).toContain('gemini-2.5-flash');
      expect(modelIds).toContain('gemini-2.5-pro');
      expect(modelIds).toContain('gemini-2.5-flash-lite');
      expect(modelIds).toContain('gemini-1.5-pro');
      expect(modelIds).toContain('gemini-1.5-flash');
    });
  });
});
