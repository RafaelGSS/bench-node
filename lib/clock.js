const { debug } = require('node:util');
const { validateNumber } = require('./validators');

let debugBench = debug('benchmark', (fn) => {
  debugBench = fn;
});

const kUnmanagedTimerResult = Symbol('kUnmanagedTimerResult');

// If the smallest time measurement is 1ns
// the minimum resolution of this timer is 0.5
const MIN_RESOLUTION = 0.5;

class Timer {
  constructor() {
    this.now = process.hrtime.bigint;
  }

  get scale() {
    return 1e9;
  }

  get resolution() {
    return 1 / 1e9;
  }

  /**
   * @param {number} timeInNs
   * @returns {string}
   */
  format(timeInNs) {
    validateNumber(timeInNs, 'timeInNs', 0);

    if (timeInNs > 1e9) {
      return `${ (timeInNs / 1e9, 2).toFixed() }s`;
    }

    if (timeInNs > 1e6) {
      return `${ (timeInNs / 1e6, 2).toFixed() }ms`;
    }

    if (timeInNs > 1e3) {
      return `${ (timeInNs / 1e3, 2).toFixed() }us`;
    }

    if (timeInNs > 1e2) {
      return `${ (timeInNs, 0).toFixed() }ns`;
    }

    return `${ (timeInNs, 2).toFixed() }ns`;
  }
}

const timer = new Timer();

class ManagedTimer {
  startTime;
  endTime;
  iterations;
  recommendedCount;

  /**
   * @param {number} recommendedCount
   */
  constructor(recommendedCount) {
    this.recommendedCount = recommendedCount;
  }

  /**
   * Returns the recommended value to be used to benchmark your code
   * @returns {number}
   */
  get count() {
    return this.recommendedCount;
  }

  /**
   * Starts the timer
   */
  start() {
    this.startTime = timer.now();
  }

  /**
   * Stops the timer
   * @param {number} [iterations=1] The amount of iterations that run
   */
  end(iterations = 1) {
    validateNumber(iterations, 'iterations', 1);
    this.endTime = timer.now();
    this.iterations = iterations;
  }

  [kUnmanagedTimerResult](context) {
    if (this.startTime === undefined)
      throw new Error('You forgot to call .start()');

    if (this.endTime === undefined)
      throw new Error('You forgot to call .end(count)');

    return [Number(this.endTime - this.startTime), this.iterations, context];
  }
}

function createRunUnmanagedBenchmark(bench, awaitOrEmpty) {
  let code = `
let i = 0;
let context = {};
`;

  const varNames = {
    managed: false,
    awaitOrEmpty,
    globalThisVar: 'globalThis',
    contextVar: 'context',
    benchVar: 'bench',
  };

  code += `
const startedAt = timer.now();

function DoNotOptimize(x) {}
// Prevent DoNotOptimize from optimizing or being inlined.
%NeverOptimizeFunction(DoNotOptimize);

for (; i < count; i++)
  DoNotOptimize(${awaitOrEmpty}bench.fn());

const duration = Number(timer.now() - startedAt);
`;

  code += 'return [duration, count, context];';

  return code;
}

function createRunManagedBenchmark(bench, awaitOrEmpty) {
  let code = `
let i = 0;
let context = {};
`;

  code += `
${ awaitOrEmpty }bench.fn(timer);

const result = timer[kUnmanagedTimerResult](context);
`;

  code += 'return result;';

  return code;
}

const AsyncFunction = async function () {
}.constructor;
const SyncFunction = function () {
}.constructor;

function createRunner(bench, recommendedCount) {
  const isAsync = bench.fn.constructor === AsyncFunction;
  const hasArg = bench.fn.length >= 1;

  if (bench.fn.length > 1) {
    process.emitWarning(`The benchmark "${ bench.name }" function should not have more than 1 argument.`);
    process.exit(1);
  }

  const compiledFnStringFactory = hasArg ? createRunManagedBenchmark : createRunUnmanagedBenchmark;
  const compiledFnString = compiledFnStringFactory(bench, isAsync ? 'await ' : '');
  const createFnPrototype = isAsync ? AsyncFunction : SyncFunction;
  const compiledFn = createFnPrototype('bench', 'timer', 'count', 'kUnmanagedTimerResult', compiledFnString);

  const selectedTimer = hasArg ? new ManagedTimer(recommendedCount) : timer;

  const runner = compiledFn.bind(globalThis, bench, selectedTimer, recommendedCount, kUnmanagedTimerResult);

  debugBench(`Compiled Code: ${ compiledFnString }`);
  debugBench(`Created compiled benchmark, hasArg=${ hasArg }, isAsync=${ isAsync }, recommendedCount=${ recommendedCount }`);

  return runner;
}

async function clockBenchmark(bench, recommendedCount) {
  const runner = createRunner(bench, recommendedCount);
  // TODO: run it X more times to avoid outliers
  // TODO: run it in a worker_thread
  const result = await runner();

  // Just to avoid issues with empty fn
  result[0] = Math.max(MIN_RESOLUTION, result[0]);

  debugBench(`Took ${ timer.format(result[0]) } to execute ${ result[1] } iterations`);

  return result;
}

module.exports = {
  clockBenchmark,
  timer,
  MIN_RESOLUTION,
  debugBench,
};
