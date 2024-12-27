const { Suite } = require("../../lib");

const suite = new Suite();

suite
	.add("new Uint32Array(1024)", () => new Uint32Array(1024))
	.add(
		"new Uint32Array(1024) with 10 repetitions",
		{ repeatSuite: 10 },
		() => new Uint32Array(1024),
	)
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
