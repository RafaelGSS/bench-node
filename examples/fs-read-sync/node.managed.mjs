import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

suite
  .add('readFileSync', async function (timer) {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const assert = await import('node:assert');

    const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = readFileSync(sampleFile);
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .add('readFileSync utf-8', async function (timer) {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const assert = await import('node:assert');

    const sampleFile = resolve(fileURLToPath(import.meta.url), '..', 'sample-file.txt');
    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = readFileSync(sampleFile, 'utf-8');
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();
