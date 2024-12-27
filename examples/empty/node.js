const { Suite } = require('../../lib');

const suite = new Suite();

suite
  .add(`empty`, function () {})
  .add(`empty async`, async function () {})
  .run();
