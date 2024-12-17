const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const { Suite } = require('../lib');
const copyBench = require('./fixtures/copy');
const { managedBench, managedOptBench } = require('./fixtures/opt-managed');

function assertMinBenchmarkDifference(results, { percentageLimit, ciPercentageLimit }) {
  assertBenchmarkDifference(results, { percentageLimit, ciPercentageLimit, greaterThan: true });
}

function assertMaxBenchmarkDifference(results, { percentageLimit, ciPercentageLimit }) {
  assertBenchmarkDifference(results, { percentageLimit, ciPercentageLimit, greaterThan: false });
}

function assertBenchmarkDifference(results, { percentageLimit, ciPercentageLimit, greaterThan }) {
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results.length; j++) {
      if (i !== j) {
        const opsSec1 = results[i].opsSec;
        const opsSec2 = results[j].opsSec;

        // Calculate the percentage difference
        const difference = Math.abs(opsSec1 - opsSec2);
        const percentageDifference = (difference / Math.min(opsSec1, opsSec2)) * 100;

        // Check if the percentage difference is less than or equal to 10%
        if (process.env.CI) {
          // CI runs in a shared-env so the percentage of difference
          // must be greather there due to high variance of hardware
          assert.ok(
            greaterThan ? percentageLimit >= ciPercentageLimit : percentageDifference <= ciPercentageLimit,
            `"${results[i].name}" too different from "${results[j].name}" - ${percentageDifference} != ${ciPercentageLimit}`
          );
        } else {
          assert.ok(
            greaterThan ? percentageLimit >= percentageLimit : percentageDifference <= percentageLimit,
            `${results[i].name} too different from ${results[j].name} - ${percentageDifference} != ${percentageLimit}`
          );
        }
      }
    }
  }
}

describe('Same benchmark function', () => {
  let results;

  before(async () => {
    results = await copyBench.run();
  });

  it('must have a similar benchmark result', () => {
    assertMaxBenchmarkDifference(results, { percentageLimit: 10, ciPercentageLimit: 30 });
  });
});

describe('Managed can be V8 optimized', () => {
  let optResults, results;

  before(async () => {
    optResults = await managedOptBench.run();
    results = await managedBench.run();
  });

  it('should be more than 50% different from unmanaged', () => {
    assertMinBenchmarkDifference(optResults, { percentageLimit: 50, ciPercentageLimit: 30 });
  });

  // it('should be similar when avoiding V8 optimizatio', () => {
  //   assertBenchmarkDifference(results, 50, 30);
  // });
});

describe('Workers should have parallel context', () => {
  let results;
  before(async () => {
    const bench = new Suite({
      reporter: () => {},
      useWorkers: true,
    });

    bench
      .add('Import with node: prefix', () => {
        return import('node:fs');
      })
      .add('Import without node: prefix', () => {
        return import('fs');
      });
    results = await bench.run();
  });

  it('should have a similar result as they will not share import.meta.cache', () => {
    assertMaxBenchmarkDifference(results, { percentageLimit: 10, ciPercentageLimit: 30 });
  });
});
