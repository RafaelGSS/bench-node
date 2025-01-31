<h1 align="center">
  <img
    src="https://raw.githubusercontent.com/RafaelGSS/bench-node/refs/heads/main/assets/logo.svg"
    alt="Bench Node logo"
  />
  Bench Node
</h1>

<p align="center">
  <a href="#install">Install</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#usage">Usage</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#class-suite">Suite</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#plugins">Plugins</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#using-reporter">Using Reporter</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#setup-and-teardown">Setup and Teardown</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#writing-javascript-mistakes">Writing JavaScript Mistakes</a>
</p>

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]

The `bench-node` module allows you to measure operations per second of Node.js code blocks.

## Install

```bash
$ npm install bench-node
```

## Usage

```cjs
const { Suite } = require('bench-node');

const suite = new Suite();

suite.add('Using delete property', () => {
  const data = { x: 1, y: 2, z: 3 };
  delete data.y;

  data.x;
  data.y;
  data.z;
});

suite.run()
```

```bash
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 3,326,913 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(0ns ... 0ns) p75=0ns p99=0ns
```

This module uses V8 deoptimization to help ensure that the code block is not optimized away, producing accurate benchmarks -- but not realistic.
See the [Writing JavaScript Microbenchmark Mistakes](#writing-javascript-mistakes) section for more details.

The [`bench-node-cli`](https://github.com/RafaelGSS/bench-node-cli) tool allows you to execute a `bench-node` benchmark
from any location, eliminating the need to install the `bench-node` package locally.
Simply use the following command to run your benchmark:

```bash
npx bench-node-cli my-benchmark.js
```

See the [examples folder](./examples/) for more common usage examples.

## Table of Contents

1. [Class `Suite`](#class-suite)
    1. [`suite.add()`](#suiteaddname-options-fn)
    2. [`suite.run()`](#suiterun)
2. [Plugins](#plugins)
3. [Using Reporter](#using-reporter)
    1. [Text Reporter](#textreport-default)
    2. [Chart Reporter](#chartreport)
    3. [Custom Reporter](#custom-reporter) 
4. [Setup and Teardown](#setup-and-teardown)
    1. [Managed Benchmarks](#managed-benchmarks)

## Class: `Suite`

> Stability: 1.1 Active Development

A `Suite` manages and executes benchmark functions. It provides two methods: `add()` and `run()`.

### `new Suite([options])`

* `options` {Object} Configuration options for the suite.
  * `reporter` {Function} Callback function for reporting results. Receives one argument:
    * `results` {Object[]} Array of benchmark results:
      * `name` {string} Benchmark name.
      * `opsSec` {string} Operations per second.
      * `iterations` {Number} Number of iterations.
      * `histogram` {Histogram} Histogram instance.

If no `reporter` is provided, results are printed to the console.

```js
const { Suite } = require('bench-node');
const suite = new Suite();
```

If you don't want results to be printed to the console, `false` and `null` can be used

```js
const { Suite } = require('bench-node');
const suite = new Suite({ reporter: false });
```

### `suite.add(name[, options], fn)`

* `name` {string} The name of the benchmark, displayed when reporting results.
* `options` {Object} Configuration options for the benchmark. Supported properties:
  * `minTime` {number} Minimum duration for the benchmark to run. **Default:** `0.05` seconds.
  * `maxTime` {number} Maximum duration for the benchmark to run. **Default:** `0.5` seconds.
  * `repeatSuite` {number} Number of times to repeat benchmark to run. **Default:** `1` times.
* `fn` {Function|AsyncFunction} The benchmark function. Can be synchronous or asynchronous. 
* Returns: {Suite}

Adds a benchmark function to the suite.

```bash
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 5,853,505 ops/sec (10 runs sampled) min..max=(169ns ... 171ns)
```

### `suite.run()`

* Returns: `{Promise<Array<Object>>}` An array of benchmark results, each containing:
  * `opsSec` {number} Operations per second.
  * `iterations` {number} Number of executions of `fn`.
  * `histogram` {Histogram} Histogram of benchmark iterations.
  * `name` {string} Benchmark name.
  * `plugins` {Object} Object with plugin results if any plugins are active.

Runs all added benchmarks and returns the results.

## Plugins

Plugins extend the functionality of the benchmark module. 

See [Plugins](./doc/Plugins.md) for details.

### Plugin Methods

- **`isSupported()`**: Checks if the plugin can run in the current environment.
- **`beforeClockTemplate(varNames)`**: Injects code before the benchmark starts. Returns an array with:
  * `Code` {string} JavaScript code to execute.
  * `Wrapper` {string} (optional) Function to wrap the benchmark function.
- **`afterClockTemplate(varNames)`**: Injects code after the benchmark finishes. Returns an array with:
  * `Code` {string} JavaScript code to execute.
- **`onCompleteBenchmark(result)`**: Called when the benchmark completes, allowing plugins to process results.
- **`toString()`**: Returns a string identifier for the plugin.

### Example Plugin

```js
class V8OptimizeOnNextCallPlugin {
  isSupported() {
    try {
      new Function(`%OptimizeFunctionOnNextCall(() => {})`)();
      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate({ awaitOrEmpty, bench }) {
    let code = '';
    code += `%OptimizeFunctionOnNextCall(${bench}.fn);\n`;
    code += `${awaitOrEmpty}${bench}.fn();\n`;
    code += `${awaitOrEmpty}${bench}.fn();\n`;
    return [code];
  }

  toString() {
    return 'V8OptimizeOnNextCallPlugin';
  }
}
```

## Using Reporter

This module exports two reporters that control how benchmark results are displayed:
a detailed `textReport` for statistical analysis, and a visual `chartReport` that
displays a bar graph in the terminal.

### `textReport` (Default)

The `textReport` is the default reporter, which provides simple statistical information
about each benchmark result. It includes the number of operations per second, the number
of runs sampled, min...max, and enabled plugins.

**Example Output**:

```
single with matcher                           x 710,248 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(1.40us...1.42us)
multiple replaces                             x 604,713 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(1.64us...1.70us)
```

Here’s how you can explicitly pass it as a reporter:

```cjs
const { Suite, textReport } = require('bench-node');

const suite = new Suite({
  reporter: textReport, // Optional, since this is the default
});
```

### `chartReport`

The `chartReport` reporter provides a graphical representation of benchmark
results in the form of a bar chart, making it easier to visualize the relative
performance of each benchmark. It scales the bars based on the highest operations
per second (ops/sec) value, and displays the results incrementally as they are collected.

Example output:

```
Node.js version: v23.6.1
Platform: darwin arm64
CPU Cores: 8 vCPUs | 16.0GB Mem

single with matcher                           | ██████████████████████████████ | 709,321 ops/sec | 10 samples
multiple replaces                             | ██████████████████████████---- | 606,401 ops/sec | 11 samples
```

Usage:

```cjs
const { Suite, chartReport } = require('bench-node');

const suite = new Suite({
  reporter: chartReport,
});
```

### `htmlReport`

The `htmlReport` generates an interactive HTML visualization of benchmark results.
It transforms benchmark data into a visual format, such as speed circle animations,
making it easier to interpret and share performance insights.

Example output:

https://github.com/user-attachments/assets/b2b98175-6648-4af4-8319-63f3ebbc729e

Usage:

```cjs
const { Suite, htmlReport } = require('bench-node');

const suite = new Suite({
  reporter: htmlReport,
});
```

### `jsonReport`

The `jsonReport` plugin provides benchmark results in **JSON format**.  
It includes key performance metrics—such as `opsSec`, `runsSampled`, `min`
and `max` times, and any reporter data from your **plugins**—so you can easily
store, parse, or share the information.

Example output:

```json
[
  {
    "name": "single with matcher",
    "opsSec": 180000,
    "runsSampled": 50,
    "min": "13.20μs",
    "max": "82.57μs",
    "plugins": []
  },
  {
    "name": "Multiple replaces",
    "opsSec": 170000,
    "runsSampled": 50,
    "min": "15.31μs",
    "max": "77.49μs",
    "plugins": []
  }
]
```

**Usage:**

```cjs
const { Suite, jsonReport } = require('bench-node');

const suite = new Suite({
  reporter: jsonReport,
});
```

### CSV Reporter

The `csvReport` plugin generates benchmark results in CSV format.
It includes columns for key performance metrics like `ops/sec`, `samples`, `min` and `max` times,
as well as any reporter data provided by your plugins.

Example output:

```csv
name,ops/sec,samples,plugins,min,max
Using delete property,"7,732,517",10,v8-never-optimize=true,127.91ns,129.95ns
Using delete property (proto: null),"24,636,631",10,v8-never-optimize=true,39.57ns,40.91ns
Using delete property (cached proto: null),"7,497,893",11,v8-never-optimize=true,132.25ns,134.89ns
Using undefined assignment,"132,093,600",11,v8-never-optimize=true,7.53ns,7.64ns
Using undefined assignment (proto: null),"28,231,374",9,v8-never-optimize=true,35.27ns,35.42ns
Using undefined property (cached proto: null),"60,843,193",10,v8-never-optimize=true,16.24ns,16.65ns
[Managed] Using undefined property (cached proto: null),"35,394,060",10,v8-never-optimize=true,27.90ns,28.54ns
```

**Usage:**

```cjs
const { Suite, csvReport } = require('bench-node');

const suite = new Suite({
  reporter: csvReport,
});
```

### Custom Reporter

Customize data reporting by providing a `reporter` function when creating the `Suite`:

```js
const { Suite } = require('bench-node');

function reporter(results) {
  for (const result of results) {
    console.log(`Benchmark: ${result.name}`);
    console.log(`Operations per second: ${result.opsSec}`);
    console.log(`Iterations: ${result.iterations}`);
    console.log(`Histogram: ${result.histogram}`);
  }
}

const suite = new Suite({ reporter });

suite.add('Using delete to remove property from object', () => {
  const data = { x: 1, y: 2, z: 3 };
  delete data.y;

  data.x;
  data.y;
  data.z;
});

suite.run();
```

```bash
$ node --allow-natives-syntax my-benchmark.js
Benchmark: Using delete to remove property from object - 6,032,212 ops/sec
```

## Setup and Teardown

Control the benchmark function's setup and teardown using the timer argument:

```js
const { Suite } = require('bench-node');
const { readFileSync, writeFileSync, rmSync } = require('node:fs');

const suite = new Suite();

suite.add('readFileSync', (timer) => {
  const randomFile = Date.now();
  const filePath = `./${randomFile}.txt`;
  writeFileSync(filePath, Math.random().toString());

  timer.start();
  readFileSync(filePath, 'utf8');
  timer.end();

  rmSync(filePath);
}).run();
```

For advanced setups, use the timer argument to start and end timing explicitly:

```js
const { Suite } = require('bench-node');
const { readFileSync, writeFileSync, rmSync } = require('node:fs');

const suite = new Suite();

suite.add('readFileSync', (timer) => {
  const randomFile = Date.now();
  const filePath = `./${randomFile}.txt`;
  writeFileSync(filePath, Math.random().toString());

  timer.start();
  for (let i = 0; i < timer.count; i++) {
    readFileSync(filePath, 'utf8');
  }
  timer.end(timer.count);

  rmSync(filePath);
});

suite.run();
```

> [!WARNING]
> When using the `timer`, the setup will also be deoptimized.
> As a result, if you compare this approach with one that uses functions outside
> the benchmark function, the results may not match.
> See: [Deleting Properties Example](./examples/deleting-properties/node.js).

Ensure you call `.start()` and `.end()` methods when using the timer argument, or an `ERR_BENCHMARK_MISSING_OPERATION` error will be thrown.

### Managed Benchmarks

In regular benchmarks (when `timer` is not used), you run the benchmarked function in a loop,
and the timing is managed implicitly.
This means each iteration of the benchmarked function is measured directly.
The downside is that optimizations like inlining or caching might affect the timing, especially for fast operations.

Example:

```cjs
suite.add('Using includes', () => {
  const text = 'text/html,...';
  const r = text.includes('application/json');
});
```

Here, `%DoNotOptimize` is being called inside the loop for regular benchmarks (assuming V8NeverOptimizePlugin is being used),
ensuring that the operation is not overly optimized within each loop iteration.
This prevents V8 from optimizing away the operation (e.g., skipping certain steps because the result is not used or the function is too trivial).

Managed benchmarks explicitly handle timing through `start()` and `end()` calls around the benchmarked code.
This encapsulates the entire set of iterations in one timed block,
which can result in tighter measurement with less overhead.
However, it can lead to over-optimistic results, especially if the timer’s start and stop calls are placed outside of the loop,
allowing V8 to over-optimize the entire block.

Example:

```cjs
suite.add('[Managed] Using includes', (timer) => {
  timer.start();
  for (let i = 0; i < timer.count; i++) {
    const text = 'text/html,...';
    const r = text.includes('application/json');
    assert.ok(r);  // Ensure the result is used so it doesn't get V8 optimized away
  }
  timer.end(timer.count);
});
```

In this case, `%DoNotOptimize` is being applied outside the loop, so it does not protect each iteration from
excessive optimization. This can result in higher operation counts because V8 might optimize away repetitive tasks.
That's why an `assert.ok(r)` has been used. To avoid V8 optimizing the entire block as the `r` var was not being used.

> [!NOTE]
> V8 assumptions can change any time soon. Therefore, it's crucial to investigate
> results between versions of V8/Node.js.

### Worker Threads

> Stability: 1.0 (Experimental)

`bench-node` provides experimental support for **Worker Threads**. When you set `useWorkers: true`,
the library runs each benchmark in a separate worker thread, ensuring that one benchmark
does not affect another. Usage is straightforward:

```cjs
const suite = new Suite({
  useWorkers: true,
});
```

## Writing JavaScript Mistakes

When working on JavaScript micro-benchmarks, it’s easy to forget that modern engines use
multiple tiers of Just-In-Time (JIT) compilation and sometimes even entirely different
optimizations. The results you get from a simple timing loop often aren’t representative
of how your code will behave under real-world conditions, especially once the browser or
runtime has adjusted for frequent function calls. Caching, tail call optimizations,
and hidden class transformations can all distort your measurements, leading to overblown
claims about performance improvements that might never materialize in production.

That’s why **bench-node** was created—to provide a stable and consistent way to compare
small snippets of code. By default, it tells V8 to never optimize your code with a
snippet like `%NeverOptimizeFunction(DoNotOptimize)`, ensuring the JIT compiler doesn’t
remove dead code. However, even this approach can’t fully replicate real-world scenarios
in which V8 optimizations and unpredictable workloads impact performance. Think of
bench-node as a helpful tool for quick comparisons rather than a guarantee of what you’ll
see in production.


[build-img]:https://github.com/RafaelGSS/bench-node/actions/workflows/release.yml/badge.svg

[build-url]:https://github.com/RafaelGSS/bench-node/actions/workflows/release.yml

[downloads-img]:https://img.shields.io/npm/dt/bench-node

[downloads-url]:https://www.npmtrends.com/bench-node

[npm-img]:https://img.shields.io/npm/v/bench-node

[npm-url]:https://www.npmjs.com/package/bench-node

[issues-img]:https://img.shields.io/github/issues/RafaelGSS/bench-node

[issues-url]:https://github.com/RafaelGSS/bench-node/issues
