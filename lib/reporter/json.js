const { summarize } = require("../utils/analyze");

/**
 * Outputs JSON formatted results the console
 * @param {BenchmarkResult[]} results - Array of benchmark results
 */

function jsonReport(results) {
	process.stdout.write(toJSON(results));
}

/**
 * Outputs JSON formatted results as a string
 * @param {BenchmarkResult[]} results - Array of benchmark results
 * @returns {string}
 */
function toJSON(results) {
	const output = summarize(results).map((result) => ({
		name: result.name,
		runsSampled: result.runsSampled,
		min: result.minFormatted,
		max: result.maxFormatted,
		plugins: result.plugins.map((p) => p.report).filter(Boolean),
		opsSec: result.opsSec,
		totalTime: result.totalTime,
		totalTimeFormatted: result.totalTimeFormatted,
	}));

	return JSON.stringify(output, null, 2);
}

module.exports = {
	jsonReport,
	toJSON,
};
