const { Suite } = require("../../lib");
const assert = require("node:assert");

const suite = new Suite({ reporter: false });

suite
	.add("Using includes", () => {
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
		const r = text.includes("application/json");
		assert.ok(r);
	})
	.add("[Managed] Using includes", (timer) => {
		timer.start();
		for (let i = 0; i < timer.count; i++) {
			const text =
				"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
			const r = text.includes("application/json");
			assert.ok(r);
		}
		timer.end(timer.count);
	});

suite.run();

const optSuite = new Suite({ reporter: false });

optSuite
	.add("Using includes", () => {
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
		const r = text.includes("application/json");
		// assert.ok(r)
	})
	.add("[Managed] Using includes", (timer) => {
		timer.start();
		for (let i = 0; i < timer.count; i++) {
			const text =
				"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
			const r = text.includes("application/json");
			// assert.ok(r)
		}
		timer.end(timer.count);
	});

module.exports = {
	managedBench: suite,
	managedOptBench: optSuite,
};
