const { Suite } = require("../../lib");

const suite = new Suite();

suite
	.add("readFile", async (timer) => {
		const { readFile } = require("node:fs/promises");
		const { resolve } = require("node:path");
		const assert = require("node:assert");

		const sampleFile = resolve(__dirname, "sample-file.txt");
		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = await readFile(sampleFile);
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.add("readFile utf-8", async (timer) => {
		const { readFile } = require("node:fs/promises");
		const { resolve } = require("node:path");
		const assert = require("node:assert");

		const sampleFile = resolve(__dirname, "sample-file.txt");
		let r;

		timer.start();
		for (let i = 0; i < timer.count; i++) {
			r = await readFile(sampleFile, "utf-8");
		}
		timer.end(timer.count);

		assert.ok(r);
	})
	.run();
