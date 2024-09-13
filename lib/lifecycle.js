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

  // TODO: is this a correct assumpion?
  if ((durationPerOp / timer.scale) >= bench.maxTime)
    process.emitWarning(`The benchmark "${ bench.name }" has a duration per operation greater than the maxTime.`);

  return getItersForOpDuration(durationPerOp, bench.minTime);
}

async function runBenchmark(bench, initialIterations) {
  const histogram = new StatisticalHistogram();

  const maxDuration = bench.maxTime * timer.scale;
  const minSamples = 10;

  let iterations = 0;
  let timeSpent = 0;

  while (timeSpent < maxDuration || histogram.samples.length <= minSamples) {
    const { 0: duration, 1: realIterations } = await clockBenchmark(bench, initialIterations);
    timeSpent += duration

    iterations += realIterations;
    iterations = Math.min(Number.MAX_SAFE_INTEGER, iterations);

    // Just to avoid issues with empty fn
    const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);

    histogram.record(durationPerOp);

    const minWindowTime = Math.max(0, Math.min((maxDuration - timeSpent) / timer.scale, bench.minTime));
    initialIterations = getItersForOpDuration(durationPerOp, minWindowTime);
  }
  histogram.finish()

  const opsSec = iterations / (timeSpent / timer.scale);

  return {
    opsSec,
    iterations,
    histogram,
    name: bench.name,
  };
}

module.exports = {
  getInitialIterations,
  runBenchmark,
};
