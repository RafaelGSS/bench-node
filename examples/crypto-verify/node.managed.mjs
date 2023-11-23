import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

suite
  .add(`crypto.createVerify('RSA-SHA256')`, async function (timer) {
    const crypto = await import('node:crypto');
    const { readFileSync } = await import('node:fs');
    const assert = await import('node:assert');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const currentFile = resolve(fileURLToPath(import.meta.url), '..');
    const rsaPrivateKey = readFileSync(`${currentFile}/private-key.pem`, 'utf-8');
    const rsaPublicKey = readFileSync(`${currentFile}/public-key.pem`, 'utf-8');

    const thing = 'hello world'
    const signature = crypto.createSign('RSA-SHA256').update(thing).sign(rsaPrivateKey, 'base64')

    let verifier;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      verifier = crypto.createVerify('RSA-SHA256')
      verifier.update(thing)
      verifier.verify(rsaPublicKey, signature, 'base64')
    }
    timer.end(timer.count);

    assert.ok(verifier);
  })
  .add(`crypto.verify('RSA-SHA256')`, async function (timer) {
    const crypto = await import('node:crypto');
    const { readFileSync } = await import('node:fs');
    const assert = await import('node:assert');
    const { resolve } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const currentFile = resolve(fileURLToPath(import.meta.url), '..');
    const rsaPrivateKey = readFileSync(`${currentFile}/private-key.pem`, 'utf-8');
    const rsaPublicKey = readFileSync(`${currentFile}/public-key.pem`, 'utf-8');

    const thing = 'hello world'
    const signature = crypto.createSign('RSA-SHA256').update(thing).sign(rsaPrivateKey, 'base64')

    let r;

    timer.start();
    for (let i = 0; i < timer.count; i++) {
      r = crypto.verify('RSA-SHA256', thing, rsaPublicKey, Buffer.from(signature, 'base64'));
    }
    timer.end(timer.count);

    assert.ok(r);
  })
  .run();