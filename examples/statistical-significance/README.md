# Statistical Significance Testing (T-Test)

This example demonstrates how to use Welch's t-test to determine if benchmark differences are statistically significant.

## The Problem

When running benchmarks on shared or cloud environments, results can vary due to:
- CPU throttling
- Background processes
- Memory pressure
- Cache effects

A benchmark might show one implementation as "1.05x faster", but is that a real improvement or just noise?

## The Solution

Enable t-test mode with `ttest: true`:

```js
const { Suite } = require('bench-node');

const suite = new Suite({
  ttest: true,
  minSamples: 30, // minSamples x repeatSuite must be > 30
});

suite.add('baseline', { baseline: true }, () => {
  // ...
});

suite.add('alternative', () => {
  // ...
});
```

When `ttest: true` is set, the suite automatically:
1. Sets `repeatSuite=30` for all benchmarks (can be overridden)
2. Runs Welch's t-test to compare results against baseline
3. Displays significance stars in the output

## Understanding the Output

The output will show significance stars next to comparisons:

```
Summary (vs. baseline):
  baseline/for-loop  (baseline)
  forEach            (1.80x slower) ***
  for-of-loop        (1.09x slower) ***
  reduce             (1.06x faster) **

  Significance: * p<0.05, ** p<0.01, *** p<0.001
```

- `***` = p < 0.001 - Very high confidence (99.9%) the difference is real
- `**` = p < 0.01 - High confidence (99%) the difference is real  
- `*` = p < 0.05 - Moderate confidence (95%) the difference is real
- (no stars) = Not statistically significant - difference may be noise

## When to Use

1. **Comparing similar implementations** - Is the "optimization" actually faster?
2. **CI/CD pipelines** - Detect real regressions vs. flaky results
3. **Cloud/shared environments** - High variance requires statistical validation
4. **Small differences** - 5% faster could be noise or real

## Run the Example

```bash
node --allow-natives-syntax node.js
```

## Sample Output

```
baseline/for-loop   x 85,009,221 ops/sec (311 runs sampled)
reduce              x 89,853,937 ops/sec (321 runs sampled)
for-of-loop         x 78,268,434 ops/sec (302 runs sampled)
forEach             x 47,249,597 ops/sec (334 runs sampled)

Summary (vs. baseline):
  baseline/for-loop  (baseline)
  forEach            (1.80x slower) ***
  for-of-loop        (1.09x slower) ***
  reduce             (1.06x faster) **

  Significance: * p<0.05, ** p<0.01, *** p<0.001
```
