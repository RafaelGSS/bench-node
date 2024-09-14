const {
  Suite,
  V8GetOptimizationStatus,
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin,
} = require('../../lib');

const suite = new Suite({
  plugins: [
    new V8GetOptimizationStatus(),
    new V8NeverOptimizePlugin(),
    // new V8OptimizeOnNextCallPlugin(),
  ],
});

suite
  .add(`new Uint32Array(1024)`, function () {
    return new Uint32Array(1024);
  })
  .add(`[Managed] new Uint32Array(1024)`, function (timer) {
    const assert = require('node:assert');

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = new Uint32Array(1024);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
