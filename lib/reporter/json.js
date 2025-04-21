const { timer } = require("../clock");

// Helper function to format time in appropriate units
const formatTime = (time) => {
	if (time < 0.000001) {
		// Less than 1 microsecond, show in nanoseconds
		return `${(time * 1000000000).toFixed(2)} ns`;
	} else if (time < 0.001) {
		// Less than 1 millisecond, show in microseconds
		return `${(time * 1000000).toFixed(2)} µs`;
	} else if (time < 1) {
		// Less than 1 second, show in milliseconds
		return `${(time * 1000).toFixed(2)} ms`;
	} else {
		// 1 second or more, show in seconds
		return `${time.toFixed(2)} s`;
	}
};

function jsonReport(results) {
	const output = results.map((result) => {
		const baseResult = {
			name: result.name,
			runsSampled: result.histogram.samples,
			min: timer.format(result.histogram.min),
			max: timer.format(result.histogram.max),
			// Report anything the plugins returned
			plugins: result.plugins.map((p) => p.report).filter(Boolean),
		};

		if (result.opsSec !== undefined) {
			const opsSecReported =
				result.opsSec < 100
					? result.opsSec.toFixed(2)
					: result.opsSec.toFixed(0);
			baseResult.opsSec = Number(opsSecReported);
		} else if (result.totalTime !== undefined) {
			baseResult.totalTime = result.totalTime; // Total time in seconds
			baseResult.totalTimeFormatted = formatTime(result.totalTime);
		}

		return baseResult;
	});

	console.log(JSON.stringify(output, null, 2));
}

module.exports = {
	jsonReport,
};
