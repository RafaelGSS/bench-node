const { Suite } = require("../../lib");
const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");

const suite = new Suite();

const sampleFile = resolve(__dirname, "sample-file.txt");

suite
	.add("readFile", async () => {
		const r = await readFile(sampleFile);
	})
	.add("readFile utf-8", async () => {
		const r = await readFile(sampleFile, "utf-8");
	})
	.add("[managed] readFile", async (timer) => {
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
	.add("[managed] readFile utf-8", async (timer) => {
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
