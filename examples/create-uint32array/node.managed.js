const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add(`new Uint32Array(1024)`, function (timer) {
    const assert = require('node:assert');

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = new Uint32Array(1024);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add(`new Uint32Array(1024 * 1024)`, function (timer) {
    const assert = require('node:assert');

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = new Uint32Array(1024 * 1024);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add(`new Uint32Array(1024 * 1024 * 10)`, function (timer) {
    const assert = require('node:assert');

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = new Uint32Array(1024 * 1024 * 10);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
