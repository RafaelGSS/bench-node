const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { Suite, chartReport } = require('../lib');

describe('chartReport outputs benchmark results as a bar chart', async (t) => {
  let output = '';

  before(async () => {
    process.stdout.write = function (data) {
      output += data;
    };

    const suite = new Suite({
      reporter: chartReport,
    });

    suite
      .add('single with matcher', function () {
        const pattern = /[123]/g
        const replacements = { 1: 'a', 2: 'b', 3: 'c' }
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(pattern, m => replacements[m])
        assert.ok(r);
      })
      .add('multiple replaces', function () {
        const subject = '123123123123123123123123123123123123123123123123'
        const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
        assert.ok(r);
      })
    await suite.run();
  });

  it('should include bar chart chars', () => {
    assert.ok(output.includes('█'));
  });

  it('should include ops/sec', () => {
    assert.ok(output.includes('ops/sec'));
  })
});
