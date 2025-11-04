const { styleText } = require("../utils/styleText");
const { analyze } = require("../utils/analyze.js");
const { summarize } = require("../utils/analyze");

/**
 * Generates a text report of benchmark results, displaying each benchmark's name,
 * operations per second, number of samples, plugin results, and min/max timings
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 * @param options {object} layout options
 */
function textReport(results, options = {}) {
	const summary = summarize(results);

	for (const result of summary) {
		process.stdout.write(result.name.padEnd(options.labelWidth ?? 45));
		process.stdout.write(" x ");

		if (result.opsSec !== undefined) {
			process.stdout.write(
				styleText(["blue", "bold"], `${result.opsSec} ops/sec`),
			);
		} else if (result.totalTime !== undefined) {
			process.stdout.write(
				styleText(["blue", "bold"], `${result.timeFormatted} total time`),
			);
		}

		// TODO: produce confidence on stddev
		// process.stdout.write(result.histogram.stddev.toString());
		process.stdout.write(` (${result.samples} runs sampled) `);

		for (const p of result.plugins) {
			if (p.report) {
				process.stdout.write(styleText("dim", `${p.report} `));
			}
		}

		process.stdout.write("min..max=(");
		process.stdout.write(styleText("green", result.minFormatted));
		process.stdout.write(styleText("dim", "..."));
		process.stdout.write(styleText("red", result.maxFormatted));
		process.stdout.write(")\n");
	}

	const baselineResult = results.find((result) => result.baseline);

	if (baselineResult) {
		process.stdout.write(styleText("bold", "\nSummary (vs. baseline):\n"));

		const sortedResults = analyze(results);
		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name.padEnd(maxNameLength)}  `;
			process.stdout.write(namePart);

			if (result.baseline) {
				process.stdout.write(styleText("magenta", "(baseline)"));
			} else if (result.comparison !== undefined) {
				if (!result.comparison.startsWith("-")) {
					process.stdout.write(
						styleText("green", `(${result.comparison}x faster)`),
					);
				} else {
					process.stdout.write(
						styleText("red", `(${result.comparison.slice(1)}x slower)`),
					);
				}
			}

			process.stdout.write("\n");
		}
	}
}

module.exports = {
	textReport,
};
