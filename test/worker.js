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
			})
			.add("expression arrow function", () => JSON.parse("[1,2,3]"))
			.add("managed with custom parameter name", async (t) => {
				t.start();
				let i = 0;
				while (i++ < t.count) {
					await import("node:fs");
				}
				t.end(t.count);
			})
			.add(
				"method shorthand",
				{
					run(t) {
						t.start();
						for (let i = 0; i < t.count; i++) {
							JSON.parse("[1,2,3]");
						}
						t.end(t.count);
					},
				}.run,
			);

		await bench.run();
	});

	after(() => {
		mock.restoreAll();
	});

	it("should create a new Worker 7 times", () => {
		assert.strictEqual(workerThreads.Worker.mock.calls.length, 7);
	});

	it("should run the body of expression arrow functions", async () => {
		const { Suite } = require("../lib/index");

		const bench = new Suite({
			reporter: noop,
			useWorkers: true,
		});

		// The suite also clocks the function on the main thread, so only throw
		// inside the worker, where this global is not defined
		globalThis.__benchNodeMainThread = true;
		bench.add(
			"invalid JSON",
			() => globalThis.__benchNodeMainThread || JSON.parse("["),
		);

		try {
			await assert.rejects(bench.run(), SyntaxError);
		} finally {
			globalThis.__benchNodeMainThread = undefined;
		}
	});
});
