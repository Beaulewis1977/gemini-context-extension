import { ContextTracker } from '../dist/tools/context-tracker.js';
import { CostEstimator } from '../dist/tools/cost-estimator.js';
import { generatePerformanceReport, withProfiling } from '../dist/tools/performance-profiler.js';

async function main() {
  try {
    const tracker = new ContextTracker();
    const analysis = await tracker.analyze('compact');
    console.log('Context analysis result:');
    console.log(JSON.stringify(analysis, null, 2));

    const estimator = new CostEstimator();
    const estimate = await estimator.estimate('gemini-2.5-flash', 1);
    console.log('\nCost estimate result:');
    console.log(JSON.stringify(estimate, null, 2));

    const profiled = withProfiling('smoke_test_tool', async () => 'ok');
    await profiled(undefined);

    const profile = generatePerformanceReport();
    console.log('\nPerformance profile:');
    console.log(profile);
  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exitCode = 1;
  }
}

main();
