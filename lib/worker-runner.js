const { parentPort } = require("node:worker_threads");
const { runNativeBenchmark } = require("./native-runner");

function deserializeBenchmark(benchmark) {
	benchmark.fn = new Function(`return (${benchmark.fnSource})`)();
	benchmark.fnSource = undefined;
}

parentPort.on("message", async ({ benchmark, benchmarkMode }) => {
	deserializeBenchmark(benchmark);
	const output = await runNativeBenchmark(
		benchmark,
		benchmarkMode,
		false,
		true,
	);
	parentPort.postMessage(output);
});
