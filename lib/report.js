const { timer } = require('./clock');

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

function reportConsoleBench(bench, result) {
  const opsSecReported = result.opsSec < 100 ?
    result.opsSec.toFixed(2) :
    result.opsSec.toFixed(0);

  process.stdout.write(bench.name);
  process.stdout.write(' x ');
  process.stdout.write(`${ formatter.format(opsSecReported) } ops/sec`);
  // TODO: produce confidence on stddev
  // process.stdout.write(result.histogram.stddev.toString());
  process.stdout.write(` (${ result.histogram.samples.length } runs sampled) `);

  for (const p of bench.plugins) {
    if (typeof p.getReport === 'function')
      process.stdout.write(`${p.getReport()} `);
  }

  process.stdout.write('min..max=(');
  process.stdout.write(timer.format(result.histogram.min));
  process.stdout.write(' ... ');
  process.stdout.write(timer.format(result.histogram.max));
  process.stdout.write(') p75=');
  process.stdout.write(timer.format(result.histogram.percentile(75)));
  process.stdout.write(' p99=');
  process.stdout.write(timer.format(result.histogram.percentile(99)));
  process.stdout.write('\n');
}

module.exports = {
  reportConsoleBench,
};
