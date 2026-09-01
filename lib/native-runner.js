const { bench: declareBench, createRunner } = require("node:bench");

const { debugBench, timer: clock } = require("./clock");
const { StatisticalHistogram } = require("./histogram");
const {
	ManagedTimer,
	completePluginSample,
	createPluginInvoker,
	parsePluginsResult,
	resetPlugins,
} = require("./plugin-runner");

const MAX_NATIVE_SAMPLES = 0xffffffff;
const WARMUP_SAMPLES = 2;

const cliNameCounts = new Map();

function isBenchCli() {
	return process.execArgv.some(
		(arg) => arg === "--bench" || arg.startsWith("--bench="),
	);
}

function getIterations(durationPerOperation, targetDuration) {
	if (targetDuration <= 0) return 1;

	return Math.min(
		Number.MAX_SAFE_INTEGER,
		Math.max(1, Math.round(targetDuration / durationPerOperation)),
	);
}

function createExecution(benchmark, benchmarkMode) {
	const repeatCount = Math.ceil(benchmark.repeatSuite);
	const samplesPerRun = Math.ceil(benchmark.minSamples);
	const state = {
		count: benchmarkMode === "time" ? 1 : 30,
		currentRun: 0,
		initialMeasurementCount: undefined,
		measurementSamples: 0,
		pluginSamples: [],
		runIndexes: [],
		samplesPerRun,
		runs: Array.from({ length: repeatCount }, () => ({
			duration: 0,
			operations: 0,
			samples: 0,
		})),
	};

	const invoke = createPluginInvoker(benchmark);
	const callback = benchmark.isAsync
		? async (context) => {
				const timer = benchmark.hasArg ? new ManagedTimer(state.count) : clock;
				const [sample, pluginContext] = await invoke(
					benchmark,
					context,
					timer,
					state.count,
				);
				recordPluginSample(benchmark, state, sample, pluginContext);
				afterSample(benchmark, benchmarkMode, state, context, sample);
			}
		: (context) => {
				const timer = benchmark.hasArg ? new ManagedTimer(state.count) : clock;
				const [sample, pluginContext] = invoke(
					benchmark,
					context,
					timer,
					state.count,
				);
				recordPluginSample(benchmark, state, sample, pluginContext);
				afterSample(benchmark, benchmarkMode, state, context, sample);
			};

	return { callback, repeatCount, state };
}

function recordPluginSample(benchmark, state, sample, pluginContext) {
	if (benchmark.capturePluginSamples) {
		state.pluginSamples.push([
			Number(sample.duration_ns),
			sample.operations,
			pluginContext,
		]);
		return;
	}

	completePluginSample(benchmark, sample, pluginContext);
}

function afterSample(benchmark, benchmarkMode, state, context, sample) {
	if (benchmarkMode === "time") {
		if (context.phase === "measurement") {
			state.runIndexes.push(
				Math.floor(state.measurementSamples / state.samplesPerRun),
			);
			state.measurementSamples++;
		}
		return;
	}

	const duration = Number(sample.duration_ns);
	const durationPerOperation = duration / sample.operations;

	if (context.phase === "warmup") {
		state.count = getIterations(durationPerOperation, benchmark.minTime * 1e9);
		return;
	}

	state.initialMeasurementCount ??= state.count;
	const run = state.runs[state.currentRun];
	run.duration += duration;
	run.operations += sample.operations;
	run.samples++;
	state.runIndexes.push(state.currentRun);

	const runComplete =
		run.duration >= benchmark.maxTime * 1e9 &&
		run.samples > benchmark.minSamples;

	if (runComplete) {
		if (state.currentRun + 1 === state.runs.length) {
			context.done();
			return;
		}

		state.currentRun++;
		state.count = state.initialMeasurementCount;
		return;
	}

	const remainingDuration = Math.max(
		0,
		Math.min(benchmark.maxTime * 1e9 - run.duration, benchmark.minTime * 1e9),
	);
	state.count = getIterations(durationPerOperation, remainingDuration);
}

function normalizeResult(benchmark, benchmarkMode, nativeResult, state) {
	if (nativeResult.error !== undefined) throw nativeResult.error;

	const histogram = new StatisticalHistogram();
	let totalDuration = 0;
	let totalIterations = 0;

	for (let i = 0; i < nativeResult.samples.length; i++) {
		const sample = nativeResult.samples[i];
		const duration = Number(sample.duration_ns);
		const run = state.runs[state.runIndexes[i]];
		run.duration += benchmarkMode === "time" ? duration : 0;
		run.operations += benchmarkMode === "time" ? sample.operations : 0;
		run.samples += benchmarkMode === "time" ? 1 : 0;
		totalDuration += duration;
		totalIterations += sample.operations;
		histogram.record(duration / sample.operations);
	}
	histogram.finish();

	const plugins = parsePluginsResult(benchmark.plugins, benchmark.name);
	resetPlugins(benchmark.plugins);

	const result = {
		iterations: totalIterations,
		histogram: {
			samples: histogram.samples.length,
			min: histogram.min,
			max: histogram.max,
			sampleData: histogram.samples,
		},
		name: benchmark.name,
		plugins,
		baseline: benchmark.baseline,
	};

	if (benchmarkMode === "time") {
		result.totalTime = totalDuration / 1e9 / totalIterations;
	} else {
		result.opsSec = totalIterations / (totalDuration / 1e9);
		result.opsSecPerRun = state.runs.map(
			(run) => run.operations / (run.duration / 1e9),
		);
	}

	debugBench(
		`${benchmark.name} completed ${nativeResult.samples.length} native samples`,
	);
	return result;
}

function getNativeOptions(benchmark, benchmarkMode, cli) {
	const options = {
		samples:
			benchmarkMode === "time"
				? Math.ceil(benchmark.repeatSuite) * Math.ceil(benchmark.minSamples)
				: MAX_NATIVE_SAMPLES,
		warmup: WARMUP_SAMPLES,
	};

	if (cli) {
		const count = cliNameCounts.get(benchmark.name) ?? 0;
		cliNameCounts.set(benchmark.name, count + 1);
		if (count > 0) options.params = { __benchNodeDeclaration: count };
	}

	return options;
}

async function runNativeBenchmark(
	benchmark,
	benchmarkMode,
	cli = isBenchCli(),
	includeState = false,
) {
	const execution = createExecution(benchmark, benchmarkMode);
	const options = getNativeOptions(benchmark, benchmarkMode, cli);
	let nativeResult;

	if (cli) {
		nativeResult = await declareBench(
			benchmark.name,
			options,
			execution.callback,
		);
	} else {
		const runner = createRunner({ yieldBetweenSamples: false });
		const completion = runner.bench(
			benchmark.name,
			options,
			execution.callback,
		);
		for await (const _record of runner.run());
		nativeResult = await completion;
	}

	const result = normalizeResult(
		benchmark,
		benchmarkMode,
		nativeResult,
		execution.state,
	);
	return includeState
		? { pluginSamples: execution.state.pluginSamples, result }
		: result;
}

module.exports = {
	isBenchCli,
	runNativeBenchmark,
};
