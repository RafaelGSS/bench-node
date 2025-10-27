const { summarize } = require("../utils/analyze");

function jsonReport(results) {
	const output = summarize(results).map((result) => ({
		name: result.name,
		runsSampled: result.runsSampled,
		min: result.minFormatted,
		max: result.maxFormatted,
		plugins: result.plugins.map((p) => p.report).filter(Boolean),
		opsSec: result.opsSec,
		totalTime: result.totalTime,
		totalTimeFormatted: result.totalTimeFormatted,
	}));

	console.log(JSON.stringify(output, null, 2));
}

module.exports = {
	jsonReport,
};
