const { timer } = require("../clock");

/**
 * Plugin that detects potential dead code elimination (DCE) in benchmarks.
 * Compares benchmark timings against a baseline (empty function) to identify
 * suspiciously fast benchmarks that may have been optimized away by the JIT.
 *
 * This helps educate users about benchmark quality and potential issues.
 */
class DeadCodeEliminationDetectionPlugin {
	#baselineTimePerOp = null;
	#warnings = new Map();
	#threshold = 10; // Warn if benchmark is less than 10x slower than baseline

	constructor(options = {}) {
		// Allow customizing the threshold
		if (options.threshold !== undefined) {
			this.#threshold = options.threshold;
		}
	}

	isSupported() {
		return true; // Works everywhere
	}

	/**
	 * Stores baseline measurement for comparison
	 * @param {number} timePerOp - Time per operation in nanoseconds
	 */
	setBaseline(timePerOp) {
		this.#baselineTimePerOp = timePerOp;
	}

	/**
	 * Called after each benchmark completes to check for DCE
	 */
	onCompleteBenchmark(result, bench) {
		if (this.#baselineTimePerOp === null) {
			// No baseline yet, skip detection
			return;
		}

		const [duration, iterations] = result;
		const timePerOp = duration / iterations;

		// Check if this benchmark is suspiciously fast compared to baseline
		if (timePerOp < this.#baselineTimePerOp * this.#threshold) {
			this.#warnings.set(bench.name, {
				timePerOp,
				baselineTime: this.#baselineTimePerOp,
				ratio: timePerOp / this.#baselineTimePerOp,
			});
		}
	}

	/**
	 * Get warning for a specific benchmark
	 */
	getWarning(benchmarkName) {
		return this.#warnings.get(benchmarkName);
	}

	/**
	 * Get all warnings
	 */
	getAllWarnings() {
		return Array.from(this.#warnings.entries()).map(([name, data]) => ({
			name,
			...data,
		}));
	}

	/**
	 * Check if a benchmark has a warning
	 */
	hasWarning(benchmarkName) {
		return this.#warnings.has(benchmarkName);
	}

	/**
	 * Emit warnings to console
	 */
	emitWarnings() {
		if (this.#warnings.size === 0) {
			return;
		}

		console.log("\n⚠️  Dead Code Elimination Warnings:");
		console.log(
			"The following benchmarks may have been optimized away by the JIT compiler:\n",
		);

		for (const [name, data] of this.#warnings.entries()) {
			console.log(`  • ${name}`);
			console.log(`    Benchmark: ${timer.format(data.timePerOp)}/iter`);
			console.log(`    Baseline:  ${timer.format(data.baselineTime)}/iter`);
			console.log(`    Ratio:     ${data.ratio.toFixed(2)}x of baseline`);
			console.log(
				"    Suggestion: Ensure the result is used or assign to a variable\n",
			);
		}

		console.log(
			"ℹ️  These benchmarks are running nearly as fast as an empty function,",
		);
		console.log(
			"   which suggests the JIT may have eliminated the actual work.\n",
		);
	}

	toString() {
		return "DeadCodeEliminationDetectionPlugin";
	}

	reset() {
		// Don't reset - we want to accumulate warnings across all benchmarks
		// They will be emitted once at the end of the suite run
	}
}

module.exports = {
	DeadCodeEliminationDetectionPlugin,
};
