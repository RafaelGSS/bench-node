const { Suite } = require("../../lib");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const suite = new Suite();

const sampleFile = resolve(__dirname, "sample-file.txt");

suite
	.add("readFileSync", () => {
		const r = readFileSync(sampleFile);
	})
	.add("readFileSync utf-8", () => {
		const r = readFileSync(sampleFile, "utf-8");
	})
	.add("[Managed] readFileSync", (timer) => {
		const { readFileSync } = require("node:fs");
		const { resolve } = require("node:path");
		const assert = require("node:assert");

		const sampleFile = resolve(__dirname, "sample-file.txt");
		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = readFileSync(sampleFile);
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.add("[Managed] readFileSync utf-8", (timer) => {
		const { readFileSync } = require("node:fs");
		const { resolve } = require("node:path");
		const assert = require("node:assert");

		const sampleFile = resolve(__dirname, "sample-file.txt");
		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = readFileSync(sampleFile, "utf-8");
		}
		timer.end(timer.count);

		assert.ok(r);
	})

	.run();
