const { Suite, prettyReport } = require('../../lib');
const assert = require('node:assert');

const suite = new Suite({
  reporter: prettyReport,
});

suite
  .add('my-group/my-benchmark', () => {
    const pattern = /[123]/g
    const replacements = { 1: 'a', 2: 'b', 3: 'c' }
    const subject = '12312312312312312312312'
    const r = subject.replace(pattern, m => replacements[m])
    assert.ok(r);
  })
  .add('my-group/my-benchmark-2', function () {
    const subject = '123123123123'
    const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
    assert.ok(r);
  })
  .add('second-group/baseline', function () {
    const subject = '123123123123123123123123123123123123123123123123'
    const r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c')
    assert.ok(r);
  })
  .run();
