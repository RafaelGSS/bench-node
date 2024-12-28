const { Worker } = require("node:worker_threads");
const { types } = require("node:util");
const path = require("node:path");

const { textReport, chartReport, htmlReport, jsonReport } = require("./report");
const {
	getInitialIterations,
	runBenchmark,
	runWarmup,
} = require("./lifecycle");
const { debugBench, timer, createFnString } = require("./clock");
const {
	validatePlugins,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
} = require("./plugins");
const {
	validateFunction,
	validateNumber,
	validateObject,
	validateString,
	validateArray,
} = require("./validators");

const getFunctionBody = (string) =>
	string.substring(string.indexOf("{") + 1, string.lastIndexOf("}"));

class Benchmark {
	name = "Benchmark";
	fn;
	minTime;
	maxTime;
	plugins;
	repeatSuite;

	constructor(name, fn, minTime, maxTime, plugins, repeatSuite) {
		this.name = name;
		this.fn = fn;
		this.minTime = minTime;
		this.maxTime = maxTime;
		this.plugins = plugins;
		this.repeatSuite = repeatSuite;

		this.hasArg = this.fn.length >= 1;
		if (this.fn.length > 1) {
			process.emitWarning(
				`The benchmark "${this.name}" function should not have more than 1 argument.`,
			);
		}

		this.isAsync = types.isAsyncFunction(this.fn);

		this.fnStr = createFnString(this);
	}

	serializeBenchmark() {
		// Regular functions can't be passed to worker.postMessage
		// So we pass the string and deserialize fnStr into a new Function
		// on worker
		this.fn = getFunctionBody(this.fn.toString());
	}
}

const defaultBenchOptions = {
	// 0.05s - Arbitrary number used in some benchmark tools
	minTime: 0.05,
	// 0.5s - Arbitrary number used in some benchmark tools
	maxTime: 0.5,
	// Number of times the benchmark will be repeated
	repeatSuite: 1,
};

function throwIfNoNativesSyntax() {
	if (process.execArgv.includes("--allow-natives-syntax") === false) {
		throw new Error(
			"bench-node module must be run with --allow-natives-syntax argument",
		);
	}
}

class Suite {
	#benchmarks;
	#reporter;
	#plugins;
	#useWorkers;

	constructor(options = {}) {
		this.#benchmarks = [];
		validateObject(options, "options");
		if (options?.reporter !== undefined) {
			if (options?.reporter !== false && options?.reporter !== null) {
				validateFunction(options.reporter, "reporter");
			}
			this.#reporter = options.reporter;
		} else {
			this.#reporter = textReport;
		}

		this.#useWorkers = options.useWorkers || false;
		if (options?.plugins) {
			validateArray(options.plugins, "plugin");
			validatePlugins(options.plugins);
		}
		this.#plugins = options?.plugins || [new V8NeverOptimizePlugin()];
	}

	add(name, options, fn) {
		validateString(name, "name");
		if (typeof options === "function") {
			fn = options;
			options = defaultBenchOptions;
		} else {
			validateObject(options, "options");
			options = {
				...defaultBenchOptions,
				...options,
			};
			validateNumber(
				options.minTime,
				"options.minTime",
				timer.resolution * 1e3,
			);
			validateNumber(options.maxTime, "options.maxTime", options.minTime);
			validateNumber(
				options.repeatSuite,
				"options.repeatSuite",
				options.repeatSuite,
			);
		}
		validateFunction(fn, "fn");

		const benchmark = new Benchmark(
			name,
			fn,
			options.minTime,
			options.maxTime,
			this.#plugins,
			options.repeatSuite,
		);
		this.#benchmarks.push(benchmark);
		return this;
	}

	async run() {
		throwIfNoNativesSyntax();
		const results = new Array(this.#benchmarks.length);

		// It doesn't make sense to warmup a fresh new instance of Worker.
		// TODO: support warmup directly in the Worker.
		if (!this.#useWorkers) {
			// This is required to avoid variance on first benchmark run
			for (let i = 0; i < this.#benchmarks.length; ++i) {
				const benchmark = this.#benchmarks[i];
				debugBench(
					`Warmup ${benchmark.name} with minTime=${benchmark.minTime}, maxTime=${benchmark.maxTime}`,
				);
				const initialIteration = await getInitialIterations(benchmark);
				await runWarmup(benchmark, initialIteration, {
					minTime: 0.005,
					maxTime: 0.05,
				});
			}
		}

		for (let i = 0; i < this.#benchmarks.length; ++i) {
			const benchmark = this.#benchmarks[i];
			// Warmup is calculated to reduce noise/bias on the results
			const initialIterations = await getInitialIterations(benchmark);
			debugBench(
				`Starting ${benchmark.name} with minTime=${benchmark.minTime}, maxTime=${benchmark.maxTime}, repeatSuite=${benchmark.repeatSuite}`,
			);

			let result;
			if (this.#useWorkers) {
				result = await this.runWorkerBenchmark(benchmark, initialIterations);
			} else {
				result = await runBenchmark(
					benchmark,
					initialIterations,
					benchmark.repeatSuite,
				);
			}
			results[i] = result;
		}

		if (this.#reporter) {
			this.#reporter(results);
		}
		return results;
	}

	runWorkerBenchmark(benchmark, initialIterations) {
		benchmark.serializeBenchmark();
		const worker = new Worker(path.join(__dirname, "./worker-runner.js"));

		worker.postMessage({
			benchmark,
			initialIterations,
			repeatSuite: benchmark.repeatSuite,
		});
		return new Promise((resolve, reject) => {
			worker.on("message", (result) => {
				resolve(result);
				// TODO: await?
				worker.terminate();
			});

			worker.on("error", (err) => {
				reject(err);
				worker.terminate();
			});

			worker.on("exit", (code) => {
				if (code !== 0) {
					reject(new Error(`Worker stopped with exit code ${code}`));
				}
			});
		});
	}
}

module.exports = {
	Suite,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
	chartReport,
	textReport,
	htmlReport,
	jsonReport,
};
