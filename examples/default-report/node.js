const { Suite, csvReport } = require('../../lib');
const assert = require('node:assert');

const suite = new Suite({
  reporter: csvReport,
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
  .run();
