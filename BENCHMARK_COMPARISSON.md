# Benchmark Library Comparison

This document provides a comprehensive comparison between `bench-node` and other popular Node.js benchmarking libraries based on real benchmark results across different Node.js versions. This comparison helps identify potential errors in our benchmarking approach and provides insights for specific algorithm comparisons.

## Overview

The following benchmarking libraries are compared in this document:

- **bench-node** - Our library with V8 optimization control
- **benchmark.js** - The most popular JavaScript benchmarking library
- **mitata** - Modern, fast benchmarking library
- **tinybench** - Lightweight benchmarking tool

## Test Environment

All benchmarks were executed on:
- **CPU**: Intel(R) Xeon(R) Platinum 8375C CPU @ 2.90GHz
- **Platform**: Linux x64
- **Node.js versions**: 20.19.3, 22.17.0, 24.3.0



## Detailed Benchmark Results

### Simple Operations - JIT Optimizable

This test measures a simple operation that V8 can heavily optimize:

#### Node.js 24.3.0
| Library | ops/sec | Margin | Relative Performance |
|---------|---------|--------|---------------------|
| benchmark.js | 141,211,777 | ±5.18% | **1.00x** (baseline) |
| bench-node | 125,902,288 | N/A | 0.89x |
| mitata | 37,131,930 | ±5.00% | 0.26x |
| tinybench | 28,207,575 | ±0.10% | 0.20x |

#### Node.js 22.17.0
| Library | ops/sec | Margin | Relative Performance |
|---------|---------|--------|---------------------|
| benchmark.js | 142,037,530 | ±3.88% | **1.00x** (baseline) |
| bench-node | 141,504,337 | N/A | 1.00x |
| tinybench | 17,040,169 | ±1.40% | 0.12x |
| mitata | 12,382,061 | ±5.00% | 0.09x |

#### Node.js 20.19.3
| Library | ops/sec | Margin | Relative Performance |
|---------|---------|--------|---------------------|
| **benchmark.js** | **843,084,082** | ±0.25% | **1.00x** (baseline) |
| bench-node | 136,801,267 | N/A | 0.16x |
| tinybench | 24,275,731 | ±0.11% | 0.03x |
| mitata | 18,411,459 | ±5.00% | 0.02x |



### String Processing - Regex Test

This test performs regex matching on strings:

#### Cross-Version Comparison
| Node.js Version | bench-node | benchmark.js | mitata | tinybench |
|-----------------|------------|--------------|--------|-----------|
| **24.3.0** | 4,352,775 | 4,299,609 (±0.58%) | 3,543,737 (±5.00%) | 3,654,837 (±0.40%) |
| **22.17.0** | 4,349,482 | 4,382,198 (±0.49%) | 3,933,431 (±5.00%) | 3,526,797 (±0.83%) |
| **20.19.3** | 4,419,500 | 4,320,038 (±0.40%) | 3,475,360 (±5.00%) | 3,698,242 (±1.85%) |



### CPU Intensive - Fibonacci Calculations

#### Fibonacci(10) - Light CPU Load

| Node.js Version | benchmark.js | bench-node | mitata | tinybench |
|-----------------|--------------|------------|--------|-----------|
| **24.3.0** | 77,510,123 (±2.38%) | 69,120,722 | 42,308,343 (±5.00%) | 26,206,646 (±0.09%) |
| **22.17.0** | 56,097,219 (±1.68%) | 54,623,064 | 51,268,905 (±5.00%) | 15,451,469 (±0.09%) |
| **20.19.3** | 73,590,107 (±0.23%) | 57,284,808 | 10,910,003 (±5.00%) | 22,108,774 (±0.11%) |

#### Fibonacci(30) - Medium CPU Load

| Node.js Version | benchmark.js | bench-node | mitata | tinybench |
|-----------------|--------------|------------|--------|-----------|
| **24.3.0** | 43,276,919 (±1.26%) | 40,936,562 | 30,824,240 (±5.00%) | 18,752,734 (±0.11%) |
| **22.17.0** | 22,187,269 (±0.53%) | 21,316,196 | 14,024,655 (±5.00%) | 11,373,272 (±1.98%) |
| **20.19.3** | 22,078,755 (±0.27%) | 21,783,805 | 21,708,455 (±5.00%) | 14,162,915 (±0.11%) |

#### Fibonacci(40) - Heavy CPU Load

| Node.js Version | benchmark.js | bench-node | mitata | tinybench |
|-----------------|--------------|------------|--------|-----------|
| **24.3.0** | 35,115,900 (±1.30%) | 33,956,245 | 26,752,990 (±5.00%) | 18,719,206 (±0.10%) |
| **22.17.0** | 16,511,904 (±0.91%) | 16,112,632 | 15,599,164 (±5.00%) | 9,496,167 (±4.91%) |
| **20.19.3** | 16,726,334 (±0.31%) | 16,504,271 | 16,264,129 (±5.00%) | 11,755,080 (±3.32%) |

### Fibonacci Recursive(10) - Algorithm Comparison

| Node.js Version | bench-node | mitata | benchmark.js | tinybench |
|-----------------|------------|--------|--------------|-----------|
| **24.3.0** | **999,165** | 992,635 (±5.00%) | 986,251 (±0.31%) | 977,228 (±0.09%) |
| **22.17.0** | **978,652** | 972,507 (±5.00%) | 969,517 (±0.30%) | 938,449 (±0.07%) |
| **20.19.3** | **989,935** | 939,466 (±5.00%) | 973,359 (±0.19%) | 965,775 (±0.07%) |


---

*Last updated: August 2025 | Based on bench-node v2.x, benchmark.js v2.1.4, mitata v1.x, tinybench v2.x*
*Benchmark workflow: [benchmark-comparison.yml](https://github.com/RafaelGSS/bench-node/actions/workflows/benchmark-comparison.yml)*
*Test results from Node.js versions 20.19.3, 22.17.0, and 24.3.0*