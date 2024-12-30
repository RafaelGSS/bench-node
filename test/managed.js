const { describe, it } = require("node:test");
const assert = require("node:assert");
const { Suite } = require("../lib/index");

describe("managed benchmarks", async () => {
	it("should throw when timer.start isn't called", () => {
		const suite = new Suite({ reporter: () => {} });
		assert.rejects(
			async () => {
				suite.add("managed", (timer) => {});
				await suite.run();
			},
			{
				message: "You forgot to call .start()",
			},
		);
	});

	it("should throw when timer.end isn't called", () => {
		const suite = new Suite({ reporter: () => {} });
		assert.rejects(
			async () => {
				suite.add("managed", (timer) => {
					timer.start();
				});
				await suite.run();
			},
			{
				message: "You forgot to call .end(count)",
			},
		);
	});
});
