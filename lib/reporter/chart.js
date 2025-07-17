const { platform, arch, cpus, totalmem } = require("node:os");
const { styleText } = require("../utils/styleText");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

const timer = Intl.NumberFormat(undefined, {
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

/**
 * Draws a bar chart representation of a benchmark result
 * @param {string} label - The label for the bar (benchmark name)
 * @param {number} value - The value to display (operations per second or time per operation)
 * @param {number} total - The maximum value in the dataset (for scaling)
 * @param {number} samples - Number of samples collected
 * @param {string} metric - The metric being displayed (opsSec or totalTime)
 * @param {number} [length=30] - Length of the bar in characters
 */
function drawBar(label, value, total, samples, metric, length = 30) {
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

	const filledLength = Math.round(length * percentage);
	const bar = "█".repeat(filledLength) + "-".repeat(length - filledLength);

	const displayedSamples = styleText(["yellow"], samples.toString());

	process.stdout.write(
		`${label.padEnd(45)} | ${bar} | ${displayedValue} ${displayedMetric} | ${displayedSamples} samples\n`,
	);
}

const environment = {
	nodeVersion: `Node.js version: ${process.version}`,
	platform: `${platform()} ${arch()}`,
	hardware: `${cpus().length} vCPUs | ${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem`,
};

/**
 * Generates a chart visualization of benchmark results in the console
 * Displays system information and a bar chart of operations per second or time per operation
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 */
function chartReport(results) {
	// Determine the primary metric and calculate max value for scaling
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	const maxValue = Math.max(...results.map((b) => b[primaryMetric]));

  if (header) {
		process.stdout.write(
				`${environment.nodeVersion}\n` +
				`Platform: ${environment.platform}\n` +
				`CPU Cores: ${environment.hardware}\n\n`,
		);
	}

	for (const result of results) {
		drawBar(
			result.name,
			result[primaryMetric],
			maxValue,
			result.histogram.samples,
			primaryMetric,
		);
	}
}

module.exports = {
	chartReport,
};
