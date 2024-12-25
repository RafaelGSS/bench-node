# Plugins

The benchmark module supports a flexible plugin system that
allows you to extend its functionality by adding custom plugins.
This documentation explains how to create, validate, and use
plugins within the benchmarking framework.

[V8NeverOptimizePlugin](#class-v8neveroptimizeplugin) is enabled by default.

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

* `varNames` {Object}
  * `bench` {string}  - Name for the benchmark variable.
  * `context` {string} - Name for the context variable.
  * `timer` {string} - Name for the timer variable.
  * `awaitOrEmpty` {string} - A string with `await` or empty string (`''`).

After the benchmark runs, this method can inject code to gather performance data
or reset configurations. It must return an array where:

* The first element is a string containing the JavaScript code to be executed
after the benchmark finishes.

Unlike `beforeClockTemplate`, `afterClockTemplate` does not support a second
element in the returned array, as it only runs cleanup or data collection code
after the benchmark is executed.

### `onCompleteBenchmark(result)`

* `result` {Object}
  * `duration` {number}  - Benchmark duration
  * `count` {number} - Number of iterations
  * `context` {Object} - A object used to store results after the benchmark clock

This method is called when the benchmark completes. Plugins can collect and
process data from the benchmark results in this step.

### `toString()` (required)

This method returns a string identifier for the plugin, typically the plugin’s
name. It is used in error messages and logging.

## Example Plugins

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

### Class: `RecordMemorySpikePlugin`

A plugin to record memory allocation spikes in your benchmark's run. It should help you understand the speed vs memory tradeoffs you're making.
