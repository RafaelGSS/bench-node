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
) {
	let iterations = 0;
	let timeSpent = 0;
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

async function runBenchmark(bench, initialIterations, repeatSuite, minSamples) {
	const histogram = new StatisticalHistogram();

	const maxDuration = bench.maxTime * timer.scale;

	let totalIterations = 0;
	let totalTimeSpent = 0;
	for (let i = 0; i < repeatSuite; ++i) {
		const { iterations, timeSpent } = await runBenchmarkOnce(bench, histogram, {
			initialIterations,
			maxDuration,
			minSamples,
		});
		totalTimeSpent += timeSpent;
		totalIterations += iterations;
	}
	histogram.finish();

	const opsSec = totalIterations / (totalTimeSpent / timer.scale);

	const sampleData = histogram.samples;

	return {
		opsSec,
		iterations: totalIterations,
		// StatisticalHistogram is not a serializable object
		histogram: {
			samples: sampleData.length,
			min: histogram.min,
			max: histogram.max,
			sampleData,
		},
		name: bench.name,
		plugins: parsePluginsResult(bench.plugins, bench.name),
	};
}

module.exports = {
	getInitialIterations,
	runBenchmark,
	runWarmup,
};
