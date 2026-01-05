/**
 * Statistical Significance Example
 *
 * This example demonstrates how to use Welch's t-test to determine
 * if benchmark differences are statistically significant.
 *
 * When running benchmarks, especially on shared/cloud environments,
 * small performance differences may just be random noise. The t-test
 * helps identify when a difference is real vs. just variance.
 *
 * Run with: node --allow-natives-syntax node.js
 */

const { Suite } = require('../../lib');

// Enable t-test mode - this automatically sets repeatSuite=30 for all benchmarks
const suite = new Suite({
  ttest: true,
  minSamples: 30
});

// Baseline: Simple array sum using for loop
suite.add('baseline/for-loop', { baseline: true }, () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
});

// Alternative 1: Using reduce (typically slower due to function call overhead)
suite.add('reduce', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return arr.reduce((acc, val) => acc + val, 0);
});

// Alternative 2: for-of loop (similar performance to for loop)
suite.add('for-of-loop', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let sum = 0;
  for (const val of arr) {
    sum += val;
  }
  return sum;
});

// Alternative 3: forEach (slower due to function call per element)
suite.add('forEach', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let sum = 0;
  arr.forEach((val) => {
    sum += val;
  });
  return sum;
});

suite.run();
