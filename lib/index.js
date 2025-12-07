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
const { runBenchmarks } = require("./lifecycle");
const { timer, createFnString } = require("./clock");
const {
	validatePlugins,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
	MemoryPlugin,
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
	#minSamples;

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

		// Suite-level minSamples option
		if (options.minSamples !== undefined) {
			validateNumber(options.minSamples, "options.minSamples", 1);
			this.#minSamples = options.minSamples;
		} else {
			this.#minSamples = defaultBenchOptions.minSamples;
		}
	}

	add(name, options, fn) {
		validateString(name, "name");
		if (typeof options === "function") {
			fn = options;
			options = {
				...defaultBenchOptions,
				minSamples: this.#minSamples,
			};
		} else {
			validateObject(options, "options");
			options = {
				...defaultBenchOptions,
				minSamples: this.#minSamples,
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

		let results;

		if (this.#useWorkers) {
			if (this.#benchmarkMode === "time") {
				//TODO: Is this still true?
				console.warn(
					"Warning: Worker mode currently doesn't fully support 'time' benchmarkMode.",
				);
			}

			results = [];

			for (const benchmark of this.#benchmarks) {
				//TODO: Should worker thread benchmarks be run in parallel?
				results.push(
					await this.runWorkerBenchmark(benchmark, this.#benchmarkMode),
				);
			}
		} else {
			results = await runBenchmarks(this.#benchmarks, this.#benchmarkMode);
		}

		if (this.#reporter) {
			this.#reporter(results, this.#reporterOptions);
		}

		return results;
	}

	async runWorkerBenchmark(benchmark, benchmarkMode) {
		return new Promise((resolve, reject) => {
			const workerPath = path.resolve(__dirname, "./worker-runner.js");
			const worker = new Worker(workerPath);

			benchmark.serializeBenchmark();
			// TODO: Why double-send data that is already in the benchmark?
			worker.postMessage({
				benchmark,
				benchmarkMode,
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
	MemoryPlugin,
	chartReport,
	textReport,
	prettyReport,
	htmlReport,
	jsonReport,
	csvReport,
};
