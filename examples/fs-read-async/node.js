const { Suite } = require('../../lib');
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const suite = new Suite();

const sampleFile = resolve(__dirname, 'sample-file.txt');

suite
  .add('readFile', async function () {
    const r = await readFile(sampleFile);
  })
  .add('readFile utf-8', async function () {
    const r = await readFile(sampleFile, 'utf-8');
  })
  .run();
