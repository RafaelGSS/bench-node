const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, it } = require("node:test");

const { Suite } = require("../lib");

describe("node:bench adapter", () => {
	it("normalizes native operation samples into legacy results", async () => {
		let calls = 0;
		const suite = new Suite({ reporter: false, plugins: [] });
		suite.add(
			"native ops",
			{ minTime: 0.00001, maxTime: 0.00002, minSamples: 2 },
			() => {
				calls++;
			},
		);

		const [result] = await suite.run();

		assert.strictEqual(result.name, "native ops");
		assert.ok(result.opsSec > 0);
		assert.deepStrictEqual(result.opsSecPerRun.length, 1);
		assert.ok(result.iterations >= result.histogram.samples);
		assert.ok(result.histogram.samples >= 2);
		assert.strictEqual(
			result.histogram.sampleData.length,
			result.histogram.samples,
		);
		assert.ok(calls >= result.iterations);
	});

	it("supports managed timing through the native context", async () => {
		const suite = new Suite({ reporter: false, plugins: [] });
		suite.add(
			"native managed",
			{ minTime: 0.00001, maxTime: 0.00002, minSamples: 2 },
			(timer) => {
				timer.start();
				for (let i = 0; i < timer.count; i++);
				timer.end(timer.count);
			},
		);

		const [result] = await suite.run();

		assert.ok(result.opsSec > 0);
		assert.ok(result.iterations > 0);
	});

	it("preserves time mode repeats", async () => {
		const suite = new Suite({
			reporter: false,
			plugins: [],
			benchmarkMode: "time",
		});
		suite.add("native time", { repeatSuite: 3, minSamples: 1 }, () => {});

		const [result] = await suite.run();

		assert.strictEqual(result.opsSec, undefined);
		assert.ok(result.totalTime > 0);
		assert.strictEqual(result.histogram.samples, 3);
		assert.strictEqual(result.iterations, 3);
	});

	it("declares Suite benchmarks when launched with --bench", () => {
		const fixture = path.join(__dirname, "fixtures", "native-cli.js");
		const child = spawnSync(
			process.execPath,
			[
				"--no-warnings",
				"--allow-natives-syntax",
				"--bench",
				"--bench-reporter=json",
				fixture,
			],
			{ encoding: "utf8" },
		);

		assert.strictEqual(child.status, 0, child.stderr || child.stdout);
		const records = child.stdout
			.trim()
			.split("\n")
			.filter(Boolean)
			.map((line) => JSON.parse(line));
		const complete = records.filter(
			(record) =>
				record.type === "bench:complete" && record.data.name === "suite cli",
		);

		assert.strictEqual(complete.length, 2, child.stdout);
		assert.ok(complete.every((record) => record.data.samples.length > 0));
		assert.doesNotMatch(child.stdout, /legacy reporter should not run/);
	});
});
