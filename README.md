# `bench-node`

The `bench-node` module allows you to measure operations per second of Node.js code blocks.

## Install

```bash
$ npm install bench-node
```

## Usage

```js
const { Suite } = require('bench-node');

const suite = new Suite({
  reporter: (bench, result) => {
    console.log(`Benchmark: ${bench.name}`);
    console.log(`Operations per second: ${result.opsSec}`);
    console.log(`Iterations: ${result.iterations}`);
    console.log(`Histogram: ${result.histogram}`);
  }
});

suite.add('Using delete property', () => {
  const data = { x: 1, y: 2, z: 3 };
  delete data.y;

  data.x;
  data.y;
  data.z;
});

suite.run().then(results => {
  console.log('Benchmark complete.');
}).catch(err => {
  console.error('Error running benchmarks:', err);
});
```

This module uses V8 deoptimization to ensure that the code block is not optimized away, producing accurate benchmarks. See the [Writing JavaScript Microbenchmark Mistakes](#TODO) section for more details.

```bash
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 3,326,913 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(0ns ... 0ns) p75=0ns p99=0ns
```

See the [examples folder](./examples/) for more common usage examples.

## Table of Contents

1. [Class `Suite`](#class-suite)
    1. [`suite.add()`](#suiteaddname-options-fn)
    2. [`suite.run()`](#suiterun)
2. [Plugins](#plugins)
3. [Using Custom Reporter](#using-custom-reporter)
4. [Setup and Teardown](#setup-and-teardown)

## Class: `Suite`

> Stability: 1.1 Active Development

A `Suite` manages and executes benchmark functions. It provides two methods: `add()` and `run()`.

### `new Suite([options])`

* `options` {Object} Configuration options for the suite. Supported properties:
  * `reporter` {Function} Callback function for reporting results. Receives two arguments:
    * `suite` {Suite} The Suite instance.
    * `result` {Object} Contains:
      * `opsSec` {string} Operations per second.
      * `iterations` {Number} Number of iterations.
      * `histogram` {Histogram} Histogram instance.

If no `reporter` is provided, results are printed to the console.

```js
const { Suite } = require('bench-node');
const suite = new Suite();
```

### `suite.add(name[, options], fn)`

* `name` {string} The name of the benchmark, displayed when reporting results.
* `options` {Object} Configuration options for the benchmark. Supported properties:
  * `minTime` {number} Minimum duration for the benchmark to run. **Default:** `0.05` seconds.
  * `maxTime` {number} Maximum duration for the benchmark to run. **Default:** `0.5` seconds.
* `fn` {Function|AsyncFunction} The benchmark function. Can be synchronous or asynchronous.
* Returns: {Suite}

Adds a benchmark function to the suite.

```bash
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 5,853,505 ops/sec ± 0.01% (10 runs sampled) min..max=(169ns ... 171ns) p75=170ns p99=171ns
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

## Using Custom Reporter

Customize data reporting by providing a `reporter` function when creating the `Suite`:

```js
const { Suite } = require('bench-node');

function reporter(bench, result) {
  console.log(`Benchmark: ${bench.name}`);
  console.log(`Operations per second: ${result.opsSec}`);
  console.log(`Iterations: ${result.iterations}`);
  console.log(`Histogram: ${result.histogram}`);
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

Ensure you call `.start()` and `.end()` methods when using the timer argument, or an `ERR_BENCHMARK_MISSING_OPERATION` error will be thrown.
