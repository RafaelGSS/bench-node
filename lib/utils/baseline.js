function analyze(results) {
  const baselineResult = results.find((result) => result.baseline);

  if (baselineResult === undefined) {
    return;
  }

  const sortedResults = [...results].sort((a, b) => {
    if (a.baseline) return -1;
    if (b.baseline) return 1;
    return (a.opsSec || 0) - (b.opsSec || 0);
  });

  if (baselineResult.opsSec === undefined) {
    return sortedResults;
  }

  const baselineHz = baselineResult.opsSec;

  for (const result of sortedResults) {
    if (!result.baseline && result.opsSec !== undefined) {
      const benchmarkHz = result.opsSec;

      if (benchmarkHz > baselineHz) {
        result.timesFaster = (benchmarkHz / baselineHz).toFixed(2);
      } else {
        result.timesSlower = (baselineHz / benchmarkHz).toFixed(2);
      }
    }
  }

  return sortedResults;
}

module.exports = {
  analyze,
};
