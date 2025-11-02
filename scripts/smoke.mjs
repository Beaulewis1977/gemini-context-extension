import { ContextTracker } from '../dist/tools/context-tracker.js';
import { CostEstimator } from '../dist/tools/cost-estimator.js';

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
  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exitCode = 1;
  }
}

main();
