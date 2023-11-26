const { Suite } = require('../../lib');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const suite = new Suite();

const sampleFile = resolve(__dirname, 'sample-file.txt');

suite
  .add('readFileSync', function () {
    const r = readFileSync(sampleFile);
  })
  .add('readFileSync utf-8', function () {
    const r = readFileSync(sampleFile, 'utf-8');
  })
  .run();
