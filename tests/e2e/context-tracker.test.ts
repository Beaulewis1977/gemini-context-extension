import { describe, it, expect, beforeAll } from '@jest/globals';
import { ContextTracker } from '../../src/tools/context-tracker.js';

describe('Context Tracker E2E', () => {
  let tracker: ContextTracker;

  beforeAll(() => {
    tracker = new ContextTracker();
  });

  describe('analyze()', () => {
    it('should analyze context usage in standard mode', async () => {
      const analysis = await tracker.analyze('standard', 'gemini-2.5-flash');

      // Verify structure
      expect(analysis.model).toBe('Gemini 2.5 Flash');
      expect(analysis.timestamp).toBeTruthy();

      // Verify usage object
      expect(analysis.usage).toBeDefined();
      expect(analysis.usage.used).toBeGreaterThanOrEqual(0);
      expect(analysis.usage.total).toBe(1000000); // 1M for 2.5 Flash
      expect(analysis.usage.percentage).toBeGreaterThanOrEqual(0);
      expect(analysis.usage.percentage).toBeLessThanOrEqual(100);
      expect(analysis.usage.available).toBeGreaterThanOrEqual(0);

      // Verify breakdown
      expect(analysis.breakdown).toBeDefined();
      expect(analysis.breakdown.systemContext).toBe(12000);
      expect(analysis.breakdown.builtInTools).toBe(18000);
      expect(analysis.breakdown.mcpServers).toBeGreaterThanOrEqual(0);
      expect(analysis.breakdown.extensions).toBeGreaterThanOrEqual(0);
      expect(analysis.breakdown.contextFiles).toBeGreaterThanOrEqual(0);
    });

    it('should handle compact mode', async () => {
      const analysis = await tracker.analyze('compact');

      expect(analysis.usage).toBeDefined();
      expect(analysis.usage.percentage).toBeGreaterThanOrEqual(0);
    });

    it('should handle detailed mode', async () => {
      const analysis = await tracker.analyze('detailed', 'gemini-2.5-pro');

      expect(analysis.details).toBeDefined();
      expect(analysis.details?.recommendations).toBeDefined();
      expect(analysis.details?.modelInfo).toBeDefined();
    });

    it('should handle different models', async () => {
      const flashAnalysis = await tracker.analyze('standard', 'gemini-2.5-flash');
      const proAnalysis = await tracker.analyze('standard', 'gemini-1.5-pro');

      expect(flashAnalysis.usage.total).toBe(1000000);
      expect(proAnalysis.usage.total).toBe(2000000);
    });

    it('should throw error for invalid mode', async () => {
      await expect(
        tracker.analyze('invalid' as any)
      ).rejects.toThrow('Invalid analysis mode');
    });

    it('should calculate percentages correctly', async () => {
      const analysis = await tracker.analyze('standard');

      const expectedPercentage = Math.round(
        (analysis.usage.used / analysis.usage.total) * 100
      );
      expect(analysis.usage.percentage).toBe(expectedPercentage);
    });

    it('should calculate available tokens correctly', async () => {
      const analysis = await tracker.analyze('standard');

      expect(analysis.usage.available).toBe(
        analysis.usage.total - analysis.usage.used
      );
    });
  });
});
