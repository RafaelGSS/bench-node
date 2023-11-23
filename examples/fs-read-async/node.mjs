import { Suite } from '../../lib/index.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const suite = new Suite();

const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');

suite
  .add('readFile', async function () {
    const r = await readFile(sampleFile);
  })
  .add('readFile utf-8', async function () {
    const r = await readFile(sampleFile, 'utf-8');
  })
  .run();
