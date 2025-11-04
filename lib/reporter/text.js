const { styleText } = require("../utils/styleText");
const { analyze, summarize } = require("../utils/analyze.js");

/**
 * Generates a text report of benchmark results, displaying each benchmark's name,
 * operations per second, number of samples, plugin results, and min/max timings
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 * @param options {object} layout options
 */
function textReport(results, options = {}) {
	process.stdout.write(toText(results, options));
}

function toText(results, options = {}) {
	const summary = summarize(results);

	let text = "";

	for (const result of summary) {
		text += result.name.padEnd(options.labelWidth ?? 45);
		text += " x ";

		if (result.opsSec !== undefined) {
			text += styleText(["blue", "bold"], `${result.opsSec} ops/sec`);
		} else if (result.totalTime !== undefined) {
			text += styleText(["blue", "bold"], `${result.timeFormatted} total time`);
		}

		// TODO: produce confidence on stddev
		// process.stdout.write(result.histogram.stddev.toString());
		text += ` (${result.samples} runs sampled) `;

		for (const p of result.plugins) {
			if (p.report) {
				text += styleText("dim", `${p.report} `);
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
		text += styleText("bold", "\nSummary (vs. baseline):\n");

		const sortedResults = analyze(results);
		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name.padEnd(maxNameLength)}  `;
			text += namePart;

			if (result.baseline) {
				text += styleText("magenta", "(baseline)");
			} else if (result.comparison !== undefined) {
				if (!result.comparison.startsWith("-")) {
					text += styleText("green", `(${result.comparison}x faster)`);
				} else {
					text += styleText("red", `(${result.comparison.slice(1)}x slower)`);
				}
			}

			text += "\n";
		}
	}

	return text;
}

module.exports = {
	textReport,
	toText,
};
