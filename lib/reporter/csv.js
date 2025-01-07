const { format } = require("@fast-csv/format");

const { timer } = require("../clock");

const formatter = Intl.NumberFormat(undefined, {
  notation: "standard",
  maximumFractionDigits: 2,
});

function csvReport(results) {
  const stream = format();
  stream.pipe(process.stdout);

  stream.write(["name", "ops/sec", "samples", "plugins", "min", "max"]);

  for (const result of results) {
    const opsSecReported =
      result.opsSec < 100 ? result.opsSec.toFixed(2) : result.opsSec.toFixed(0);

    stream.write([
      result.name,
      formatter.format(opsSecReported),
      result.histogram.samples,
      result.plugins
        .filter((p) => p.report)
        .map((p) => p.report)
        .join(","),
      timer.format(result.histogram.min),
      timer.format(result.histogram.max),
    ]);
  }
}

module.exports = {
  csvReport,
};
