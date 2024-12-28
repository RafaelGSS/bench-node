const {
	Suite,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
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
});
