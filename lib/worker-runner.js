const { parentPort } = require("node:worker_threads");
const {
	runBenchmark,
	getInitialIterations,
	runWarmup,
} = require("./lifecycle");
const { debugBench } = require("./clock");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

// Deserialize the benchmark function
function deserializeBenchmark(benchmark) {
	const { isAsync, hasArg } = benchmark;
	const fnPrototype = isAsync ? AsyncFunction : Function;

	if (hasArg) {
		benchmark.fn = new fnPrototype("timer", benchmark.fn);
	} else {
		benchmark.fn = new fnPrototype(benchmark.fn);
	}
}

parentPort.on(
	"message",
	async ({
		benchmark,
		initialIterations,
		benchmarkMode,
		repeatSuite,
		minSamples,
	}) => {
		deserializeBenchmark(benchmark);

		debugBench(
			`Warmup ${benchmark.name} with minTime=${benchmark.minTime}, maxTime=${benchmark.maxTime}`,
		);
		const initialIteration = await getInitialIterations(benchmark);
		await runWarmup(benchmark, initialIteration, {
			minTime: 0.005,
			maxTime: 0.05,
		});

		const result = await runBenchmark(
			benchmark,
			initialIterations,
			benchmarkMode,
			repeatSuite,
			minSamples,
		);
		parentPort.postMessage(result);
	},
);
