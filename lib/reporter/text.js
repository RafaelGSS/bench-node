const util = require('node:util');

const styleText =
  typeof util.styleText === 'function' ?
    util.styleText
  : (_style, text) => text;

const { timer } = require('../clock');

const formatter = Intl.NumberFormat(undefined, {
  notation: 'standard',
  maximumFractionDigits: 2,
});

function textReport(results) {
  for (const result of results) {
    const opsSecReported = result.opsSec < 100 ?
      result.opsSec.toFixed(2) :
      result.opsSec.toFixed(0);

    process.stdout.write(result.name.padEnd(45));
    process.stdout.write(' x ');
    process.stdout.write(styleText(['cyan', 'bold'], `${ formatter.format(opsSecReported) } ops/sec`));
    // TODO: produce confidence on stddev
    // process.stdout.write(result.histogram.stddev.toString());
    process.stdout.write(` (${ result.histogram.samples.length } runs sampled) `);

    for (const p of result.plugins) {
      if (p.report) {
        process.stdout.write(styleText('dim', `${p.report} `));
      }
    }

    process.stdout.write('min..max=(');
    process.stdout.write(styleText('green', timer.format(result.histogram.min)));
    process.stdout.write(styleText('dim', '...'));
    process.stdout.write(styleText('red', `${timer.format(result.histogram.max)})`));
    process.stdout.write('\n');
  }
}

module.exports = {
  textReport,
};
