const workerThreads = require("node:worker_threads");
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
const { debugBench, timer } = require("./clock");
const { isBenchCli, runNativeBenchmark } = require("./native-runner");
const {
	createNativeFnString,
	parsePluginsResult,
	resetPlugins,
} = require("./plugin-runner");
const {
	validatePlugins,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
	MemoryPlugin,
	DeadCodeEliminationDetectionPlugin,
} = require("./plugins");
const {
	validateFunction,
	validateNumber,
	validateObject,
	validateString,
	validateArray,
	validateBenchmarkMode,
	validateBoolean,
} = require("./validators");
const {
	welchTTest,
	compareBenchmarks,
	getSignificanceStars,
} = require("./utils/ttest");

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

		this.fnStr = createNativeFnString(this);
	}

	serializeBenchmark() {
		return {
			baseline: this.baseline,
			capturePluginSamples: true,
			fnSource: this.fn.toString(),
			fnStr: this.fnStr,
			hasArg: this.hasArg,
			isAsync: this.isAsync,
			maxTime: this.maxTime,
			minSamples: this.minSamples,
			minTime: this.minTime,
			name: this.name,
			plugins: [],
			repeatSuite: this.repeatSuite,
		};
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

// Minimum repeatSuite runs required for reliable t-test results
const MIN_REPEAT_FOR_TTEST = 30;

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
	#repeatSuite;
	#ttest;
	#dceDetector;

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

		// DCE detection is opt-in to avoid breaking changes
		const dceEnabled = options.detectDeadCodeElimination === true;
		if (dceEnabled) {
			this.#dceDetector = new DeadCodeEliminationDetectionPlugin(
				options.dceThreshold ? { threshold: options.dceThreshold } : {},
			);
		}

		// Plugin setup: If DCE detection is enabled, default to no plugins (allow optimization)
		// Otherwise, use V8NeverOptimizePlugin as the default
		if (options?.plugins) {
			validateArray(options.plugins, "plugin");
			validatePlugins(options.plugins);
			this.#plugins = options.plugins;
		} else if (dceEnabled) {
			// DCE detection requires optimization to be enabled, so no default plugins
			this.#plugins = [];
		} else {
			// Default behavior - use V8NeverOptimizePlugin
			this.#plugins = [new V8NeverOptimizePlugin()];
		}

		this.#benchmarkMode = options.benchmarkMode || "ops";
		validateBenchmarkMode(this.#benchmarkMode, "options.benchmarkMode");

		this.#reporterOptions = options.reporterOptions || {
			printHeader: true,
		};

		if (options.ttest !== undefined) {
			validateBoolean(options.ttest, "options.ttest");
		}
		this.#ttest = options.ttest ?? false;

		let repeatSuite = defaultBenchOptions.repeatSuite;
		if (options.repeatSuite !== undefined) {
			validateNumber(options.repeatSuite, "options.repeatSuite", 1);
			repeatSuite = options.repeatSuite;
		} else if (this.#ttest) {
			repeatSuite = MIN_REPEAT_FOR_TTEST;
		}
		this.#repeatSuite = repeatSuite;

		if (this.#ttest) {
			this.#reporterOptions.ttest = true;
		}
		let minSamples = defaultBenchOptions.minSamples;
		if (options.minSamples !== undefined) {
			validateNumber(options.minSamples, "options.minSamples", 1);
			minSamples = options.minSamples;
		}

		this.#minSamples = minSamples;
	}

	add(name, options, fn) {
		validateString(name, "name");
		if (typeof options === "function") {
			fn = options;
			options = {
				...defaultBenchOptions,
				minSamples: this.#minSamples,
				repeatSuite: this.#repeatSuite,
			};
		} else {
			validateObject(options, "options");
			options = {
				...defaultBenchOptions,
				minSamples: this.#minSamples,
				repeatSuite: this.#repeatSuite,
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
		const nativeCli = isBenchCli();
		const dceEnabled =
			this.#dceDetector &&
			!this.#useWorkers &&
			!nativeCli &&
			this.#benchmarkMode === "ops";

		if (dceEnabled) {
			await this.#measureBaseline();
			for (const benchmark of this.#benchmarks) {
				if (!benchmark.plugins.includes(this.#dceDetector)) {
					benchmark.plugins = [...benchmark.plugins, this.#dceDetector];
					benchmark.fnStr = createNativeFnString(benchmark);
				}
			}
		}

		if (nativeCli) {
			// The native CLI already runs benchmark files in isolated child processes.
			// Workers inherit --bench, where explicit runners are intentionally invalid,
			// so declarations must stay in the CLI-managed process in this mode.
			const pending = this.#benchmarks.map((benchmark) =>
				runNativeBenchmark(benchmark, this.#benchmarkMode, true),
			);
			const nativeResults = await Promise.all(pending);
			for (let i = 0; i < nativeResults.length; i++) {
				results[i] = nativeResults[i];
			}
		} else if (this.#useWorkers) {
			for (let i = 0; i < this.#benchmarks.length; ++i) {
				const benchmark = this.#benchmarks[i];
				results[i] = await this.runWorkerBenchmark(benchmark);
			}
		} else {
			for (let i = 0; i < this.#benchmarks.length; ++i) {
				const benchmark = this.#benchmarks[i];
				debugBench(
					`Starting ${benchmark.name} with node:bench, mode=${this.#benchmarkMode}, minTime=${benchmark.minTime}, maxTime=${benchmark.maxTime}, repeatSuite=${benchmark.repeatSuite}, minSamples=${benchmark.minSamples}`,
				);
				results[i] = await runNativeBenchmark(
					benchmark,
					this.#benchmarkMode,
					false,
				);
			}
		}

		if (this.#reporter && !nativeCli) {
			this.#reporter(results, this.#reporterOptions);
		}

		// Emit DCE warnings after reporting
		if (dceEnabled) {
			this.#dceDetector.emitWarnings();
		}

		return results;
	}

	async #measureBaseline() {
		debugBench("Measuring baseline for DCE detection...");

		// Create a minimal baseline benchmark (empty function)
		const baselineBench = new Benchmark(
			"__baseline__",
			() => {},
			0.01, // minTime
			0.05, // maxTime
			this.#plugins,
			1, // repeatSuite
			10, // minSamples
		);

		const result = await runNativeBenchmark(baselineBench, "ops", false);

		const baselineTimePerOp = (1 / result.opsSec) * 1e9; // Convert to ns
		debugBench(`DCE baseline: ${timer.format(baselineTimePerOp)}/iter`);

		this.#dceDetector.setBaseline(baselineTimePerOp);
	}

	async runWorkerBenchmark(benchmark) {
		return new Promise((resolve, reject) => {
			const workerPath = path.resolve(__dirname, "./worker-runner.js");
			const worker = new workerThreads.Worker(workerPath);

			worker.postMessage({
				benchmark: benchmark.serializeBenchmark(),
				benchmarkMode: this.#benchmarkMode, // Pass suite mode
			});

			worker.on("message", ({ pluginSamples, result }) => {
				for (const pluginResult of pluginSamples) {
					for (const plugin of benchmark.plugins) {
						plugin.onCompleteBenchmark?.(pluginResult, benchmark);
					}
				}
				result.plugins = parsePluginsResult(benchmark.plugins, benchmark.name);
				resetPlugins(benchmark.plugins);
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
	DeadCodeEliminationDetectionPlugin,
	chartReport,
	textReport,
	prettyReport,
	htmlReport,
	jsonReport,
	csvReport,
	// Statistical utilities
	welchTTest,
	compareBenchmarks,
	getSignificanceStars,
};
