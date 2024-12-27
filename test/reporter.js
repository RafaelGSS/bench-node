const { describe, it, before } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");

const { Suite, chartReport, htmlReport, jsonReport } = require("../lib");

describe("chartReport outputs benchmark results as a bar chart", async (t) => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		const suite = new Suite({
			reporter: chartReport,
		});

		suite
			.add("single with matcher", () => {
				const pattern = /[123]/g;
				const replacements = { 1: "a", 2: "b", 3: "c" };
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject.replace(pattern, (m) => replacements[m]);
				assert.ok(r);
			})
			.add("multiple replaces", () => {
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject
					.replace(/1/g, "a")
					.replace(/2/g, "b")
					.replace(/3/g, "c");
				assert.ok(r);
			});
		await suite.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should include bar chart chars", () => {
		assert.ok(output.includes("█"));
	});

	it("should include ops/sec", () => {
		assert.ok(output.includes("ops/sec"));
	});
});

describe("htmlReport should create a file", async (t) => {
	let output = "";
	let htmlName = "";
	let htmlContent = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		const originalWriteFileSync = fs.writeFileSync;

		fs.writeFileSync = (name, content) => {
			htmlName = name;
			htmlContent = content;
		};

		process.stdout.write = (data) => {
			output += data;
		};

		const suite = new Suite({
			reporter: htmlReport,
		});

		suite
			.add("single with matcher", () => {
				const pattern = /[123]/g;
				const replacements = { 1: "a", 2: "b", 3: "c" };
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject.replace(pattern, (m) => replacements[m]);
				assert.ok(r);
			})
			.add("Multiple replaces", () => {
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject
					.replace(/1/g, "a")
					.replace(/2/g, "b")
					.replace(/3/g, "c");
				assert.ok(r);
			});
		await suite.run();

		fs.writeFileSync = originalWriteFileSync;
		process.stdout.write = originalStdoutWrite;
	});

	it("should print that a HTML file has been generated", () => {
		assert.ok(output.includes("HTML file has been generated"));
	});

	it("htmlName should be result.html", () => {
		assert.strictEqual(htmlName, "result.html");
	});

	it("htmlContent should not be empty", () => {
		assert.ok(htmlContent.length > 100);
	});

	it("htmlContent bench suite should be used as class name", () => {
		assert.ok(htmlContent.includes("circle-Multiple-replaces"));
		assert.ok(htmlContent.includes("circle-single-with-matcher"));
	});

	it("htmlContent should not contain replace tags {{}}", () => {
		assert.ok(htmlContent.includes("{{") === false);
		assert.ok(htmlContent.includes("}}") === false);
	});
});

describe("jsonReport should produce valid JSON output", async () => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		// Create a new Suite with the JSON reporter
		const suite = new Suite({
			reporter: jsonReport,
		});

		suite
			.add("single with matcher", () => {
				const pattern = /[123]/g;
				const replacements = { 1: "a", 2: "b", 3: "c" };
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject.replace(pattern, (m) => replacements[m]);
				assert.ok(r);
			})
			.add("Multiple replaces", () => {
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject
					.replace(/1/g, "a")
					.replace(/2/g, "b")
					.replace(/3/g, "c");
				assert.ok(r);
			});

		// Run the suite
		await suite.run();

		// Restore stdout
		process.stdout.write = originalStdoutWrite;
	});

	it("should print valid JSON", () => {
		// Verify if the output can be parsed as JSON
		let data;
		try {
			data = JSON.parse(output);
		} catch (err) {
			assert.fail(`Output is not valid JSON: ${err.message}`);
		}

		assert.ok(Array.isArray(data), "Output should be an array of results");
	});

	it("should contain the required benchmark fields", () => {
		const data = JSON.parse(output);

		// We expect the two benchmarks we added: 'single with matcher' and 'Multiple replaces'
		assert.strictEqual(data.length, 2, "Should have results for 2 benchmarks");

		for (const entry of data) {
			// Ensure each entry has expected keys
			assert.ok(typeof entry.name === "string", "name should be a string");
			assert.ok(typeof entry.opsSec === "number", "opsSec should be a number");
			assert.ok(
				typeof entry.runsSampled === "number",
				"runsSampled should be a number",
			);
			assert.ok(
				typeof entry.min === "string",
				"min should be a string (formatted time)",
			);
			assert.ok(
				typeof entry.max === "string",
				"max should be a string (formatted time)",
			);
			assert.ok(Array.isArray(entry.plugins), "plugins should be an array");
		}
	});
});
