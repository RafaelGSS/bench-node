# Plugins

The benchmark module supports a flexible plugin system that
allows you to extend its functionality by adding custom plugins.
This documentation explains how to create, validate, and use
plugins within the benchmarking framework.

[V8NeverOptimizePlugin](#class-v8neveroptimizeplugin) is enabled by default.

Plugin templates are compiled around the callback executed by `node:bench`.
For unmanaged benchmarks, setup runs before `BenchContext.start()` and teardown
runs after `BenchContext.end()`. Managed benchmarks report their explicit timer
through `BenchContext.record()`.

To observe how a plugin is used, see the `plugin-api-doc.js` file in tests and explore its results.

## Structure

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

## Plugin Methods

### `isSupported()` (required)

This method checks if the plugin's functionality is available in the
current environment. For instance, if a plugin uses specific V8 engine commands,
this method ensures the environment supports them.

### `beforeClockTemplate(varNames)`

* `varNames` {Object}
  * `bench` {string}  - Name for the benchmark variable.
  * `context` {string} - Name for the context variable.
  * `timer` {string} - Name for the timer variable.
  * `awaitOrEmpty` {string} - A string with `await` or empty string (`''`).
  * `managed` {boolean} - Whether the benchmark uses the explicit timer API.

Some plugins need to modify or prepare the code before a benchmark sample
starts. The `beforeClockTemplate()` method allows you to inject code before the
timed region of each native warmup and measurement callback.

This method must return an array where:

* The first element is a string representing the JavaScript code to be executed
before the benchmark function.

* The second element (optional) is a string representing a function that will
wrap the benchmark function. This wrapper is used to customize how the
benchmark function is called during execution.

The wrapped function provides a powerful way to manipulate how the benchmark
is run without directly modifying the benchmark logic.

```js
beforeClockTemplate({ bench }) {
  let code = '';

  code += `
function DoNotOptimize(x) {}
// Prevent the benchmark function and result consumer from optimizing or being inlined.
%NeverOptimizeFunction(${bench}.fn);
%NeverOptimizeFunction(DoNotOptimize);
`
  return [code, 'DoNotOptimize'];
}
```

In this example, the plugin injects the `DoNotOptimize` function and also
provides it as a wrapper for the benchmark function result. The benchmark
function itself is marked with `%NeverOptimizeFunction(${bench}.fn)`, while the
`DoNotOptimize` wrapper consumes the returned value so the benchmark expression
does not become observationally irrelevant.

These two protections address different parts of the generated code:
`%NeverOptimizeFunction(${bench}.fn)` targets the function under test, and
`DoNotOptimize(bench.fn())` targets the value returned by each call.

### `afterClockTemplate(varNames)`

* `varNames` {Object}
  * `bench` {string}  - Name for the benchmark variable.
  * `context` {string} - Name for the context variable.
  * `timer` {string} - Name for the timer variable.
  * `awaitOrEmpty` {string} - A string with `await` or empty string (`''`).
  * `managed` {boolean} - Whether the benchmark uses the explicit timer API.

After each benchmark sample runs, this method can inject code to gather
performance data or reset configurations. It must return an array where:

* The first element is a string containing the JavaScript code to be executed
after the benchmark finishes.

Unlike `beforeClockTemplate`, `afterClockTemplate` does not support a second
element in the returned array, as it only runs cleanup or data collection code
after the benchmark is executed.

### `onCompleteBenchmark(result, benchmark)`

* `result` {Array}
  * `result[0]` {number} - Sample duration in nanoseconds.
  * `result[1]` {number} - Number of operations in the sample.
  * `result[2]` {Object} - Context populated by plugin templates.
* `benchmark` {Object} Benchmark metadata.

This method is called after each native warmup or measurement sample. Plugins
can collect and process data from the sample in this step. In worker mode, the
context must be structured-cloneable because the hook is replayed in the parent
thread.

### `toString()` (required)

This method returns a string identifier for the plugin, typically the plugin’s
name. It is used in error messages and logging.

## Example Plugins

Here are examples of plugins that follow the required structure and functionality.

```js
class V8OptimizeOnNextCallPlugin {
  isSupported() {
    try {
      new Function(`
        const fn = () => {};
        %PrepareFunctionForOptimization(fn);
        fn();
        fn();
        %OptimizeFunctionOnNextCall(fn);
        fn();
      `)();
      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate({ awaitOrEmpty, bench, timer }) {
    let code = '';

    code += `%PrepareFunctionForOptimization(${ bench }.fn);\n`;
    code += `${ awaitOrEmpty }${ bench }.fn(${ timer });\n`;
    code += `${ awaitOrEmpty }${ bench }.fn(${ timer });\n`;
    code += `%OptimizeFunctionOnNextCall(${ bench }.fn);\n`;

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
the benchmark function. It also wraps the benchmark result in a non-optimized
`DoNotOptimize` helper so V8 cannot treat an unused return value as irrelevant.

### Class: `V8GetOptimizationStatus`

The `V8GetOptimizationStatus` plugin collects the V8 engine's optimization
status for a given function after it has been benchmarked.
