const { Suite } = require("../../lib");

const suite = new Suite();

const text =
	"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
const regex = /application\/json/;

suite
	.add("Using includes", () => {
		const r = text.includes("application/json");
	})
	.add("Using indexof", () => {
		const r = text.indexOf("application/json") !== -1;
	})
	.add("Using cached RegExp.test", () => {
		const r = regex.test(text);
	})
	.add("[Managed] Using includes", (timer) => {
		const assert = require("node:assert");

		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";

		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = text.includes("application/json");
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.add("[Managed] Using indexof", (timer) => {
		const assert = require("node:assert");

		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";

		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = text.indexOf("application/json") !== -1;
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.add("[Managed] Using cached RegExp.test", (timer) => {
		const assert = require("node:assert");

		const regex = /application\/json/;
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";

		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = regex.test(text);
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.run();
