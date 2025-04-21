const { Suite } = require("../lib/index");
const { describe, it } = require("node:test");
const assert = require("node:assert");

// Helper function to create a controlled delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Time-based Benchmarking", () => {
	it("should run in 'ops' mode by default", async () => {
		const suite = new Suite({ reporter: false });

		suite.add("Default mode test", () => {
			// Simple operation
			Math.sqrt(Math.random());
		});

		const results = await suite.run();

		assert.strictEqual(results.length, 1);
		assert.ok(results[0].opsSec !== undefined, "opsSec should be defined");
		assert.ok(
			results[0].totalTime === undefined,
			"totalTime should not be defined",
		);
		assert.ok(
			results[0].histogram.samples > 1,
			"Should have multiple samples in ops mode",
		);
	});

	it("should run in 'time' mode when specified at suite level", async () => {
		const suite = new Suite({
			reporter: false,
			benchmarkMode: "time",
		});

		const delayTime = 50; // 50ms delay

		suite.add("Time mode test", async () => {
			await delay(delayTime);
		});

		const results = await suite.run();

		assert.strictEqual(results.length, 1);
		assert.ok(
			results[0].totalTime !== undefined,
			"totalTime should be defined",
		);
		assert.ok(results[0].opsSec === undefined, "opsSec should not be defined");

		// Verify the time is approximately correct (allow for some overhead)
		const measuredTime = results[0].totalTime * 1000; // Convert to ms
		assert.ok(
			measuredTime >= delayTime && measuredTime < delayTime + 20,
			`Measured time (${measuredTime}ms) should be close to expected delay (${delayTime}ms)`,
		);

		// Verify there's exactly 1 sample in time mode
		assert.strictEqual(
			results[0].histogram.samples,
			1,
			"Should have exactly 1 sample in time mode",
		);
	});

	it("should average results across repeatSuite in time mode", async () => {
		const suite = new Suite({
			reporter: false,
			benchmarkMode: "time",
		});

		const repeatCount = 5;

		// A very fast operation that should be consistent
		suite.add("Repeat time test", { repeatSuite: repeatCount }, () => {
			// Simple operation
			const x = 1 + 1;
		});

		const results = await suite.run();

		assert.strictEqual(results.length, 1);
		assert.ok(
			results[0].totalTime !== undefined,
			"totalTime should be defined",
		);

		// Verify the number of samples matches repeatSuite
		assert.strictEqual(
			results[0].histogram.samples,
			repeatCount,
			`Should have exactly ${repeatCount} samples with repeatSuite=${repeatCount}`,
		);
	});

	it("should not mix modes within the same suite", async () => {
		// This test verifies that benchmarkMode is a suite-level setting
		// and cannot be overridden at the benchmark level

		const opsSuite = new Suite({ reporter: false });
		const timeSuite = new Suite({ reporter: false, benchmarkMode: "time" });

		// Add benchmarks to both suites
		opsSuite.add("Ops benchmark", () => Math.random());
		timeSuite.add("Time benchmark", () => Math.random());

		// Run both suites
		const opsResults = await opsSuite.run();
		const timeResults = await timeSuite.run();

		// Verify ops suite reports ops/sec
		assert.ok(
			opsResults[0].opsSec !== undefined,
			"opsSec should be defined for ops suite",
		);
		assert.ok(
			opsResults[0].totalTime === undefined,
			"totalTime should not be defined for ops suite",
		);

		// Verify time suite reports totalTime
		assert.ok(
			timeResults[0].totalTime !== undefined,
			"totalTime should be defined for time suite",
		);
		assert.ok(
			timeResults[0].opsSec === undefined,
			"opsSec should not be defined for time suite",
		);
	});

	it("should validate benchmarkMode option", () => {
		// Valid modes
		assert.doesNotThrow(() => {
			new Suite({ benchmarkMode: "ops" });
			new Suite({ benchmarkMode: "time" });
		});

		// Invalid modes
		assert.throws(() => new Suite({ benchmarkMode: "invalid" }), {
			code: "ERR_INVALID_ARG_VALUE",
		});

		assert.throws(() => new Suite({ benchmarkMode: 123 }), {
			code: "ERR_INVALID_ARG_TYPE",
		});
	});
});
