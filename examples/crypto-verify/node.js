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
  .run();
