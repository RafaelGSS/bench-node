const { parentPort } = require("node:worker_threads");
const { runBenchmark } = require("./lifecycle");

// Deserialize the benchmark function
function deserializeBenchmark(benchmark) {
	benchmark.fn = new Function(benchmark.fn);
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
