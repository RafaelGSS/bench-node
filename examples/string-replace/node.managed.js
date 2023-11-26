const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add('single with matcher', function (timer) {
    const assert = require('node:assert');

    const pattern = /[123]/g
    const replacements = { 1: 'a', 2: 'b', 3: 'c' }

    const subject = '123123123123123123123123123123123123123123123123'

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = subject.replace(pattern, m => replacements[m]);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('multiple replaces', function (timer) {
    const assert = require('node:assert');

    const subject = '123123123123123123123123123123123123123123123123'

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = subject.replace(/1/g, 'a').replace(/2/g, 'b').replace(/3/g, 'c');
    }
    timer.end(timer.count);
    assert.ok(r);
  })
  .run()
