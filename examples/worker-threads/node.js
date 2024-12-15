const { Suite } = require('../../lib');

const suite = new Suite({
  useWorkers: true,
});

suite
  .add('Using import without node: prefix', function () {
    return import('fs');
  })
  .add('Using import with node: prefix', function () {
    return import('node:fs');
  })
  .run();
