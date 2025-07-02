const { styleText } = require("../utils/styleText");
const { timer } = require("../clock");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

/**
 * Generates a text report of benchmark results, displaying each benchmark's name,
 * operations per second, number of samples, plugin results, and min/max timings
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 */
function textReport(results) {
	for (const result of results) {
		process.stdout.write(result.name.padEnd(45));
		process.stdout.write(" x ");

		if (result.opsSec !== undefined) {
			const opsSecReported =
				result.opsSec < 100
					? result.opsSec.toFixed(2)
					: result.opsSec.toFixed(0);
			process.stdout.write(
				styleText(
					["cyan", "bold"],
					`${formatter.format(opsSecReported)} ops/sec`,
				),
			);
		} else if (result.totalTime !== undefined) {
			// Format time based on magnitude:
			// - < 0.000001 seconds (< 1 µs): show in nanoseconds
			// - < 0.001 seconds (< 1 ms): show in microseconds
			// - < 1 second: show in milliseconds
			// - >= 1 second: show in seconds
			let timeFormatted;
			if (result.totalTime < 0.000001) {
				// Less than 1 microsecond, show in nanoseconds
				timeFormatted = `${(result.totalTime * 1000000000).toFixed(2)} ns`;
			} else if (result.totalTime < 0.001) {
				// Less than 1 millisecond, show in microseconds
				timeFormatted = `${(result.totalTime * 1000000).toFixed(2)} µs`;
			} else if (result.totalTime < 1) {
				// Less than 1 second, show in milliseconds
				timeFormatted = `${(result.totalTime * 1000).toFixed(2)} ms`;
			} else {
				// 1 second or more, show in seconds
				timeFormatted = `${result.totalTime.toFixed(2)} s`;
			}

			process.stdout.write(
				styleText(["cyan", "bold"], `${timeFormatted} total time`),
			);
		}

		// TODO: produce confidence on stddev
		// process.stdout.write(result.histogram.stddev.toString());
		process.stdout.write(` (${result.histogram.samples} runs sampled) `);

		for (const p of result.plugins) {
			if (p.report) {
				process.stdout.write(styleText("dim", `${p.report} `));
			}
		}

		process.stdout.write("min..max=(");
		process.stdout.write(
			styleText("green", timer.format(result.histogram.min)),
		);
		process.stdout.write(styleText("dim", "..."));
		process.stdout.write(
			styleText("red", `${timer.format(result.histogram.max)})`),
		);
		process.stdout.write("\n");
	}

	const baselineResult = results.find((result) => result.baseline);

	if (baselineResult) {
		process.stdout.write(styleText("bold", "\nSummary (vs. baseline):\n"));

		const sortedResults = [...results].sort((a, b) => {
			if (a.baseline) return -1;
			if (b.baseline) return 1;
			return (a.opsSec || 0) - (b.opsSec || 0);
		});

		const maxNameLength = Math.max(...sortedResults.map((r) => r.name.length));

		for (const result of sortedResults) {
			const namePart = `  ${result.name}`;
			process.stdout.write(namePart);

			const padding = maxNameLength - result.name.length + 2;
			process.stdout.write(" ".repeat(padding));

			if (result.baseline) {
				process.stdout.write(styleText("magenta", "(baseline)"));
			} else if (
				baselineResult.opsSec !== undefined &&
				result.opsSec !== undefined
			) {
				const baselineHz = baselineResult.opsSec;
				const benchmarkHz = result.opsSec;
				let comparisonText;

				if (benchmarkHz > baselineHz) {
					const timesFaster = (benchmarkHz / baselineHz).toFixed(2);
					comparisonText = styleText("green", `(${timesFaster}x faster)`);
				} else {
					const timesSlower = (baselineHz / benchmarkHz).toFixed(2);
					comparisonText = styleText("red", `(${timesSlower}x slower)`);
				}
				process.stdout.write(comparisonText);
			}
			process.stdout.write("\n");
		}
	}
}

module.exports = {
	textReport,
};
