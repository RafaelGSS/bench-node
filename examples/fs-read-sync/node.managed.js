const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add('readFileSync', function (timer) {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const assert = require('node:assert');

    const sampleFile = resolve(__dirname, 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = readFileSync(sampleFile);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('readFileSync utf-8', function (timer) {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const assert = require('node:assert');

    const sampleFile = resolve(__dirname, 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = readFileSync(sampleFile, 'utf-8');
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
