const workerThreads = require("node:worker_threads");
const { describe, it, before, after, mock } = require("node:test");
const assert = require("node:assert");
const { Suite, V8GetOptimizationStatus } = require("../lib");

function noop() {}

describe("Using worker_threads", () => {
	before(async () => {
		mock.method(workerThreads, "Worker");

		const { Suite } = require("../lib/index");

		const bench = new Suite({
			reporter: noop,
			useWorkers: true,
		});

		bench
			.add("Import with node: prefix", () => {
				return import("node:fs");
			})
			.add("Import without node: prefix", () => {
				return import("node:fs");
			})
			.add("async test", async () => {
				return import("node:fs");
			})
			.add("async with timer", async (timer) => {
				timer.start();
				let i = 0;
				while (i++ < timer.count) {
					await import("node:fs");
				}
				timer.end(timer.count);
			});

		await bench.run();
	});

	after(() => {
		mock.restoreAll();
	});

	it("should create a new Worker 4 times", () => {
		assert.strictEqual(workerThreads.Worker.mock.calls.length, 4);
	});
});

describe("native worker results", () => {
	it("normalizes samples and replays plugin results", async () => {
		const suite = new Suite({
			reporter: false,
			useWorkers: true,
			plugins: [new V8GetOptimizationStatus()],
		});
		suite.add(
			"worker plugin",
			{ minTime: 0.00001, maxTime: 0.00002, minSamples: 2 },
			() => Math.sqrt(42),
		);

		const [result] = await suite.run();

		assert.ok(result.opsSec > 0);
		assert.strictEqual(result.plugins[0].name, "V8GetOptimizationStatus");
		assert.match(result.plugins[0].report, /v8-opt-status/);
	});

	it("supports time mode repeats", async () => {
		const suite = new Suite({
			reporter: false,
			plugins: [],
			useWorkers: true,
			benchmarkMode: "time",
		});
		suite.add("worker time", { repeatSuite: 3, minSamples: 1 }, () => {});

		const [result] = await suite.run();

		assert.ok(result.totalTime > 0);
		assert.strictEqual(result.histogram.samples, 3);
		assert.strictEqual(result.iterations, 3);
	});
});
