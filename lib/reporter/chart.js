const { platform, arch, cpus, totalmem } = require("node:os");
const { styleText } = require("../utils/styleText");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

function drawBar(label, value, total, samples, length = 30) {
	const percentage = value / total;
	const filledLength = Math.round(length * percentage);
	const bar = "█".repeat(filledLength) + "-".repeat(length - filledLength);

	const opsSecReported = value < 100 ? value.toFixed(2) : value.toFixed(0);
	const displayedOpsSec =
		styleText(["yellow"], formatter.format(opsSecReported)) +
		styleText(["reset"], "");
	const displayedSamples =
		styleText(["yellow"], samples) + styleText(["reset"], "");

	process.stdout.write(
		`${label.padEnd(45)} | ${bar} | ${displayedOpsSec} ops/sec ${"".padEnd(displayedOpsSec.length)} | ${displayedSamples} samples\n`,
	);
}

const environment = {
	platform: `${platform()} ${arch()}`,
	hardware: `${cpus().length} vCPUs | ${(totalmem() / 1024 ** 3).toFixed(1)}GB Mem`,
};

function chartReport(results) {
	const maxOpsSec = Math.max(...results.map((b) => b.opsSec));

	process.stdout.write(
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
