const { platform, arch, availableParallelism, totalmem } = require("node:os");
const { styleText } = require("../utils/styleText");
const { analyze } = require("../utils/analyze.js");

/**
 * Draws a bar chart representation of a benchmark result
 * @param {string} label - The label for the bar (benchmark name)
 * @param {number} value - The value to display (operations per second or time per operation)
 * @param {number} total - The maximum value in the dataset (for scaling)
 * @param {number} samples - Number of samples collected
 * @param {string} metric - The metric being displayed (opsSec or totalTime)
 * @param {string} [comment=""] - optional additional comment
 * @param {number} [length=25] - Length of the bar in characters
 */
function drawBar(
	label,
	value,
	total,
	samples,
	metric,
	comment = "",
	length = 25,
) {
	let percentage;
	let displayedValue;
	let displayedMetric;

	if (metric === "opsSec") {
		percentage = value / total; // Higher ops/sec is better
		const valueReported = value < 100 ? value.toFixed(2) : value.toFixed(0);
		displayedValue = styleText(["yellow"], formatter.format(valueReported));
		displayedMetric = "ops/sec";
	} else {
		// metric === 'totalTime'
		percentage = 1 - value / total; // Lower totalTime is better, invert percentage
		let timeFormatted;
		if (value < 0.000001) {
			// Less than 1 microsecond, show in nanoseconds
			timeFormatted = `${(value * 1000000000).toFixed(2)} ns`;
		} else if (value < 0.001) {
			// Less than 1 millisecond, show in microseconds
			timeFormatted = `${(value * 1000000).toFixed(2)} µs`;
		} else if (value < 1) {
			// Less than 1 second, show in milliseconds
			timeFormatted = `${(value * 1000).toFixed(2)} ms`;
		} else {
			// 1 second or more, show in seconds
			timeFormatted = `${value.toFixed(2)} s`;
		}
		displayedValue = styleText(["yellow"], timeFormatted);
		displayedMetric = "total time";
	}

	const ratio = length * percentage;
	const filledLength = Math.floor(ratio);
	const fraction = ratio % 1;

	let partial = "";

	if (fraction >= 0.5) {
		partial = "▌";
	}

	const bar =
		"█".repeat(filledLength) +
		partial +
		"─".repeat(length - filledLength - partial.length);

	const displayedSamples = `${styleText(["yellow"], samples.toString().padStart(2))} samples`;
	const line = `${label} | ${bar} | ${displayedValue} ${displayedMetric} | ${displayedSamples} ${comment}\n`;

	process.stdout.write(line);
}

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

const timer = Intl.NumberFormat(undefined, {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

const environment = {
	nodeVersion: `Node.js version: ${process.version}`,
	platform: `${platform()} ${arch()}`,
	hardware: `${availableParallelism()} vCPUs | ${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem`,
};

/**
 * Generates a chart visualization of benchmark results in the console
 * Displays system information and a bar chart of operations per second or time per operation
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 * @param options {object} layout options
 */
function chartReport(results, options = {}) {
	// Determine the primary metric and calculate max value for scaling
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	const maxValue = Math.max(...results.map((b) => b[primaryMetric]));

	if (options.printHeader) {
		process.stdout.write(
			`${environment.nodeVersion}\n` +
				`Platform: ${environment.platform}\n` +
				`CPU Cores: ${environment.hardware}\n\n`,
		);
	}

	const hasBaseline = results.find((result) => result.baseline) !== undefined;

	results = analyze(results, false);

	if (hasBaseline) {
		process.stdout.write(styleText("bold", "\nSummary (vs. baseline):\n"));
	}

	for (const result of results) {
		let comment = "";

		if (hasBaseline) {
			if (result.baseline) {
				comment = styleText("magenta", "(baseline)");
			} else if (result.comparison.startsWith("-")) {
				comment = styleText("red", `(${result.comparison.slice(1)}x slower)`);
			} else {
				comment = styleText("green", `(${result.comparison}x faster)`);
			}
		}

		const columnWidth = options.labelWidth ?? 45;

		drawBar(
			result.name.padEnd(columnWidth),
			result[primaryMetric],
			maxValue,
			result.histogram.samples,
			primaryMetric,
			comment,
		);
	}
}

module.exports = {
	chartReport,
};
