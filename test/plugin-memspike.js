// @ts-check
const { RecordMemorySpikePlugin, Suite
} = require('../lib/index');

const { test } = require("node:test");
const assert = require("node:assert");
const { setTimeout } = require("node:timers/promises");

const wasteMemoryForAWhile = async () => {
  const a = Buffer.alloc(1024 * 1024, "a");
  await setTimeout(5);
  a.at(1); // prevent optimization
};
function noop() {}

test("RecordMemorySpikePlugin", async (t) => {
  const bench = new Suite({
    reporter: noop,
    plugins: [new RecordMemorySpikePlugin()],
  });
  bench
    .add("sequence", async () => {
      for (let i = 0; i < 20; i++) {
        await wasteMemoryForAWhile();
      }
    })
    .add("concurent", async () => {
      await Promise.all(
        Array.from({ length: 20 }, () => wasteMemoryForAWhile()),
      );
    });

  const [bench1, bench2] = await bench.run();
  console.dir(
    {
      bench1,
      bench2,
    },
    { depth: 100 },
  );

  const { plugins: [{ result: result1 }] } = bench1;
  const { plugins: [{ result: result2 }] } = bench2;
  const parseResult = (str) => parseFloat(str.replace(/[^\d.-]/g, ''));
  assert.ok(parseResult(result1.new_space) > parseResult(result2.new_space), "Sequence new_space should be larger than concurrent new_space");
  assert.ok(parseResult(result1.old_space) > parseResult(result2.old_space), "Sequence old_space should be larger than concurrent old_space");
  
});
