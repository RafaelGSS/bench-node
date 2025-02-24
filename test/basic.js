const { Suite } = require("../lib/index");
const { describe, it, todo } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

function noop() {}

describe("API Interface", () => {
	it("options should be an object", () => {
		for (const r of [1, "ds", null]) {
			assert.throws(
				() => {
					new Suite(r);
				},
				{
					code: "ERR_INVALID_ARG_TYPE",
				},
			);
		}
		// doesNotThrow
		new Suite({});
	});

	it("reporter should be a function", () => {
		for (const r of [1, "ds", {}]) {
			assert.throws(
				() => {
					new Suite({ reporter: r });
				},
				{
					code: "ERR_INVALID_ARG_TYPE",
				},
			);
		}
		// doesNotThrow
		new Suite({ reporter: () => {} });
	});

	it("reporter can be false or null", () => {
		for (const r of [false, null]) {
			// doesNotThrow
			new Suite({ reporter: r });
		}
	});

	describe("suite.add", () => {
		const bench = new Suite({ reporter: noop });
		it("name should be an string", () => {
			for (const r of [1, undefined, null, {}]) {
				assert.throws(() => {
					bench.add(r);
				});
			}
			// doesNotThrow
			bench.add("example", noop);
		});

		it("options should be an valid object", () => {
			for (const r of [1, "ds", null]) {
				assert.throws(
					() => {
						bench.add("name", r, noop);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
		});

		it("minTime should be a valid number", () => {
			for (const r of ["ds", {}, () => {}]) {
				assert.throws(
					() => {
						bench.add("name", { minTime: r }, noop);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
			assert.throws(
				() => {
					bench.add("name", { minTime: 0 }, noop);
				},
				{
					code: "ERR_INVALID_ARG_VALUE",
				},
			);
			assert.throws(
				() => {
					bench.add("name", { minTime: 0.000001 }, noop);
				},
				{
					code: "ERR_INVALID_ARG_VALUE",
				},
			);
			// doesNotThrow
			bench.add("name", { minTime: 0.5 }, noop);
		});

		it("maxTime should be a valid number", () => {
			for (const r of ["ds", {}, () => {}]) {
				assert.throws(
					() => {
						bench.add("name", { minTime: r }, noop);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
		});
		it("maxTime should be greater than minTime", () => {
			assert.throws(
				() => {
					bench.add("name", { maxTime: 0 }, noop);
				},
				{
					code: "ERR_INVALID_ARG_VALUE",
				},
			);
			assert.throws(
				() => {
					bench.add("name", { maxTime: 0.1, minTime: 0.2 }, noop);
				},
				{
					code: "ERR_INVALID_ARG_VALUE",
				},
			);
			// doesNotThrow
			bench.add("name", { minTime: 0.01, maxTime: 0.02 }, noop);
		});

		it("fn should be a function", () => {
			for (const r of ["ds", {}, 42]) {
				assert.throws(
					() => {
						bench.add("name", {}, r);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
			// doesNotThrow
			bench.add("name", noop);
		});

		it("repeatSuite should be a valid number", () => {
			for (const r of ["ds", {}, () => {}]) {
				assert.throws(
					() => {
						bench.add("name", { repeatSuite: r }, noop);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
		});

		it("minSamples should be a valid number", () => {
			for (const r of ["ds", {}, () => {}]) {
				assert.throws(
					() => {
						bench.add("name", { minSamples: r }, noop);
					},
					{
						code: "ERR_INVALID_ARG_TYPE",
					},
				);
			}
		});
	});
});

describe("simple usage", async () => {
	const bench = new Suite({ reporter: noop });
	bench
		.add("foo", async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		})
		.add("bar", async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

	const [bench1, bench2] = await bench.run();

	it("benchmark name should be returned in results", () => {
		assert.strictEqual(bench1.name, "foo");
		assert.strictEqual(bench2.name, "bar");
	});

	it("ops/sec should match the expected duration", () => {
		// 1000(ms)/50 = 20 + cost of creating promises
		assert.ok(bench1.opsSec > 18 && bench1.opsSec <= 20);
		// 1000(ms)/100 = 100 + cost of creating promises
		assert.ok(bench2.opsSec > 8 && bench2.opsSec <= 10);
	});

	it("tasks should have at least 10 samples", () => {
		assert.ok(bench1.iterations >= 10);
		assert.ok(bench2.iterations >= 10);
	});
});

describe("throws when a benchmark task throw", async () => {
	const bench = new Suite();
	const err = new Error();

	bench.add("error", () => {
		throw err;
	});
	assert.rejects(() => bench.run());
});

describe("when no --allow-natives-syntax", async () => {
	it("should throw", () => {
		const file = path.join(__dirname, "fixtures", "bench.js");
		const { status, stderr } = spawnSync(process.execPath, [file]);
		assert.strictEqual(status, 1);
		assert.match(
			stderr.toString(),
			/bench-node module must be run with --allow-natives-syntax/,
		);
	});
});

todo("histogram values", async () => {});
