const { timer } = require("../clock");

function analyze(results, sorted = true) {
	const baselineResult = results.find((result) => result.baseline);

	const output = [...results];

	if (baselineResult?.opsSec === undefined) {
		return output;
	}

	const baselineHz = baselineResult.opsSec;
	let min = Number.MAX_SAFE_INTEGER;
	let max = Number.MIN_SAFE_INTEGER;

	let fastest;
	let slowest;

	for (const result of output) {
		const benchmarkHz = result.opsSec;

		if (benchmarkHz === undefined) {
			continue;
		}

		if (benchmarkHz > max) {
			max = benchmarkHz;
			fastest = result;
		}

		if (benchmarkHz < min) {
			min = benchmarkHz;
			slowest = result;
		}

		if (!result.baseline) {
			if (benchmarkHz > baselineHz) {
				result.comparison = (benchmarkHz / baselineHz).toFixed(2);
			} else {
				result.comparison = `-${(baselineHz / benchmarkHz).toFixed(2)}`;
			}
		}
	}

	if (fastest !== undefined) {
		fastest.fastest = true;
	}

	if (slowest !== undefined) {
		slowest.slowest = true;
	}

	if (sorted) {
		output.sort((a, b) => {
			if (a.baseline) return -1;
			if (b.baseline) return 1;
			return (a.opsSec || 0) - (b.opsSec || 0);
		});
	}

	return output;
}

const formatter = Intl.NumberFormat(undefined, {
	notation: "standard",
	maximumFractionDigits: 2,
});

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

function summarize(results) {
	return results.map((result) => {
		const baseResult = {
			name: result.name,
			runsSampled: result.histogram.samples,
			min: result.histogram.min,
			max: result.histogram.max,
			minFormatted: timer.format(result.histogram.min), // Use timer for ns format
			maxFormatted: timer.format(result.histogram.max),
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
}

module.exports = {
	analyze,
	summarize,
};
