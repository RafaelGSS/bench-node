const { describe, it, before } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");

const {
	Suite,
	chartReport,
	htmlReport,
	jsonReport,
	csvReport,
	prettyReport,
	textReport,
} = require("../lib");

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

	it("should include benchmark names", () => {
		assert.ok(output.includes("single with matcher"));
		assert.ok(output.includes("multiple replaces"));
	});

	it("should include sample count", () => {
		assert.ok(output.includes("samples"));
	});

	it("should include Node.js version", () => {
		const regex = /Node\.js version: v\d+\.\d+\.\d+/;

		assert.ok(output.match(regex));
	});
});

describe("chartReport respects reporterOptions.printHeader", async (t) => {
	let outputWithHeader = "";
	let outputWithoutHeader = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;

		// Test with default settings (printHeader: true)
		process.stdout.write = (data) => {
			outputWithHeader += data;
		};

		const suiteWithHeader = new Suite({
			reporter: chartReport,
			reporterOptions: {
				printHeader: true,
			},
		});

		suiteWithHeader.add("test benchmark", () => {
			const a = 1 + 1;
			assert.strictEqual(a, 2);
		});
		await suiteWithHeader.run();

		// Test with printHeader: false
		outputWithoutHeader = "";
		process.stdout.write = (data) => {
			outputWithoutHeader += data;
		};

		const suiteWithoutHeader = new Suite({
			reporter: chartReport,
			reporterOptions: {
				printHeader: false,
			},
		});

		suiteWithoutHeader.add("test benchmark", () => {
			const a = 1 + 1;
			assert.strictEqual(a, 2);
		});
		await suiteWithoutHeader.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should include Node.js version when printHeader is true", () => {
		const regex = /Node\.js version: v\d+\.\d+\.\d+/;
		assert.ok(outputWithHeader.match(regex));
	});

	it("should include Platform when printHeader is true", () => {
		assert.ok(outputWithHeader.includes("Platform:"));
	});

	it("should include CPU Cores when printHeader is true", () => {
		assert.ok(outputWithHeader.includes("CPU Cores:"));
	});

	it("should NOT include Node.js version when printHeader is false", () => {
		const regex = /Node\.js version: v\d+\.\d+\.\d+/;
		assert.ok(!outputWithoutHeader.match(regex));
	});

	it("should NOT include Platform when printHeader is false", () => {
		assert.ok(!outputWithoutHeader.includes("Platform:"));
	});

	it("should NOT include CPU Cores when printHeader is false", () => {
		assert.ok(!outputWithoutHeader.includes("CPU Cores:"));
	});

	it("should still include benchmark data with or without header", () => {
		// Both outputs should still have benchmark bars and results
		assert.ok(outputWithHeader.includes("█"));
		assert.ok(outputWithoutHeader.includes("█"));
		assert.ok(outputWithHeader.includes("test benchmark"));
		assert.ok(outputWithoutHeader.includes("test benchmark"));
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

describe("prettyReport outputs a beautiful report", async (t) => {
	let output = "";
	// biome-ignore lint/suspicious/noControlCharactersInRegex: This is required to strip ANSI color codes from the output for testing.
	const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		const suite = new Suite({
			reporter: prettyReport,
		});

		suite
			.add("suite/single with matcher", () => {
				const pattern = /[123]/g;
				const replacements = { 1: "a", 2: "b", 3: "c" };
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject.replace(pattern, (m) => replacements[m]);
				assert.ok(r);
			})
			.add("suite/multiple replaces", () => {
				const subject = "123123123123123123123123123123123123123123123123";
				const r = subject
					.replace(/1/g, "a")
					.replace(/2/g, "b")
					.replace(/3/g, "c");
				assert.ok(r);
			})
			.add("suite/nested/deeper/test", () => {
				assert.ok(true);
			});
		await suite.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should include system information", () => {
		assert.ok(output.includes("System Information:"));
		assert.ok(output.includes("Node.js:"));
		assert.ok(output.includes("OS:"));
		assert.ok(output.includes("CPU:"));
	});

	it("should include benchmark results header", () => {
		assert.ok(output.includes("Benchmark results"));
	});

	it("should include tree structure characters", () => {
		assert.ok(output.includes("└─"));
		assert.ok(output.includes("├─"));
	});

	it("should correctly group tests with slashes", () => {
		const stripped = stripAnsi(output);
		assert.ok(stripped.includes("suite"));
		assert.ok(stripped.includes("single with matcher"));
		assert.ok(stripped.includes("multiple replaces"));
		assert.ok(stripped.includes("nested"));
		assert.ok(stripped.includes("deeper"));
		assert.ok(stripped.includes("test"));
	});
});

