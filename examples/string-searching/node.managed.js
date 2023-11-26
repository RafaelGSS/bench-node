const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add('Using includes', function (timer) {
    const assert = require('node:assert');

    const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8';

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = text.includes('application/json');
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('Using indexof', function (timer) {
    const assert = require('node:assert');

    const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8';

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = text.indexOf('application/json') !== -1;
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('Using cached RegExp.test', function (timer) {
    const assert = require('node:assert');

    const regex = /application\/json/;
    const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8';

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = regex.test(text);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
