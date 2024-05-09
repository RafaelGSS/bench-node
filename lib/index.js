const { reportConsoleBench } = require('./report');
const { getInitialIterations, runBenchmark } = require('./lifecycle');
const { debugBench, timer } = require('./clock');
const { validateFunction, validateNumber, validateObject, validateString } = require('./validators');

class Benchmark {
  name = 'Benchmark';
  fn;
  minTime;
  maxTime;
  plugins = [];

  constructor(name, fn, minTime, maxTime) {
    this.name = name;
    this.fn = fn;
    this.minTime = minTime;
    this.maxTime = maxTime;
  }

  addPlugins(plugins) {
    this.plugins = [
      ...this.plugins,
      ...plugins,
    ];
  }
}

const defaultBenchOptions = {
  // 0.05s - Arbitrary number used in some benchmark tools
  minTime: 0.05,
  // 0.5s - Arbitrary number used in some benchmark tools
  maxTime: 0.5,
};

class Suite {
  #benchmarks;
  #reporter;

  constructor(options = {}) {
    this.#benchmarks = [];
    if (options?.reporter) {
      validateFunction(options.reporter, 'reporter');
    }
    this.#reporter = options?.reporter || reportConsoleBench;
  }

  add(name, options, fn) {
    validateString(name, 'name');

    if (typeof options === 'function') {
      fn = options;
      options = defaultBenchOptions;
    } else {
      options = {
        ...defaultBenchOptions,
        ...options
      };
      validateObject(options, 'options');
      validateNumber(options.minTime, 'options.minTime', timer.resolution * 1e3);
      validateNumber(options.maxTime, 'options.maxTime', options.minTime);
    }
    validateFunction(fn, 'fn');

    const benchmark = new Benchmark(name, fn, options.minTime, options.maxTime);
    this.#benchmarks.push(benchmark);
    return this;
  }

  async run(plugins) {
    const results = new Array(this.#benchmarks.length);
    if (plugins) {
      // TODO: validatePlugins
    }

    for (let i = 0; i < this.#benchmarks.length; ++i) {
      const benchmark = this.#benchmarks[i];
      if (plugins) {
        benchmark.addPlugin(hooks);
      }
      // Warmup is calculated to reduce noise/bias on the results
      const initialIteration = await getInitialIterations(benchmark);

      debugBench(`Starting ${ benchmark.name } with minTime=${ benchmark.minTime }, maxTime=${ benchmark.maxTime }`);
      const result = await runBenchmark(benchmark, initialIteration);
      results[i] = result;
      this.#reporter(benchmark, result);
    }
    return results;
  }
}

module.exports = {
  Suite,
};
