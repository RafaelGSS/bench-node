const { Suite } = require('../lib/index');
const { describe, it, todo } = require('node:test');
const assert = require('node:assert');

function noop() {}

describe('API Interface', () => {
  it('options should be an object', () => {
    [1, 'ds', null].forEach((r) => {
      assert.throws(() => {
        new Suite(r);
      }, {
        code: 'ERR_INVALID_ARG_TYPE',
      });
    });
    // doesNotThrow
    new Suite({});
  });

  it('reporter should be a function', () => {
    [1, 'ds', {}].forEach((r) => {
      assert.throws(() => {
        new Suite({ reporter: r });
      }, {
        code: 'ERR_INVALID_ARG_TYPE'
      });
    });
    // doesNotThrow
    new Suite({ reporter: () => {} });
  });

  describe('suite.add', () => {
    const bench =  new Suite({ reporter: noop });
    it('name should be an string', () => {
      [1, undefined, null, {}].forEach((r) => {
        assert.throws(() => {
          bench.add(r);
        });
      });
      // doesNotThrow
      bench.add('example', noop);
    });

    it('options should be an valid object', () => {
      [1, 'ds', null].forEach((r) => {
        assert.throws(() => {
          bench.add('name', r, noop);
        }, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });
    });

    it('minTime should be a valid number', () => {
      ['ds', {}, () => {}].forEach((r) => {
        assert.throws(() => {
          bench.add('name', { minTime: r }, noop);
        }, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });
      assert.throws(() => {
        bench.add('name', { minTime: 0 }, noop);
      }, {
        code: 'ERR_INVALID_ARG_VALUE',
      });
      assert.throws(() => {
        bench.add('name', { minTime: 0.000001 }, noop);
      }, {
        code: 'ERR_INVALID_ARG_VALUE',
      });
      // doesNotThrow
      bench.add('name', { minTime: 0.5 }, noop);
    })

    it('maxTime should be a valid number', () => {
      ['ds', {}, () => {}].forEach((r) => {
        assert.throws(() => {
          bench.add('name', { minTime: r }, noop);
        }, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });
    });
    it('maxTime should be greater than minTime', () => {
      assert.throws(() => {
        bench.add('name', { maxTime: 0 }, noop);
      }, {
        code: 'ERR_INVALID_ARG_VALUE',
      });
      assert.throws(() => {
        bench.add('name', { maxTime: 0.1, minTime: 0.2 }, noop);
      }, {
        code: 'ERR_INVALID_ARG_VALUE',
      });
      // doesNotThrow
      bench.add('name', { minTime: 0.01, maxTime: 0.02 }, noop);
    });

    it('fn should be a function', () => {
      ['ds', {}, 42].forEach((r) => {
        assert.throws(() => {
          bench.add('name', {}, r);
        }, {
          code: 'ERR_INVALID_ARG_TYPE',
        });
      });
      // doesNotThrow
      bench.add('name', noop);
    });
  });
});

describe('simple usage', async () => {
  const bench = new Suite({ reporter: noop });
  bench
    .add('foo', async () => {
      await new Promise((resolve) => setTimeout((resolve), 50));
    })
    .add('bar', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

  const [bench1, bench2] = await bench.run();


  it('benchmark name should be returned in results', () => {
    assert.strictEqual(bench1.name, 'foo');
    assert.strictEqual(bench2.name, 'bar');
  });

  it('ops/sec should match the expected duration', () => {
    // 1000(ms)/50 = 20 + cost of creating promises
    assert.ok(bench1.opsSec > 18 && bench1.opsSec <= 20);
    // 1000(ms)/100 = 100 + cost of creating promises
    assert.ok(bench2.opsSec > 8 && bench2.opsSec <= 10);
  });

  it('tasks should have at least 10 samples', () => {
    assert.ok(bench1.iterations >= 10);
    assert.ok(bench2.iterations >= 10);
  });
});

describe('throws when a benchmark task throw', async () => {
  const bench = new Suite();
  const err = new Error();

  bench.add('error', () => {
    throw err;
  });
  assert.rejects(() => bench.run());
});

todo('histogram values', async () => {

});

todo('async tasks should behave similar to sync tasks', async () => {

});
