function analyze(results, sorted = true) {
	const baselineResult = results.find((result) => result.baseline);

	const output = [...results];

	if (baselineResult?.opsSec === undefined) {
		return output;
	}

	const baselineHz = baselineResult.opsSec;
	let min = Number.MAX_SAFE_INTEGER;
	let max = Number.MIN_SAFE_INTEGER;

	let fastest, slowest;

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

module.exports = {
	analyze,
};
