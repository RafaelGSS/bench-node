import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

suite
  .add('readFile', async function (timer) {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const assert = await import('node:assert');

    const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = await readFile(sampleFile);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('readFile utf-8', async function (timer) {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const assert = await import('node:assert');

    const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = await readFile(sampleFile, 'utf-8');
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
