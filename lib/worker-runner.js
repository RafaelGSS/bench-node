const { parentPort } = require("node:worker_threads");
const { runBenchmark } = require("./lifecycle");
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
