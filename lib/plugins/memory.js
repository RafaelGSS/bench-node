const { StatisticalHistogram } = require("../histogram");

/**
 * Formats a byte value into a human-readable string with appropriate units (B, Kb, MB, GB)
 * @param {number} bytes - The number of bytes to format
 * @returns {string} Formatted string with appropriate unit suffix
 */
function formatBytes(bytes) {
	if (bytes < 1024) return `${Math.round(bytes)}B`;

	const kbytes = bytes / 1024;
	if (kbytes < 1024) return `${kbytes.toFixed(2)}Kb`;

	const mbytes = kbytes / 1024;
	if (mbytes < 1024) return `${mbytes.toFixed(2)}MB`;

	const gbytes = mbytes / 1024;
	return `${gbytes.toFixed(2)}GB`;
}

/**
 * Plugin that measures memory usage during benchmark execution
 * Collects heap usage statistics and provides reporting capabilities
 */
class MemoryPlugin {
	static MEMORY_BEFORE_RUN = "memoryBeforeRun";
	static MEMORY_AFTER_RUN = "memoryAfterRun";
	static #WARNING_REPORTED = false;

	/**
	 * @type {StatisticalHistogram}
	 */
	#heapUsedHistogram = new StatisticalHistogram();

	isSupported() {
		return typeof globalThis.gc === "function";
	}

	beforeClockTemplate({ managed, context }) {
		if (managed && !MemoryPlugin.#WARNING_REPORTED) {
			MemoryPlugin.#WARNING_REPORTED = true;
			process.emitWarning(
				"The memory statistics can be inaccurate since it will include the tear-up and teardown of your benchmark.",
			);
		}

		let code = "";

		code += `${context}.${MemoryPlugin.MEMORY_BEFORE_RUN} = 0;\n`;
		code += `${context}.${MemoryPlugin.MEMORY_AFTER_RUN} = 0;\n`;
		code += "globalThis.gc();\n";
		code += `${context}.${MemoryPlugin.MEMORY_BEFORE_RUN} = globalThis.process.memoryUsage();\n`;

		return [code];
	}

	afterClockTemplate({ context }) {
		return [
			`${context}.${MemoryPlugin.MEMORY_AFTER_RUN} = globalThis.process.memoryUsage();\n`,
		];
	}

	onCompleteBenchmark([, realIterations, context]) {
		const heapUsed =
			context[MemoryPlugin.MEMORY_AFTER_RUN].heapUsed -
			context[MemoryPlugin.MEMORY_BEFORE_RUN].heapUsed;
		const externalUsed =
			context[MemoryPlugin.MEMORY_AFTER_RUN].external -
			context[MemoryPlugin.MEMORY_BEFORE_RUN].external;

		const memoryAllocated = (heapUsed + externalUsed) / realIterations;

		// below 0, we just coerce to be zero
		this.#heapUsedHistogram.record(Math.max(0, memoryAllocated));
	}

	toString() {
		return "MemoryPlugin";
	}

	getReport() {
		this.#heapUsedHistogram.finish();

		return `heap usage=${formatBytes(this.#heapUsedHistogram.mean)} (${formatBytes(this.#heapUsedHistogram.min)} ... ${formatBytes(this.#heapUsedHistogram.max)})`;
	}

	getResult() {
		return {
			proto: null,
			type: this.toString(),
			histogram: this.#heapUsedHistogram,
		};
	}

	reset() {
		this.#heapUsedHistogram = new StatisticalHistogram();
	}
}

module.exports = {
	MemoryPlugin,
};
