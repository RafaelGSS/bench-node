const { Worker } = require("node:worker_threads");
const { types } = require("node:util");
const path = require("node:path");

const {
	textReport,
	chartReport,
	htmlReport,
	jsonReport,
	csvReport,
	prettyReport,
} = require("./report");
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
	validateBenchmarkMode,
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
	minSamples;
	baseline = false;

	constructor(
		name,
		fn,
		minTime,
		maxTime,
		plugins,
		repeatSuite,
		minSamples,
		baseline = false,
	) {
		this.name = name;
		this.fn = fn;
		this.minTime = minTime;
		this.maxTime = maxTime;
		this.plugins = plugins;
		this.repeatSuite = repeatSuite;
		this.minSamples = minSamples;
		this.baseline = baseline;

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
	// Number minimum of samples the each round
	minSamples: 10,
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
	#benchmarkMode;
	#reporterOptions;

	constructor(options = {}) {
		this.#benchmarks = [];
		validateObject(options, "options");

		if (options?.reporter !== undefined) {
			if (options?.reporter !== false && options?.reporter !== null) {
				validateFunction(options.reporter, "reporter");
			}
			this.#reporter = options.reporter;
		} else if (options?.pretty === true) {
			this.#reporter = prettyReport;
		} else {
			this.#reporter = textReport;
		}

		this.#useWorkers = options.useWorkers || false;

		if (options?.plugins) {
			validateArray(options.plugins, "plugin");
			validatePlugins(options.plugins);
		}
		this.#plugins = options?.plugins || [new V8NeverOptimizePlugin()];

		// Benchmark Mode setup
		this.#benchmarkMode = options.benchmarkMode || "ops"; // Default to 'ops'
		validateBenchmarkMode(this.#benchmarkMode, "options.benchmarkMode");

		this.#reporterOptions = options.reporterOptions || {
			printHeader: true,
		};
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
			// Enforce strict minimum (> 1e-6s). Using EPSILON to make boundary exclusive.
			validateNumber(
				options.minTime,
				"options.minTime",
				timer.resolution * 1e3 + Number.EPSILON,
			);
			validateNumber(options.maxTime, "options.maxTime", options.minTime);
			validateNumber(options.repeatSuite, "options.repeatSuite", 1);
			validateNumber(options.minSamples, "options.minSamples", 1);
		}
		validateFunction(fn, "fn");

		const { baseline = false } = options || {};
		if (baseline && this.#benchmarks.some((b) => b.baseline)) {
			throw new Error("There is already a baseline benchmark");
		}

		const benchmark = new Benchmark(
			name,
			fn,
			options.minTime,
			options.maxTime,
			this.#plugins,
			options.repeatSuite,
			options.minSamples,
			baseline,
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
				`Starting ${benchmark.name} with mode=${this.#benchmarkMode}, minTime=${benchmark.minTime}, maxTime=${benchmark.maxTime}, repeatSuite=${benchmark.repeatSuite}, minSamples=${benchmark.minSamples}`,
			);

			let result;
			if (this.#useWorkers) {
				if (this.#benchmarkMode === "time") {
					console.warn(
						"Warning: Worker mode currently doesn't fully support 'time' benchmarkMode.",
					);
				}
				result = await this.runWorkerBenchmark(benchmark, initialIterations);
			} else {
				result = await runBenchmark(
					benchmark,
					initialIterations,
					this.#benchmarkMode,
					benchmark.repeatSuite,
					benchmark.minSamples,
				);
			}
			results[i] = result;
		}

		if (this.#reporter) {
			this.#reporter(results, this.#reporterOptions);
		}

		return results;
	}

	async runWorkerBenchmark(benchmark, initialIterations) {
		return new Promise((resolve, reject) => {
			const workerPath = path.resolve(__dirname, "./worker-runner.js");
			const worker = new Worker(workerPath);

			benchmark.serializeBenchmark();
			worker.postMessage({
				benchmark,
				initialIterations,
				benchmarkMode: this.#benchmarkMode, // Pass suite mode
				repeatSuite: benchmark.repeatSuite,
				minSamples: benchmark.minSamples,
			});

			worker.on("message", (result) => {
				resolve(result);
				worker.terminate();
			});
			worker.on("error", (error) => {
				reject(error);
				worker.terminate();
			});
			worker.on("exit", (code) => {
				if (code !== 0)
					reject(new Error(`Worker stopped with exit code ${code}`));
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
	prettyReport,
	htmlReport,
	jsonReport,
	csvReport,
};
