const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const copyBench = require('./fixtures/copy');

describe('Same benchmark function', () => {
  let results;

  before(async () => {
    results = await copyBench.run();
  });

  it('must have a similar benchmark result', () => {
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
              percentageDifference <= 30,
              `${opsSec1} too different from ${opsSec2} - ${results[i].name}`
            );
          } else {
            assert.ok(
              percentageDifference <= 10,
              `${opsSec1} too different from ${opsSec2} - ${results[i].name}`
            );
          }
        }
      }
    }
  });
});
