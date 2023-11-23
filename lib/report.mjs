import { NumberPrototypeToFixed } from './primordials.mjs';
import { timer } from './clock.mjs';

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

export function reportConsoleBench(bench, result) {
  const opsSecReported = result.opsSec < 100 ?
    NumberPrototypeToFixed(result.opsSec, 2) :
    NumberPrototypeToFixed(result.opsSec, 0);

  process.stdout.write(bench.name);
  process.stdout.write(' x ');
  process.stdout.write(`${formatter.format(opsSecReported)} ops/sec +/- `);
  process.stdout.write(formatter.format(
    NumberPrototypeToFixed(result.histogram.cv, 2)),
  );
  process.stdout.write(`% (${result.histogram.samples.length} runs sampled) `);

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
