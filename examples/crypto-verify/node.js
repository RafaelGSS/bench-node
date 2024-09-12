const crypto = require('node:crypto');
const { readFileSync } = require('fs');
const { Suite } = require('../../lib');

const rsaPrivateKey = readFileSync(`${__dirname}/private-key.pem`, 'utf-8');
const rsaPublicKey = readFileSync(`${__dirname}/public-key.pem`, 'utf-8');

const thing = 'hello world';
const algorithm = 'RSA-SHA256';
const signature = crypto.createSign(algorithm).update(thing).sign(rsaPrivateKey, 'base64');

const suite = new Suite();

suite
  .add(`crypto.createVerify('${algorithm}')`, function () {
    var verifier = crypto.createVerify(algorithm);
    verifier.update(thing);
    verifier.verify(rsaPublicKey, signature, 'base64');
  })
  .add(`crypto.verify('${algorithm}')`, function () {
    crypto.verify(algorithm, thing, rsaPublicKey, Buffer.from(signature, 'base64'));
  })
  .add(`[Managed] crypto.createVerify('RSA-SHA256')`, function (timer) {
    const crypto = require('node:crypto');
    const { readFileSync } =require('node:fs');
    const assert = require('node:assert');

    const rsaPrivateKey = readFileSync(`${__dirname}/private-key.pem`, 'utf-8');
    const rsaPublicKey = readFileSync(`${__dirname}/public-key.pem`, 'utf-8');

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
  .add(`[Managed] crypto.verify('RSA-SHA256')`, function (timer) {
    const crypto = require('node:crypto');
    const { readFileSync } = require('node:fs');
    const assert = require('node:assert');

    const rsaPrivateKey = readFileSync(`${__dirname}/private-key.pem`, 'utf-8');
    const rsaPublicKey = readFileSync(`${__dirname}/public-key.pem`, 'utf-8');

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
