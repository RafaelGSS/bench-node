const { Suite } = require('../../lib');

const suite = new Suite();

const text = 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8'
const regex = /application\/json/

suite
  .add('Using includes', function () {
    const r = text.includes('application/json')
  })
  .add('Using indexof', function () {
    const r = text.indexOf('application/json') !== -1
  })
  .add('Using cached RegExp.test', function () {
    const r = regex.test(text)
  })
  .add('[Managed] Using includes', function (timer) {
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
  .add('[Managed] Using indexof', function (timer) {
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
  .add('[Managed] Using cached RegExp.test', function (timer) {
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
