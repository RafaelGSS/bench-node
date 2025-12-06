const workerThreads = require("node:worker_threads");
const { describe, it, before, after, mock } = require("node:test");
const assert = require("node:assert");

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
			.add("async test", async (timer) => {
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

	it("should create a new Worker 3 times", () => {
		assert.strictEqual(workerThreads.Worker.mock.calls.length, 3);
	});
});
