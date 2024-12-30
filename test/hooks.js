const { describe, it } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { Suite } = require("../lib/index");

describe("afterEach hook", () => {
  it("should call afterEach after every iteration in unmanaged benchmarks", async () => {
    let afterEachCallCount = 0;
    const suite = new Suite({ reporter: () => {} });

    suite.add(
      "unmanaged with afterEach",
      {
        afterEach: () => {
          afterEachCallCount++;
        },
      },
      () => {
        const sum = 1 + 2; // Benchmark logic
        return sum;
      }
    );

    await suite.run();

    // Validate afterEach was called correctly
    assert.ok(afterEachCallCount > 0, "afterEach was not called");
  });

  it("should be called after each iteration of a benchmark", async () => {
    const suite = new Suite({ reporter: () => {} });
    const cachedModule = path.resolve(path.join(__dirname, "./fixtures/cached.js"));

    suite.add(
      "unmanaged with afterEach",
      {
        afterEach: () => {
          delete require.cache[cachedModule]
        },
      },
      () => {
        assert.ok(require.cache[cachedModule] === undefined);
        require(cachedModule);
        assert.ok(require.cache[cachedModule] !== undefined);
      }
    );

    await suite.run();
    assert.ok(require.cache[cachedModule] === undefined);
  });

  it("should throw error when afterEach is used with Worker Threads", () => {
    const suite = new Suite({ reporter: () => {}, useWorkers: true });

    assert.throws(() => {
      suite.add(
        "worker with afterEach",
        {
          afterEach: () => {
            console.log("This will fail");
          },
        },
        () => {
          const result = 42; // Some logic
          return result;
        }
      );
    }, /The "afterEach" hook is not supported when using Worker Threads/);
  });
});
