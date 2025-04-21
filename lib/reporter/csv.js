const { timer } = require("../clock");

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

// Helper function to format time with appropriate unit for CSV
const formatTimeForCSV = (time) => {
	if (time < 0.000001) {
		return `${(time * 1000000000).toFixed(2)} ns`;
	} else if (time < 0.001) {
		return `${(time * 1000000).toFixed(2)} µs`;
	} else if (time < 1) {
		return `${(time * 1000).toFixed(2)} ms`;
	} else {
		return `${time.toFixed(2)} s`;
	}
};

function csvReport(results) {
	const primaryMetric =
		results[0]?.opsSec !== undefined ? "opsSec" : "totalTime";
	const header = `name,${primaryMetric === "opsSec" ? "ops/sec" : "total time"},samples,plugins,min,max\n`;
	process.stdout.write(header);

	for (const result of results) {
		process.stdout.write(`${result.name},`);

		if (primaryMetric === "opsSec") {
			const opsSecReported =
				result.opsSec < 100
					? result.opsSec.toFixed(2)
					: result.opsSec.toFixed(0);
			process.stdout.write(`"${formatter.format(opsSecReported)}",`);
		} else {
			// primaryMetric === 'totalTime'
			process.stdout.write(`"${formatTimeForCSV(result.totalTime)}",`);
		}

		process.stdout.write(`${result.histogram.samples},`);

		process.stdout.write(
			`"${result.plugins
				.filter((p) => p.report)
				.map((p) => p.report)
				.join(",")}",`,
		);

		// For test compatibility, format min/max in microseconds
		const minInUs = result.histogram.min / 1000;
		const maxInUs = result.histogram.max / 1000;
		process.stdout.write(`${minInUs.toFixed(2)}us,`);
		process.stdout.write(`${maxInUs.toFixed(2)}us\n`);
	}
}

module.exports = {
	csvReport,
};
