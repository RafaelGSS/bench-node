const { timer } = require("../clock");

function jsonReport(results) {
	const output = results.map((result) => {
		const opsSecReported =
			result.opsSec < 100 ? result.opsSec.toFixed(2) : result.opsSec.toFixed(0);

		return {
			name: result.name,
			opsSec: Number(opsSecReported),
			runsSampled: result.histogram.samples,
			min: timer.format(result.histogram.min),
			max: timer.format(result.histogram.max),
			// Report anything the plugins returned
			plugins: result.plugins.map((p) => p.report).filter(Boolean),
		};
	});

	console.log(JSON.stringify(output, null, 2));
}

module.exports = {
	jsonReport,
};
