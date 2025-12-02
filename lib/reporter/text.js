const { styleText } = require("../utils/styleText");
const { analyze, summarize } = require("../utils/analyze.js");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

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
	const ttest = options?.ttest ?? false;

	let text = "";

	if (ttest) {
		text += styleText("cyan", "T-Test Mode: Enabled (repeatSuite=30)\n\n");
	}

	for (const result of summary) {
		text += result.name.padEnd(options.labelWidth ?? 45);
		text += " x ";

		if (result.opsSec !== undefined) {
			text += styleText(
				["blue", "bold"],
				`${formatter.format(result.opsSec)} ops/sec`,
			);
		} else if (result.totalTime !== undefined) {
			text += styleText(["blue", "bold"], `${result.timeFormatted} total time`);
		}

		// TODO: produce confidence on stddev
		text += ` (${result.runsSampled} runs sampled) `;

		for (const p of result.plugins) {
			if (p.report) {
				text += styleText("dim", `${p.report} `);
			}
		}

		text += "min..max=(";
		text += styleText("green", result.minFormatted);
		text += styleText("dim", "...");
		text += styleText("red", result.maxFormatted);
		text += ")\n";
	}

	const baselineResult = results.find((result) => result.baseline);

	if (baselineResult) {
		text += styleText("bold", "\nSummary (vs. baseline):\n");

		const sortedResults = analyze(results, true, {
			ttest,
			alpha: options?.alpha ?? 0.05,
		});
		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name.padEnd(maxNameLength)}  `;
			text += namePart;

			if (result.baseline) {
				text += styleText("magenta", "(baseline)");
			} else if (result.comparison !== undefined) {
				const isSignificant = result.significanceTest?.significant ?? true;
				const isFaster = !result.comparison.startsWith("-");
				const comparisonText = isFaster
					? `(${result.comparison}x faster)`
					: `(${result.comparison.slice(1)}x slower)`;

				if (isSignificant) {
					text += styleText(isFaster ? "green" : "red", comparisonText);
				} else {
					text += styleText("dim", comparisonText);
				}

				if (result.significanceTest) {
					const sig = result.significanceTest;
					if (sig.stars) {
						text += styleText("cyan", ` ${sig.stars}`);
					}
				}
			}

			text += "\n";
		}

		if (ttest) {
			text += styleText(
				"dim",
				"\n  Significance: * p<0.05, ** p<0.01, *** p<0.001\n",
			);
		}
	}

	return text;
}

module.exports = {
	textReport,
	toText,
};
