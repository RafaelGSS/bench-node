import { Suite } from '../../lib/index.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const suite = new Suite();

const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');

suite
  .add('readFileSync', function () {
    const r = readFileSync(sampleFile);
  })
  .add('readFileSync utf-8', function () {
    const r = readFileSync(sampleFile, 'utf-8');
  })
  .run();
