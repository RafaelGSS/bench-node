const {
	Suite,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
	MemoryPlugin,
	DeadCodeEliminationDetectionPlugin,
} = require("../lib/index");
const { describe, it } = require("node:test");
const assert = require("node:assert");

class InvalidPlugin {}

class ValidPlugin {
	toString() {
		return "";
	}
	isSupported() {
		return true;
	}
}

describe("Plugins validation", () => {
	it("should be an object with expected methods", () => {
		for (const r of [1, "ds", {}]) {
			assert.throws(
				() => {
					new Suite({ plugins: r });
				},
				{
					code: "ERR_INVALID_ARG_TYPE",
				},
			);
		}
		assert.throws(
			() => {
				new Suite({ plugins: [new InvalidPlugin()] });
			},
			{
				code: "ERR_INVALID_ARG_TYPE",
			},
		);
		// doesNotThrow
		new Suite({ plugins: [new ValidPlugin()] });
	});

	it("beforeClockTemplate should return an array", () => {
		class InvalidPlugin2 {
			beforeClockTemplate() {
				return "error";
			}
			toString() {
				return "";
			}
			isSupported() {
				return true;
			}
		}

		assert.throws(
			() => {
				new Suite({ plugins: [new InvalidPlugin2()] });
			},
			{
				code: "ERR_INVALID_ARG_TYPE",
			},
		);
	});

	it("afterClockTemplate should return an array", () => {
		class InvalidPlugin2 {
			beforeClockTemplate() {
				return [""];
			}
			afterClockTemplate() {
				return "error";
			}
			toString() {
				return "";
			}
			isSupported() {
				return true;
			}
		}

		assert.throws(
			() => {
				new Suite({ plugins: [new InvalidPlugin2()] });
			},
			{
				code: "ERR_INVALID_ARG_TYPE",
			},
		);
	});
});

describe("Official plugins validation", () => {
	it("V8NeverOptimizePlugin validation", () => {
		const bench = new Suite({
			plugins: [new V8NeverOptimizePlugin()],
		});
		assert.ok(bench);
	});
	it("V8GetOptimizationStatus validation", () => {
		const bench = new Suite({
			plugins: [new V8GetOptimizationStatus()],
		});
		assert.ok(bench);
	});
	it("V8OptimizeOnNextCallPlugin validation", () => {
		const bench = new Suite({
			plugins: [new V8OptimizeOnNextCallPlugin()],
		});
		assert.ok(bench);
	});

	it("MemoryPlugin validation", () => {
		const bench = new Suite({
			plugins: [new MemoryPlugin()],
		});
		assert.ok(bench);
	});

	it("DeadCodeEliminationDetectionPlugin validation", () => {
		const bench = new Suite({
			plugins: [new DeadCodeEliminationDetectionPlugin()],
		});
		assert.ok(bench);
	});
});

describe("DeadCodeEliminationDetectionPlugin", () => {
	it("should initialize with default threshold", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin();
		assert.ok(plugin);
		assert.strictEqual(plugin.isSupported(), true);
	});

	it("should accept custom threshold", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin({ threshold: 20 });
		assert.ok(plugin);
	});

	it("should set and use baseline", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin();
		plugin.setBaseline(100); // 100ns baseline
		assert.strictEqual(plugin.hasWarning("test"), false);
	});

	it("should detect suspiciously fast benchmarks", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin({ threshold: 10 });
		plugin.setBaseline(100); // 100ns baseline

		// Simulate a benchmark that's only 5x slower than baseline (should warn)
		const fastResult = [500, 1]; // 500ns total, 1 iteration = 500ns/iter
		plugin.onCompleteBenchmark(fastResult, { name: "fast-bench" });

		assert.strictEqual(plugin.hasWarning("fast-bench"), true);
		const warning = plugin.getWarning("fast-bench");
		assert.ok(warning);
		assert.strictEqual(warning.timePerOp, 500);
		assert.strictEqual(warning.baselineTime, 100);
		assert.strictEqual(warning.ratio, 5);
	});

	it("should not warn for legitimate benchmarks", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin({ threshold: 10 });
		plugin.setBaseline(100); // 100ns baseline

		// Simulate a benchmark that's 50x slower than baseline (should not warn)
		const slowResult = [5000, 1]; // 5000ns total, 1 iteration = 5000ns/iter
		plugin.onCompleteBenchmark(slowResult, { name: "slow-bench" });

		assert.strictEqual(plugin.hasWarning("slow-bench"), false);
	});

	it("should track multiple warnings", () => {
		const plugin = new DeadCodeEliminationDetectionPlugin({ threshold: 10 });
		plugin.setBaseline(100);

		plugin.onCompleteBenchmark([200, 1], { name: "bench1" });
		plugin.onCompleteBenchmark([300, 1], { name: "bench2" });

		const allWarnings = plugin.getAllWarnings();
		assert.strictEqual(allWarnings.length, 2);
		assert.strictEqual(allWarnings[0].name, "bench1");
		assert.strictEqual(allWarnings[1].name, "bench2");
	});

	it("should create Suite with DCE detection enabled", () => {
		// Just verify Suite accepts the option
		const suite = new Suite({
			detectDeadCodeElimination: true,
			dceThreshold: 15,
			reporter: false,
		});
		assert.ok(suite);
	});
});
