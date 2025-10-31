const { summarize } = require("../utils/analyze");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

function csvReport(results) {
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	const header = `name,${primaryMetric === "opsSec" ? "ops/sec" : "total time"},samples,plugins,min,max\n`;
	process.stdout.write(header);

	const output = summarize(results);

	for (const entry of output) {
		process.stdout.write(`${entry.name},`);

		if (primaryMetric === "opsSec") {
			process.stdout.write(`"${formatter.format(entry.opsSec)}",`);
		} else {
			process.stdout.write(`${entry.totalTimeFormatted},`);
		}

		process.stdout.write(`${entry.runsSampled},`);
		process.stdout.write(`"${entry.plugins.join(",")}",`);

		// For test compatibility, format min/max in microseconds
		const minInUs = entry.min / 1000;
		const maxInUs = entry.max / 1000;
		process.stdout.write(`${minInUs.toFixed(2)}us,`);
		process.stdout.write(`${maxInUs.toFixed(2)}us\n`);
	}
}

module.exports = {
	csvReport,
};
