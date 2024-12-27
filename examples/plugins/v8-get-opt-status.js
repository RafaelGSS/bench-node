const { Suite, V8GetOptimizationStatus } = require("../../lib");

const suite = new Suite({
	plugins: [new V8GetOptimizationStatus()],
});

suite
	.add("new Uint32Array(1024)", () => new Uint32Array(1024))
	.add("[Managed] new Uint32Array(1024)", (timer) => {
		const assert = require("node:assert");

		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = new Uint32Array(1024);
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.run();
