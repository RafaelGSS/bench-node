# Benchmark Comparison Framework

This directory contains a framework for comparing `bench-node` against other popular benchmark libraries:

- [Benchmark.js](https://benchmarkjs.com/)
- [Mitata](https://github.com/evanwashere/mitata)
- [Tinybench](https://github.com/tinylibs/tinybench)

## Test Cases

The comparison focuses on four key test scenarios:

1. **JIT Optimizable** - Simple operations that the JavaScript JIT compiler might optimize away
2. **Regex Test** - Regular expression pattern matching operations
3. **Fibonacci** - CPU-bound recursive calculation

## Running the Comparisons

To run any of the comparison scripts, use:

```bash
node --allow-natives-syntax examples/benchmark-comparison/comparison.js
```

> **Note:** All bench-node scripts must be run with the `--allow-natives-syntax` flag.
