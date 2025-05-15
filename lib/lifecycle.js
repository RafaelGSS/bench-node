const {
	clockBenchmark,
	debugBench,
	MIN_RESOLUTION,
	timer,
} = require("./clock");
const { StatisticalHistogram } = require("./histogram");

/**
 * @param {number} durationPerOp The amount of time each operation takes
 * @param {number} targetTime The amount of time we want the benchmark to execute
 */
function getItersForOpDuration(durationPerOp, targetTime) {
	const totalOpsForMinTime = targetTime / (durationPerOp / timer.scale);

	return Math.min(
		Number.MAX_SAFE_INTEGER,
		Math.max(1, Math.round(totalOpsForMinTime)),
	);
}

function parsePluginsResult(plugins, name) {
	const result = [];
	for (const p of plugins) {
		result.push({
			name: p.toString(),
			result: p.getResult?.(name) ?? "enabled",
			report: p.getReport?.(name) ?? "",
		});
	}
	return result;
}

/**
 * Calculates and returns the initial number of iterations for a benchmark
 * @param {import('./index').Benchmark} bench - The benchmark object to be executed
 * @returns {Promise<number>} The calculated number of initial iterations
 */
async function getInitialIterations(bench) {
	const { 0: duration, 1: realIterations } = await clockBenchmark(bench, 30);

	// Just to avoid issues with empty fn
	const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);
	debugBench(
		`Duration per operation on initial count: ${timer.format(durationPerOp)}`,
	);

	// TODO: is this a correct assumpion?
	if (durationPerOp / timer.scale >= bench.maxTime)
		process.emitWarning(
			`The benchmark "${bench.name}" has a duration per operation greater than the maxTime.`,
		);

	return getItersForOpDuration(durationPerOp, bench.minTime);
}

/**
 * Executes the warmup phase of a benchmark
 * @param {import('./index').Benchmark} bench - The benchmark object to be executed
 * @param {number} initialIterations - The initial number of iterations to run
 * @param {Object} options - Warmup options
 * @param {number} [options.minTime] - Minimum time for warmup, defaults to bench.minTime
 * @param {number} [options.maxTime] - Maximum time for warmup, defaults to bench.minTime
 * @returns {Promise<void>}
 */
async function runWarmup(bench, initialIterations, { minTime, maxTime }) {
	minTime = minTime ?? bench.minTime;
	maxTime = maxTime ?? bench.minTime;

	const maxDuration = maxTime * timer.scale;
	const minSamples = 10;

	let iterations = 0;
	let timeSpent = 0;
	let samples = 0;

	while (timeSpent < maxDuration || samples <= minSamples) {
		const { 0: duration, 1: realIterations } = await clockBenchmark(
			bench,
			initialIterations,
		);
		timeSpent += duration;

		iterations += realIterations;
		iterations = Math.min(Number.MAX_SAFE_INTEGER, iterations);

		// Just to avoid issues with empty fn
		const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);

		const minWindowTime = Math.max(
			0,
			Math.min((maxDuration - timeSpent) / timer.scale, minTime),
		);
		initialIterations = getItersForOpDuration(durationPerOp, minWindowTime);
		samples++;
	}
}

async function runBenchmarkOnce(
	bench,
	histogram,
	{ initialIterations, maxDuration, minSamples },
	benchmarkMode = "ops",
) {
	let iterations = 0;
	let timeSpent = 0;

	// For time mode, we want to run the benchmark exactly once
	if (benchmarkMode === "time") {
		const { 0: duration, 1: realIterations } = await clockBenchmark(bench, 1);
		timeSpent = duration;
		iterations = realIterations;

		// Record the duration in the histogram
		histogram.record(duration);

		return { iterations, timeSpent };
	}

	// Ops mode - run the sampling loop
	while (timeSpent < maxDuration || histogram.samples.length <= minSamples) {
		const { 0: duration, 1: realIterations } = await clockBenchmark(
			bench,
			initialIterations,
		);
		timeSpent += duration;

		iterations += realIterations;
		iterations = Math.min(Number.MAX_SAFE_INTEGER, iterations);

		// Just to avoid issues with empty fn
		const durationPerOp = Math.max(MIN_RESOLUTION, duration / realIterations);

		histogram.record(durationPerOp);

		const minWindowTime = Math.max(
			0,
			Math.min((maxDuration - timeSpent) / timer.scale, bench.minTime),
		);
		initialIterations = getItersForOpDuration(durationPerOp, minWindowTime);
	}

	return { iterations, timeSpent };
}

/**
 * Executes a benchmark with the specified parameters
 * @param {import('./index').Benchmark} bench - The benchmark object to be executed
 * @param {number} initialIterations - The initial number of iterations to run
 * @param {string} benchmarkMode - The benchmark mode ('ops' or 'time')
 * @param {number} repeatSuite - Number of times to repeat the benchmark suite
 * @param {number} minSamples - Minimum number of samples to collect
 * @returns {Promise<Object>} The benchmark results containing operations per second or total time, iterations, histogram data and plugin results
 */
async function runBenchmark(
	bench,
	initialIterations,
	benchmarkMode,
	repeatSuite,
	minSamples,
) {
	const histogram = new StatisticalHistogram();
	const maxDuration = bench.maxTime * timer.scale;

	let totalIterations = 0;
	let totalTimeSpent = 0;
	const opsSecPerRun = [];

	for (let i = 0; i < repeatSuite; ++i) {
		const { iterations, timeSpent } = await runBenchmarkOnce(
			bench,
			histogram,
			{
				initialIterations,
				maxDuration,
				minSamples,
			},
			benchmarkMode,
		);

    const runOpsSec = iterations / (timeSpent / timer.scale);
    opsSecPerRun.push(runOpsSec);

		totalTimeSpent += timeSpent;
		totalIterations += iterations;
	}
	histogram.finish();

	const opsSec = totalIterations / (totalTimeSpent / timer.scale);
	const totalTime = totalTimeSpent / timer.scale; // Convert ns to seconds

	const sampleData = histogram.samples;

	const result = {
		iterations: totalIterations,
		// StatisticalHistogram is not a serializable object, keep raw ns for min/max
		histogram: {
			samples: sampleData.length,
			min: histogram.min,
			max: histogram.max,
			sampleData,
		},
		name: bench.name,
		plugins: parsePluginsResult(bench.plugins, bench.name),
	};

	// Add the appropriate metric based on the benchmark mode
	if (benchmarkMode === "time") {
		result.totalTime = totalTime / repeatSuite; // Average time per repeat
		debugBench(
			`${bench.name} completed ${repeatSuite} repeats with average time ${result.totalTime.toFixed(6)} seconds`,
		);
	} else {
		result.opsSec = opsSec;
    result.opsSecPerRun = opsSecPerRun;
		debugBench(
			`${bench.name} completed ${sampleData.length} samples with ${opsSec.toFixed(2)} ops/sec`,
		);
	}

	return result;
}

module.exports = {
	getInitialIterations,
	runBenchmark,
	runWarmup,
};
