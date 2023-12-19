const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add(`new Uint32Array(1024)`, function () {
    return new Uint32Array(1024);
  })
  .run();
