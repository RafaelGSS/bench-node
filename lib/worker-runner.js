const { parentPort } = require("node:worker_threads");
const {
	runBenchmark,
	getInitialIterations,
	runWarmup,
} = require("./lifecycle");
const { debugBench } = require("./clock");

// Deserialize the benchmark function from its source
function deserializeBenchmark(benchmark) {
	const source = benchmark.fn;
	try {
		benchmark.fn = new Function(`return (${source})`)();
	} catch (err) {
		if (!(err instanceof SyntaxError)) throw err;
		// Method shorthand (e.g. `run(timer) {}`) is only valid inside an
		// object literal. Getters and setters are not supported.
		const obj = new Function(`return ({${source}})`)();
		benchmark.fn = obj[Reflect.ownKeys(obj)[0]];
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