describe("prettyReport shows baseline comparisons", async (t) => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		// Create a new Suite with the pretty reporter
		const suite = new Suite({
			reporter: prettyReport,
		});

		// Add benchmarks with one being the baseline
		suite
			.add("baseline-test", { baseline: true }, () => {
				// Medium-speed operation
				for (let i = 0; i < 1000; i++) {}
			})
			.add("faster-test", () => {
				// Faster operation
				for (let i = 0; i < 100; i++) {}
			})
			.add("slower-test", () => {
				// Slower operation
				for (let i = 0; i < 10000; i++) {}
			});

		// Run the suite
		await suite.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should include a summary section", () => {
		assert.ok(output.includes("Summary (vs. baseline):"));
	});

	it("should show 'faster' comparison in summary", () => {
		const summary = output.split("Summary (vs. baseline):")[1];
		assert.ok(summary.includes("faster"));
	});

	it("should show 'slower' comparison in summary", () => {
		const summary = output.split("Summary (vs. baseline):")[1];
		assert.ok(summary.includes("slower"));
	});
});

describe("textReport shows baseline comparisons", async (t) => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		// Create a new Suite with the text reporter
		const suite = new Suite({
			reporter: textReport,
		});

		// Add benchmarks with one being the baseline
		suite
			.add("baseline-test", { baseline: true }, () => {
				// Medium-speed operation
				for (let i = 0; i < 1000; i++) {}
			})
			.add("faster-test", () => {
				// Faster operation
				for (let i = 0; i < 100; i++) {}
			})
			.add("slower-test", () => {
				// Slower operation
				for (let i = 0; i < 10000; i++) {}
			});

		// Run the suite
		await suite.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should include a summary section", () => {
		assert.ok(output.includes("Summary (vs. baseline):"));
	});

	it("should show 'faster' comparison in summary", () => {
		const summary = output.split("Summary (vs. baseline):")[1];
		assert.ok(summary.includes("faster"));
	});

	it("should show 'slower' comparison in summary", () => {
		const summary = output.split("Summary (vs. baseline):")[1];
		assert.ok(summary.includes("slower"));
	});
});

describe("Suite with pretty: true option", async (t) => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		const suite = new Suite({
			pretty: true,
		});

		suite.add("test", () => {});
		await suite.run();

		process.stdout.write = originalStdoutWrite;
	});

	it("should use the pretty reporter", () => {
		assert.ok(output.includes("System Information:"));
	});
});

describe("custom reporter should have access to histogram data", async () => {
	let output = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		process.stdout.write = (data) => {
			output += data;
		};

		function customReporter(results) {
			const json = [];
			for (const result of results) {
				// Calculate the median of result.histogram.sampleData:
				const sorted = [...result.histogram.sampleData].sort((a, b) => a - b);
				const median =
					sorted.length % 2 === 0
						? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
						: sorted[Math.floor(sorted.length / 2)];

				json.push({
					name: result.name,
					low: result.histogram.sampleData.filter((v) => v <= median),
					high: result.histogram.sampleData.filter((v) => v >= median),
					median,
				});
			}
			console.log(JSON.stringify(json, null, 2));
		}

		// Create a new Suite with the custom reporter
		const suite = new Suite({
			reporter: customReporter,
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

	it("should calculate median correctly", () => {
		const data = JSON.parse(output);
		for (const result of data) {
			assert.strictEqual(
				result.low.length,
				result.high.length,
				"Same number of samples above and below median",
			);
		}
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

describe("csvReport", () => {
	it("should generate valid CSV output", async (t) => {
		const fn = t.mock.method(process.stdout, "write");

		// noop
		fn.mock.mockImplementation(() => {});

		csvReport([
			{
				opsSec: 749625.5652171721,
				iterations: 374813,
				histogram: {
					samples: 10,
					min: 1322.2615873857162,
					max: 1345.4275821344213,
				},
				name: "single with matcher",
				plugins: [
					{
						name: "V8NeverOptimizePlugin",
						result: "enabled",
						report: "v8-never-optimize=true",
					},
				],
			},
			{
				opsSec: 634284.7401772924,
				iterations: 317148,
				histogram: {
					samples: 11,
					min: 1552.562466504839,
					max: 1612.7852084972462,
				},
				name: "Multiple replaces",
				plugins: [
					{
						name: "V8NeverOptimizePlugin",
						result: "enabled",
						report: "v8-never-optimize=true",
					},
				],
			},
		]);

		const callArgs = process.stdout.write.mock.calls.map(
			(call) => call.arguments[0],
		);

		assert.strictEqual(process.stdout.write.mock.callCount(), 13);
		assert.deepStrictEqual(callArgs, [
			"name,ops/sec,samples,plugins,min,max\n",
			"single with matcher,",
			'"749,626",',
			"10,",
			'"v8-never-optimize=true",',
			"1.32us,",
			"1.35us\n",
			"Multiple replaces,",
			'"634,285",',
			"11,",
			'"v8-never-optimize=true",',
			"1.55us,",
			"1.61us\n",
		]);
	});
});
