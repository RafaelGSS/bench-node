const { timer } = require('./clock');

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

function reportConsoleBench(bench, result) {
  const opsSecReported = result.opsSec < 100 ?
    (result.opsSec, 2).toFixed() :
    (result.opsSec, 0).toFixed();

  process.stdout.write(bench.name);
  process.stdout.write(' x ');
  process.stdout.write(`${ formatter.format(opsSecReported) } ops/sec +/- `);
  process.stdout.write(formatter.format(
    (result.histogram.cv, 2).toFixed()),
  );
  process.stdout.write(`% (${ result.histogram.samples.length } runs sampled) `);

  for (const enricher of bench.enrichers) {
    if (typeof enricher.getReport === 'function')
      process.stdout.write(`${ enricher.getReport() } `);
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
