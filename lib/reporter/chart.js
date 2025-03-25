const { platform, arch, cpus, totalmem } = require("node:os");
const { styleText } = require("../utils/styleText");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

/**
 * Draws a bar chart representation of a benchmark result
 * @param {string} label - The label for the bar (benchmark name)
 * @param {number} value - The value to display (operations per second)
 * @param {number} total - The maximum value in the dataset (for scaling)
 * @param {number} samples - Number of samples collected
 * @param {number} [length=30] - Length of the bar in characters
 */
function drawBar(label, value, total, samples, length = 30) {
	const percentage = value / total;
	const filledLength = Math.round(length * percentage);
	const bar = "█".repeat(filledLength) + "-".repeat(length - filledLength);

	const opsSecReported = value < 100 ? value.toFixed(2) : value.toFixed(0);
	const displayedOpsSec = styleText(
		["yellow"],
		formatter.format(opsSecReported),
	);
	const displayedSamples = styleText(["yellow"], samples.toString());

	process.stdout.write(
		`${label.padEnd(45)} | ${bar} | ${displayedOpsSec} ops/sec | ${displayedSamples} samples\n`,
	);
}

const environment = {
	nodeVersion: `Node.js version: ${process.version}`,
	platform: `${platform()} ${arch()}`,
	hardware: `${cpus().length} vCPUs | ${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem`,
};

/**
 * Generates a chart visualization of benchmark results in the console
 * Displays system information and a bar chart of operations per second
 * @param {import('../report').BenchmarkResult[]} results - Array of benchmark results
 */
function chartReport(results) {
	const maxOpsSec = Math.max(...results.map((b) => b.opsSec));

	process.stdout.write(
		`${environment.nodeVersion}\n` +
			`Platform: ${environment.platform}\n` +
			`CPU Cores: ${environment.hardware}\n\n`,
	);

	for (const result of results) {
		drawBar(result.name, result.opsSec, maxOpsSec, result.histogram.samples);
	}
}

module.exports = {
	chartReport,
};
