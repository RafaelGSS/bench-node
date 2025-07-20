function analyze(results, sorted = true) {
  const baselineResult = results.find((result) => result.baseline);

  const output = [...results];

  if (baselineResult?.opsSec === undefined) {
    return output;
  }

  if (sorted) {
    output.sort((a, b) => {
      if (a.baseline) return -1;
      if (b.baseline) return 1;
      return (a.opsSec || 0) - (b.opsSec || 0);
    });
  }

  const baselineHz = baselineResult.opsSec;

  for (const result of output) {
    if (!result.baseline && result.opsSec !== undefined) {
      const benchmarkHz = result.opsSec;

      if (benchmarkHz > baselineHz) {
        result.timesFaster = (benchmarkHz / baselineHz).toFixed(2);
      } else {
        result.timesSlower = (baselineHz / benchmarkHz).toFixed(2);
      }
    }
  }

  return output;
}

module.exports = {
  analyze,
};
