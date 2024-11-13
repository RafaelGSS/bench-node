// @ts-check
const { Suite } = require("../lib/index.js");
const { describe, it } = require("node:test");
const assert = require("node:assert");

class ExamplePlugin {
  #aggregation = 0;
  constructor() {}

  isSupported() {
    return true;
  }

  beforeClockTemplate() {
    return [`record("- evaluated beforeClockCode");`];
  }

  afterClockTemplate({ context }) {
    return [
      `
    ${context}.example=1;
    record("- evaluated afterClockCode");
    `,
    ];
  }

  onCompleteBenchmark([time, iterations, results]) {
    this.#aggregation += results.example;
  }

  toString() {
    return "ExamplePlugin";
  }

  getReport() {
    return `examplePlugin report`;
  }

  getResult() {
    return {
      examplePluginAggregation: this.#aggregation,
    };
  }
}

describe("plugin API", async () => {
  const bench = new Suite({
    reporter: () => {},
    plugins: [captureAll(new ExamplePlugin())],
  });
  bench.add("task1", async () => {
    record("- task1");
  });
  bench.add("task2", async () => {
    record("- task2");
  });
  const [bench1] = await bench.run();

  it("matches method signatures", async () => {
    const recordedMethodSignatures = getSignatures();
    assert.deepStrictEqual(recordedMethodSignatures, [
      "afterClockTemplate({awaitOrEmpty, bench, context, timer})",
      "beforeClockTemplate({awaitOrEmpty, bench, context, timer})",
      "getReport()",
      "getResult()",
      "isSupported()",
      "onCompleteBenchmark([number, number, object])",
      "toString()",
    ]);
  });
  it("produces history", async () => {
    printExcerptFromHistory();
  });
  it("aggregates results", async () => {
    console.log("Benchmark results plugins field:", bench1.plugins);
    assert(bench1.plugins[0].result.examplePluginAggregation > 1);
    assert.strictEqual(bench1.plugins[0].report, "examplePlugin report");
  });
});

// ============================================
// Utilities to capture the methods and history.
// Moved down the file to keep the test code clean. Hoisting is how they're available.
// No need to look at them, stop reading now, look at the test output instead.

function record(name, args) {
  if (args && args.length) {
    history.push([name, 1, JSON.stringify(Array.from(args))]);
  } else {
    const last = history[history.length - 1];
    if (last && last[0] === name) {
      last[1]++;
    } else {
      history.push([name, 1]);
    }
  }
}

function printExcerptFromHistory(n = 25) {
  const excerpt = [
    ...history.slice(0, n),
    ["(... redacted for brevity ...)", 1],
    ...history.slice(-n),
  ]
    .map(
      ([name, count, args]) =>
        `${name} ${count > 1 ? "x" + count : ""}${
          args ? " with args: " + args : ""
        }`
    )
    .join("\n| ");
  console.log("+----------------------------------");
  console.log("| Plugin lifecycle log:");
  console.log("+----------------------------------");
  console.log("|", excerpt);
  console.log("+----------------------------------");
}
function getSignatures() {
  return Object.entries(API)
    .map(
      ([name, args]) =>
        `${name}(${Array.from(args)
          .map((a) => {
            if (!a) return "";
            if (Array.isArray(a))
              return "[" + a.map((a) => typeof a).join(", ") + "]";
            return "{" + Object.keys(a).sort().join(", ") + "}";
          })
          .join(", ")})`
    )
    .sort();
}
var history, API;
function captureAll(pluginInstance) {
  history = [];
  API = {};
  globalThis.record = record; // make record available in the tasks

  return new Proxy(pluginInstance, {
    get(target, prop, receiver) {
      return function (...args) {
        record(prop, args);
        API[prop] = args;
        if (typeof target[prop] === "function") {
          return target[prop].apply(target, args);
        }
      };
    },
    has(target, prop) {
      return true;
    },
  });
}
