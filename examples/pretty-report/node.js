const { Suite, prettyReport } = require('../../lib');
const assert = require('node:assert');

const suite = new Suite({
  reporter: prettyReport,
});

suite
  .add('my-group/my-benchmark', () => {
    // A slower benchmark
    for (let i = 0; i < 10000; i++) {}
  })
  .add('my-group/my-benchmark-2', { baseline: true }, function () {
    // The baseline
    for (let i = 0; i < 1000; i++) {}
  })
  .add('second-group/another-benchmark', function () {
    // A faster benchmark
    for (let i = 0; i < 100; i++) {}
  })
  .run();
