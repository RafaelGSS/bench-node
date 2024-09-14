# bench-node

The `bench-node` module gives the ability to measure
operations per second of Node.js code block

1. [Install](#install)
2. [Usage](#usage)
3. [class `Suite`](#class-suite)
    1. [`suite.add()`](#suiteaddname-options-fn)
    2. [`suite.run()`](#suiterun)
4. [Plugins](#plugins)
  * [Structure](#structure)
  * [Plugin Methods](#plugin-methods)
    * [`isSupported()` (required)](#issupported-required)
    * [`beforeClockTemplate(varNames)`](#beforeclocktemplatevarnames)
    * [`afterClockTemplate(varNames)`](#afterclocktemplatevarnames)
    * [`onCompleteBenchmark(result)`](#oncompletebenchmarkresult)
    * [`toString()` (required)](#tostring-required)
  * [Example Plugins](#example-plugins)
    * [V8OptimizeOnNextCallPlugin](#class-v8optimizeonnextcallplugin)
5. [Official Plugins](#official-plugins)
  * [Class: `V8OptimizeOnNextCallPlugin`](#class-v8optimizeonnextcallplugin-1)
  * [Class: `V8NeverOptimizePlugin`](#class-v8neveroptimizeplugin)
  * [Class: `V8GetOptimizationStatus`](#class-v8getoptimizationstatus)
6. [Using custom reporter](#using-custom-reporter)
7. [Setup and Teardown](#setup-and-teardown)

## Install

```console
$ npm i bench-node
```

## Usage

```js
const { Suite } = require('bench-node');

const suite = new Suite();

suite.add('Using delete to remove property from object', function() {
  const data = { x: 1, y: 2, z: 3 };
  delete data.y;

  data.x;
  data.y;
  data.z;
});

suite.run();
```

This module uses V8 deoptimization to guarantee the code block won't be eliminated producing
a noop comparisson. See [writting JavasCript Microbenchmark mistakes][] section.

```console
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 5,853,505 ops/sec ± 0.01% (10 runs sampled)     min..max=(169ns ... 171ns) p75=170ns p99=171ns
```

## Class: `Suite`

> Stability: 1.1 Active Development

An `Suite` is responsible for managing and executing
benchmark functions. It provides two methods: `add()` and `run()`.

### `new Suite([options])`

* `options` {Object} Configuration options for the suite. The following
  properties are supported:
  * `reporter` {Function} Callback function with results to be called after
    benchmark is concluded. The callback function should receive two arguments:
    `suite` - A {Suite} object and
    `result` - A object containing three properties:
    `opsSec` {string}, `iterations {Number}`, `histogram` {Histogram} instance.

If no `reporter` is provided, the results will printed to the console.

```js
const { Suite } = require('bench-node');
const suite = new Suite();
```

### `suite.add(name[, options], fn)`

* `name` {string} The name of the benchmark, which is displayed when reporting
  benchmark results.
* `options` {Object} Configuration options for the benchmark. The following
  properties are supported:
  * `minTime` {number} The minimum time a benchmark can run.
    **Default:** `0.05` seconds.
  * `maxTime` {number} The maximum time a benchmark can run.
    **Default:** `0.5` seconds.
* `fn` {Function|AsyncFunction}
* Returns: {Suite}

This method stores the benchmark of a given function (`fn`).
The `fn` parameter can be either an asynchronous (`async function () {}`) or
a synchronous (`function () {}`) function.

```console
$ node --allow-natives-syntax my-benchmark.js
Using delete property x 5,853,505 ops/sec ± 0.01% (10 runs sampled)     min..max=(169ns ... 171ns) p75=170ns p99=171ns
```

### `suite.run()`

* Returns: `{Promise<Array<Object>>}`
  * `opsSec` {number} The amount of operations per second
  * `iterations` {number} The amount executions of `fn`
  * `histogram` {Histogram} Histogram object used to record benchmark iterations
  * `name` {string} Benchmark name
  * `plugins` {object} Object containing the plugin results if there's one active

The purpose of the run method is to run all the benchmarks that have been
added to the suite using the [`suite.add()`][] function.
By calling the run method, you can easily trigger the execution of all
the stored benchmarks and obtain the corresponding results.

## Plugins

The benchmark module supports a flexible plugin system that
allows you to extend its functionality by adding custom plugins.
This documentation explains how to create, validate, and use
plugins within the benchmarking framework.

### Structure

Each plugin is expected to follow a specific structure with required methods
for integration into the benchmark module. The plugins are required to define
the following methods:

* `isSupported()`: This method checks if the plugin can run in the
  current environment. If the plugin uses features specific to certain
  environments (e.g., V8 engine features), it should return `true` if those
  features are available and `false` otherwise.

* `toString()`: This method should return a string representation of the plugin.
  It’s used for logging and error messages.

In addition to these required methods, plugins can optionally define other
methods based on their functionality, such as `beforeClockTemplate()`,
`afterClockTemplate()`, `onCompleteBenchmark()`, and more.

### Plugin Methods

### `isSupported()` (required)

This method checks if the plugin's functionality is available in the
current environment. For instance, if a plugin uses specific V8 engine commands,
this method ensures the environment supports them.

### `beforeClockTemplate(varNames)`

* `varNames` Object
  * `bench` string  - Name for the benchmark variable.
  * `context` string - Name for the context variable.
  * `timer` string - Name for the timer variable.
  * `awaitOrEmpty` string - A string with `await` or empty string (`''`).

Some plugins need to modify or prepare the code before the benchmark starts.
The `beforeClockTemplate()` method allows you to inject code before the timing
process begins.

This method must return an array where:

* The first element is a string representing the JavaScript code to be executed
before the benchmark function.

* The second element (optional) is a string representing a function that will
wrap the benchmark function. This wrapper is used to customize how the
benchmark function is called during execution.

The wrapped function provides a powerful way to manipulate how the benchmark
is run without directly modifying the benchmark logic.

```js
beforeClockTemplate() {
  let code = '';

  code += `
function DoNotOptimize(x) {}
// Prevent DoNotOptimize from optimizing or being inlined.
%NeverOptimizeFunction(DoNotOptimize);
`
  return [code, 'DoNotOptimize'];
}
```

In this example, the plugin injects the `DoNotOptimize` function and also
provides it as a wrapper for the benchmark function.

### `afterClockTemplate(varNames)`

* `varNames` Object
  * `bench` string  - Name for the benchmark variable.
  * `context` string - Name for the context variable.
  * `timer` string - Name for the timer variable.
  * `awaitOrEmpty` string - A string with `await` or empty string (`''`).

After the benchmark runs, this method can inject code to gather performance data
or reset configurations. It must return an array where:

* The first element is a string containing the JavaScript code to be executed
after the benchmark finishes.

Unlike `beforeClockTemplate`, `afterClockTemplate` does not support a second
element in the returned array, as it only runs cleanup or data collection code
after the benchmark is executed.

### `onCompleteBenchmark(result)`

* `result` Object
  * `duration` number  - Benchmark duration
  * `count` number - Number of iterations
  * `context` object - A object used to store results after the benchmark clock

This method is called when the benchmark completes. Plugins can collect and
process data from the benchmark results in this step.

### `toString()` (required)

This method returns a string identifier for the plugin, typically the plugin’s
name. It is used in error messages and logging.

### Example Plugins

Here are examples of plugins that follow the required structure and functionality.

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

    code += `%OptimizeFunctionOnNextCall(${ bench }.fn);\n`;
    code += `${ awaitOrEmpty }${ bench }.fn();\n`;
    code += `${ awaitOrEmpty }${ bench }.fn();\n`;

    return [code];
  }

  toString() {
    return 'V8OptimizeOnNextCallPlugin';
  }
}
```

## Official Plugins

This is a list of official plugins that can be fetched when requiring
`bench-node` module.

```js
const { V8OptimizeOnNextCallPlugin, Suite } = require('bench-node');
const suite = new Suite({
  plugins: [new V8OptimizeOnNextCallPlugin()],
})
```

### Class: `V8OptimizeOnNextCallPlugin`

The `V8OptimizeOnNextCallPlugin` triggers the V8 engine to optimize the
function before it is called. This can improve performance in repeated
benchmarks.

### Class: `V8NeverOptimizePlugin`

The `V8NeverOptimizePlugin` prevents the V8 engine from optimizing or inlining
a function, useful when you want to benchmark functions without any
optimization.

### Class: `V8GetOptimizationStatus`

The `V8GetOptimizationStatus` plugin collects the V8 engine's optimization
status for a given function after it has been benchmarked.

## Using custom reporter

You can customize the data reporting by passing an function to the `reporter` argument while creating your `Suite`:

```js
const { Suite } = require('bench-node');

function reporter(bench, result) {
  console.log(`Benchmark: ${bench.name} - ${result.opsSec} ops/sec`);
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

```console
$ node --allow-natives-syntax my-benchmark.js
Benchmark: Using delete to remove property from object - 6032212 ops/sec
```

## Setup and Teardown

The benchmark function has a special handling when you pass an argument,
for example:

```cjs
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

In this way, you can control when the `timer` will start
and also when the `timer` will stop.

In the timer, we also give you a property `count`
that will tell you how much iterations
you should run your function to achieve the `benchmark.minTime`,
see the following example:

```js
const { Suite } = require('bench-node');
const { readFileSync, writeFileSync, rmSync } = require('node:fs');

const suite = new Suite();

suite.add('readFileSync', (timer) => {
  const randomFile = Date.now();
  const filePath = `./${randomFile}.txt`;
  writeFileSync(filePath, Math.random().toString());

  timer.start();
  for (let i = 0; i < timer.count; i++)
    readFileSync(filePath, 'utf8');
  // You must send to the `.end` function the amount of
  // times you executed the function, by default,
  // the end will be called with value 1.
  timer.end(timer.count);

  rmSync(filePath);
});

suite.run();
```

Once your function has at least one argument,
you must call `.start` and `.end`, if you didn't,
it will throw the error `ERR_BENCHMARK_MISSING_OPERATION`
