const { textReport, chartReport } = require('./report');
const { getInitialIterations, runBenchmark, runWarmup } = require('./lifecycle');
const { debugBench, timer } = require('./clock');
const {
  validatePlugins,
  V8NeverOptimizePlugin,
  V8GetOptimizationStatus,
  V8OptimizeOnNextCallPlugin,
} = require('./plugins');
const {
  validateFunction,
  validateNumber,
  validateObject,
  validateString,
  validateArray,
} = require('./validators');

class Benchmark {
  name = 'Benchmark';
  fn;
  minTime;
  maxTime;
  plugins;

  constructor(name, fn, minTime, maxTime, plugins) {
    this.name = name;
    this.fn = fn;
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.plugins = plugins;
  }
}

const defaultBenchOptions = {
  // 0.05s - Arbitrary number used in some benchmark tools
  minTime: 0.05,
  // 0.5s - Arbitrary number used in some benchmark tools
  maxTime: 0.5,
};

function throwIfNoNativesSyntax() {
  if (process.execArgv.includes('--allow-natives-syntax') === false) {
    throw new Error('bench-node module must be run with --allow-natives-syntax argument');
  }
}

class Suite {
  #benchmarks;
  #reporter;
  #plugins;

  constructor(options = {}) {
    this.#benchmarks = [];
    validateObject(options, 'options');
    if (options?.reporter !== undefined) {
      if (options?.reporter !== false && options?.reporter !== null) {
        validateFunction(options.reporter, 'reporter');
      }
      this.#reporter = options.reporter;
    } else {
      this.#reporter = textReport;
    }

    if (options?.plugins) {
      validateArray(options.plugins, 'plugin');
      validatePlugins(options.plugins);
    }
    this.#plugins = options?.plugins || [new V8NeverOptimizePlugin()];
  }

  add(name, options, fn) {
    validateString(name, 'name');
    if (typeof options === 'function') {
      fn = options;
      options = defaultBenchOptions;
    } else {
      validateObject(options, 'options');
      options = {
        ...defaultBenchOptions,
        ...options
      };
      validateNumber(options.minTime, 'options.minTime', timer.resolution * 1e3);
      validateNumber(options.maxTime, 'options.maxTime', options.minTime);
    }
    validateFunction(fn, 'fn');

    const benchmark = new Benchmark(
      name,
      fn,
      options.minTime,
      options.maxTime,
      this.#plugins,
    );
    this.#benchmarks.push(benchmark);
    return this;
  }

  async run() {
    throwIfNoNativesSyntax();
    const results = new Array(this.#benchmarks.length);

    // This is required to avoid variance on first benchmark run
    for (let i = 0; i < this.#benchmarks.length; ++i) {
      const benchmark = this.#benchmarks[i];
      debugBench(`Warmup ${ benchmark.name } with minTime=${ benchmark.minTime }, maxTime=${ benchmark.maxTime }`);
      const initialIteration = await getInitialIterations(benchmark);
      await runWarmup(benchmark, initialIteration, { minTime: 0.005, maxTime: 0.05 });
    }

    for (let i = 0; i < this.#benchmarks.length; ++i) {
      const benchmark = this.#benchmarks[i];
      // Warmup is calculated to reduce noise/bias on the results
      const initialIteration = await getInitialIterations(benchmark);
      debugBench(`Starting ${ benchmark.name } with minTime=${ benchmark.minTime }, maxTime=${ benchmark.maxTime }`);
      const result = await runBenchmark(benchmark, initialIteration);
      results[i] = result;
    }

    if (this.#reporter) {
      this.#reporter(results);
    }

    return results;
  }
}

module.exports = {
  Suite,
  V8NeverOptimizePlugin,
  V8GetOptimizationStatus,
  V8OptimizeOnNextCallPlugin,
  chartReport,
  textReport,
};
