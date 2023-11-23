import { Suite } from '../../lib/index.mjs';

const suite = new Suite();

suite
  .add('Using delete property', function () {
    const data = { x: 1, y: 2, z: 3 }
    delete data.y

    data.x
    data.y
    data.z
  })
  .add('Using delete property (proto: null)', function () {
    const data = { __proto__: null, x: 1, y: 2, z: 3 }
    delete data.y

    data.x
    data.y
    data.z
  })
  .add('Using delete property (cached proto: null)', function (t) {
    const NullObject = function () { }
    NullObject.prototype = Object.create(null)

    t.start();
    for (let i = 0; i < t.count; i++) {
      const data = new NullObject()

      data.x = 1
      data.y = 2
      data.z = 3

      delete data.y

      data.x
      data.y
      data.z
    }

    t.end(t.count);
  })
  .add('Using undefined assignment', function () {
    const data = { x: 1, y: 2, z: 3 }
    data.y = undefined

    data.x
    data.y
    data.z
  })
  .add('Using undefined assignment (proto: null)', function () {
    const data = { __proto__: null, x: 1, y: 2, z: 3 }
    data.y = undefined

    data.x
    data.y
    data.z
  })
  .add('Using undefined property (cached proto: null)', function (t) {
    const NullObject = function () { }
    NullObject.prototype = Object.create(null)

    t.start();
    for (let i = 0; i < t.count; i++) {
      const data = new NullObject()

      data.x = 1
      data.y = 2
      data.z = 3

      data.y = undefined

      data.x
      data.y
      data.z
    }

    t.end(t.count);
  })
  .run();
