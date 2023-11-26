const {
  MathMax,
  MathMin,
  MathRound,
  NumberMAX_SAFE_INTEGER,
  ArrayPrototypeFilter,
  ArrayPrototypeMap,
} = require('./primordials');
const { clockBenchmark, debugBench, hasGcAvailable, MIN_RESOLUTION, timer } = require('./clock');
const { kStatisticalHistogramFinish, kStatisticalHistogramRecord, StatisticalHistogram } = require('./histogram');

// 0.05 - Arbitrary number used in some benchmark tools
const minTime = 0.05;

// 0.5s - Arbitrary number used in some benchmark tools
const maxTime = 0.5;

/**
 * @param {number} durationPerOp The amount of time each operation takes
 * @param {number} targetTime The amount of time we want the benchmark to execute
 */
function getItersForOpDuration(durationPerOp, targetTime) {
  const totalOpsForMinTime = targetTime / (durationPerOp / timer.scale);

  return MathMin(NumberMAX_SAFE_INTEGER, MathMax(1, MathRound(totalOpsForMinTime)));
}

async function getInitialIterations(bench) {
  const { 0: duration, 1: realIterations } = await clockBenchmark(bench, 30);

  // Just to avoid issues with empty fn
  const durationPerOp = MathMax(MIN_RESOLUTION, duration / realIterations);
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
    const { 0: duration, 1: realIterations, 2: context } = await clockBenchmark(bench, initialIterations);
    benchTimeSpent += Number(timer.now() - startClock);

    iterations += realIterations;
    iterations = MathMin(NumberMAX_SAFE_INTEGER, iterations);

    timeSpent += duration;

    // Just to avoid issues with empty fn
    const durationPerOp = MathMax(MIN_RESOLUTION, duration / realIterations);

    histogram[kStatisticalHistogramRecord](durationPerOp);

    if (benchTimeSpent >= maxDuration)
      break;

    const minWindowTime = MathMax(0, MathMin((maxDuration - benchTimeSpent) / timer.scale, bench.minTime));
    initialIterations = getItersForOpDuration(durationPerOp, minWindowTime);
  }

  histogram[kStatisticalHistogramFinish]();

  for (const enricher of bench.enrichers) {
    if (typeof enricher.onCompleteBenchmark === 'function')
      enricher.onCompleteBenchmark();
  }

  const opsSec = iterations / (timeSpent / timer.scale);

  return {
    __proto__: null,
    opsSec,
    iterations,
    histogram,
    enrichers: ArrayPrototypeFilter(ArrayPrototypeMap(bench.enrichers, enricher => enricher.getResult?.()), Boolean),
  };
}

module.exports = {
  getInitialIterations,
  runBenchmark,
  minTime,
  maxTime,
};
