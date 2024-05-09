const { clockBenchmark, debugBench, MIN_RESOLUTION, timer } = require('./clock');
const { StatisticalHistogram } = require('./histogram');

/**
 * @param {number} durationPerOp The amount of time each operation takes
 * @param {number} targetTime The amount of time we want the benchmark to execute
 */
function getItersForOpDuration(durationPerOp, targetTime) {
  const totalOpsForMinTime = targetTime / (durationPerOp / timer.scale);

  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.round(totalOpsForMinTime)));
}

async function getInitialIterations(bench) {
  const { 0: duration, 1: realIterations } = await clockBenchmark(bench, 30);

  // Just to avoid issues with empty fn
  const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);
  debugBench(`Duration per operation on initial count: ${ timer.format(durationPerOp) }`);

  if ((durationPerOp / timer.scale) >= bench.minTime)
    process.emitWarning(`The benchmark "${ bench.name }" has a duration per operation greater than the minTime.`);

  return getItersForOpDuration(durationPerOp, bench.minTime);
}

async function runBenchmark(bench, initialIterations) {
  const histogram = new StatisticalHistogram();

  let startClock;
  let benchTimeSpent = 0;
  const maxDuration = bench.maxTime * timer.scale;

  let iterations = 0;
  let timeSpent = 0;

  while (benchTimeSpent < maxDuration) {
    startClock = timer.now();
    // TODO: There are some operations that is being called after the startClock
    //   * Compiling the function
    //   * Passing "context" around
    // We should really call timer.now(); bench.run(); timer.end();
    const { 0: duration, 1: realIterations, 2: context } = await clockBenchmark(bench, initialIterations);
    benchTimeSpent += Number(timer.now() - startClock);

    iterations += realIterations;
    iterations = Math.min(Number.MAX_SAFE_INTEGER, iterations);

    timeSpent += duration;

    // Just to avoid issues with empty fn
    const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);

    histogram.record(durationPerOp);

    if (benchTimeSpent >= maxDuration)
      break;

    const minWindowTime = Math.max(0, Math.min((maxDuration - benchTimeSpent) / timer.scale, bench.minTime));
    initialIterations = getItersForOpDuration(durationPerOp, minWindowTime);
  }

  histogram.finish()

  for (const plugin of bench.plugins) {
    if (typeof plugin.onCompleteBenchmark === 'function')
      plugin.onCompleteBenchmark();
  }

  const opsSec = iterations / (timeSpent / timer.scale);

  return {
    opsSec,
    iterations,
    histogram,
    plugins: bench.plugins.map(plugin => plugin.getResult?.()).filter(Boolean),
  };
}

module.exports = {
  getInitialIterations,
  runBenchmark,
};
