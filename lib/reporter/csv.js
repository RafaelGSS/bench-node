const { summarize } = require("../utils/analyze");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

/**
 * Outputs JSON formatted results the console
 * @param {BenchmarkResult[]} results - Array of benchmark results
 */
function csvReport(results) {
	process.stdout.write(toCSV(results));
}

/**
 * Outputs CSV formatted results as a string
 * @param {BenchmarkResult[]} results - Array of benchmark results
 * @returns {string}
 */
function toCSV(results) {
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	let text = `name,${primaryMetric === "opsSec" ? "ops/sec" : "total time"},samples,plugins,min,max\n`;

	const output = summarize(results);

	for (const entry of output) {
		text += `${entry.name},`;

		if (primaryMetric === "opsSec") {
			text += `"${formatter.format(entry.opsSec)}",`;
		} else {
			text += `${entry.totalTimeFormatted},`;
		}

		text += `${entry.runsSampled},`;
		text += `"${entry.plugins.join(",")}",`;

		// For test compatibility, format min/max in microseconds
		const minInUs = entry.min / 1000;
		const maxInUs = entry.max / 1000;
		text += `${minInUs.toFixed(2)}us,`;
		text += `${maxInUs.toFixed(2)}us\n`;
	}

	return text;
}

module.exports = {
	csvReport,
	toCSV,
};
