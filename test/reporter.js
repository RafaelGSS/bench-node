const { describe, it, before } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const { Suite } = require("../lib");

const {
	chartReport,
	toChart,
	htmlReport,
	jsonReport,
	toJSON,
	csvReport,
	toCSV,
	prettyReport,
	toPretty,
	textReport,
	toText,
} = require("../lib/report");

const { analyze, summarize } = require("../lib/utils/analyze.js");

describe("chartReport", () => {
	describe("outputs benchmark results as a bar chart", async (t) => {
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

	describe("with long names", async (t) => {
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
				.add("single with matcher looooooooooooooooooooooooooong", () => {
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

		it("should pad out benchmark names", () => {
			assert.ok(output.includes("oong ▏█"));
			assert.ok(output.includes("multiple replaces".padEnd(51)));
		});
	});

	describe("respects reporterOptions.printHeader", async (t) => {
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

	it("htmlContent should use index-based element ids", () => {
		assert.ok(htmlContent.includes('id="circle-bench-0"'));
		assert.ok(htmlContent.includes('id="circle-bench-1"'));
		assert.ok(htmlContent.includes('id="label-bench-0"'));
		assert.ok(htmlContent.includes('id="label-bench-1"'));
	});

	it("htmlContent should display the original benchmark names", () => {
		assert.ok(htmlContent.includes("single with matcher("));
		assert.ok(htmlContent.includes("Multiple replaces("));
	});

	it("htmlContent should not contain replace tags {{}}", () => {
		assert.ok(htmlContent.includes("{{") === false);
		assert.ok(htmlContent.includes("}}") === false);
	});
});

describe("htmlReport handles names with special characters", async (t) => {
	let htmlContent = "";

	before(async () => {
		const originalStdoutWrite = process.stdout.write;
		const originalWriteFileSync = fs.writeFileSync;

		fs.writeFileSync = (name, content) => {
			htmlContent = content;
		};
		process.stdout.write = () => {};

		const suite = new Suite({
			reporter: htmlReport,
		});

		suite.add("a/b (c: d) <x> $& </script>", () => {
			assert.ok(true);
		});
		await suite.run();

		fs.writeFileSync = originalWriteFileSync;
		process.stdout.write = originalStdoutWrite;
	});

	it("should style the circle with a valid selector", () => {
		assert.match(
			htmlContent,
			/#circle-bench-0 \{\s*background-color: \w+;\s*top: \d+px;/,
		);
		assert.match(htmlContent, /#label-bench-0 \{\s*top: \d+px;/);
	});

	it("should escape the name in the label", () => {
		assert.ok(
			htmlContent.includes("a/b (c: d) &lt;x&gt; $&amp; &lt;/script&gt;("),
		);
		assert.ok(!htmlContent.includes("<x>"));
	});

	it("should not close the script tag from the embedded data", () => {
		assert.strictEqual(htmlContent.match(/<\/script>/g).length, 1);
		assert.ok(htmlContent.includes("\\u003cx>"));
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

describe("analyze", async (t) => {
	let analysis;

	before(async () => {
		// Create a new Suite with the pretty reporter
		const suite = new Suite({});

		// Add benchmarks with one being the baseline
		suite
			.add("baseline-test", { baseline: true }, () => {
				// Medium-speed operation
				for (let i = 0; i < 10000; i++) {}
			})
			.add("other-test", () => {
				// Faster operation
				for (let i = 0; i < 1000; i++) {}
			})
			.add("faster-test", () => {
				// Slower operation
				for (let i = 0; i < 100; i++) {}
			});

		// Run the suite
		const results = await suite.run();
		analysis = analyze(results, false);
	});

	it("annotates the fastest result", () => {
		assert.equal(analysis[2].fastest, true, "fastest result");
	});

	it("annotates the slowest result", () => {
		assert.equal(analysis[0].slowest, true, "slowest result");
	});
});

describe("summarize", async (t) => {
	let results;

	before(async () => {
		// Create a new Suite with the pretty reporter
		const suite = new Suite({});

		// Add benchmarks with one being the baseline
		suite
			.add("baseline-test", { baseline: true }, () => {
				// Medium-speed operation
				for (let i = 0; i < 10000; i++) {}
			})
			.add("other-test", () => {
				// Faster operation
				for (let i = 0; i < 1000; i++) {}
			})
			.add("faster-test", () => {
				// Slower operation
				for (let i = 0; i < 100; i++) {}
			});

		// Run the suite
		results = await suite.run();
	});

	it("should contain the required benchmark fields", () => {
		const data = summarize(results);

		// We expect the two benchmarks we added: 'single with matcher' and 'Multiple replaces'
		assert.strictEqual(data.length, 3, "Should have results for 3 benchmarks");

		for (const entry of data) {
			// Ensure each entry has expected keys
			assert.ok(typeof entry.name === "string", "name should be a string");
			assert.ok(typeof entry.opsSec === "number", "opsSec should be a number");
			assert.ok(
				typeof entry.runsSampled === "number",
				"runsSampled should be a number",
			);
			assert.ok(typeof entry.min === "number", "min should be a number");
			assert.ok(typeof entry.max === "number", "max should be a number");
			assert.ok(
				typeof entry.minFormatted === "string",
				"minFormatted should be a string (formatted time)",
			);
			assert.ok(
				typeof entry.maxFormatted === "string",
				"maxFormatted should be a string (formatted time)",
			);
			assert.ok(Array.isArray(entry.plugins), "plugins should be an array");
		}
	});
});

describe("time mode reporting", () => {
	it("should format totalTime in text and pretty reports", async () => {
		const suite = new Suite({
			reporter: false,
			benchmarkMode: "time",
		});

		suite.add("time benchmark", { minSamples: 1 }, () => {
			const x = 1 + 1;
		});

		const results = await suite.run();
		const summary = summarize(results);

		assert.strictEqual(typeof summary[0].totalTimeFormatted, "string");
		assert.ok(summary[0].totalTimeFormatted.length > 0);

		const textOutput = toText(results);
		assert.ok(
			textOutput.includes("total time"),
			"text report should include formatted total time",
		);
		assert.ok(
			!textOutput.includes("undefined"),
			"text report should not contain undefined",
		);

		const prettyOutput = toPretty(results);
		assert.ok(
			prettyOutput.includes("total time"),
			"pretty report should include formatted total time",
		);
		assert.ok(
			!prettyOutput.includes("undefined"),
			"pretty report should not contain undefined",
		);
	});
});

describe("time mode with baseline", () => {
	let results;

	before(async () => {
		const suite = new Suite({
			reporter: false,
			benchmarkMode: "time",
		});

		suite
			.add("baseline-test", { baseline: true, minSamples: 1 }, () => {
				const x = 1 + 1;
			})
			.add("other-test", { minSamples: 1 }, () => {
				const x = 2 + 2;
			});

		results = await suite.run();
	});

	it("pretty report should not throw", () => {
		let output;
		assert.doesNotThrow(() => {
			output = toPretty(results);
		});
		assert.ok(output.includes("(baseline)"));
		assert.ok(!output.includes("undefined"));
	});

	it("chart report should not throw", () => {
		let output;
		assert.doesNotThrow(() => {
			output = toChart(results, {});
		});
		assert.ok(output.includes("(baseline)"));
		assert.ok(!output.includes("undefined"));
	});
});

describe("baseline comparisons", async (t) => {
	let results;

	before(async () => {
		// Create a new Suite with the pretty reporter
		const suite = new Suite({});

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
		results = await suite.run();
	});

	describe("analyze", () => {
		let analysis;

		before(() => {
			analysis = analyze(results);
		});

		it("annotates the fastest result", () => {
			assert.equal(results[1].fastest, true, "fastest result");
		});

		it("annotates the slowest result", () => {
			assert.equal(results[2].slowest, true, "slowest result");
		});
	});

	describe("for pretty report", async (t) => {
		let output = "";

		before(async () => {
			output = toPretty(results);
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

	describe("for text Report", async (t) => {
		let output = "";

		before(async () => {
			output = toText(results);
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

	describe("for chart Report", async (t) => {
		let output = "";

		before(async () => {
			output = toChart(results, {});
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

		it("uses the default column width for the name", () => {
			const summary = output.split("Summary (vs. baseline):")[1];
			assert.ok(
				//                123456789012345678901234567890123456789012345 ▏
				summary.includes("baseline-test                                 ▏"),
			);
		});

		it("can adjust the display widths to suite", () => {
			const inputs = [
				{
					iterations: 1635480,
					histogram: {
						samples: 11,
						min: 301.5006542361793,
						max: 313.07250487172166,
						sampleData: [
							301.5006542361793, 301.5593469278305, 302.8870084803949,
							304.6617804001423, 304.71883159667146, 305.0352153017722,
							306.6694294422758, 306.9953128406366, 309.27860394347147,
							310.3016037436935, 313.07250487172166,
						],
					},
					name: "baseline-test",
					baseline: true,
					opsSec: 3268352.671656186,
					opsSecPerRun: [3268352.671656186],
				},
			];

			output = toChart(inputs, { labelWidth: 20, barWidth: 10 });

			const summary = output.split("Summary (vs. baseline):")[1];

			//                          12345678901234567890 ▏1234567890 ▏
			assert.ok(summary.includes("baseline-test        ▏██████████▕ "));
		});
	});

	describe("for chart Report with ttest", () => {
		const makeRuns = (center) =>
			Array.from({ length: 30 }, (_, i) => center + (i % 5) - 2);

		const makeInputs = (baselineRuns, testRuns, testOpsSec) => [
			{
				name: "baseline-test",
				baseline: true,
				opsSec: 100,
				opsSecPerRun: baselineRuns,
				histogram: { samples: baselineRuns.length },
			},
			{
				name: "other-test",
				opsSec: testOpsSec,
				opsSecPerRun: testRuns,
				histogram: { samples: testRuns.length },
			},
		];

		it("should show stars and legend for significant differences", () => {
			const inputs = makeInputs(makeRuns(100), makeRuns(200), 200);
			const output = toChart(inputs, { ttest: true });
			const summary = output.split("Summary (vs. baseline):")[1];
			assert.ok(summary.includes("***"));
			assert.ok(summary.includes("Significance:"));
		});

		it("should not show stars for non-significant differences", () => {
			const runs = makeRuns(100);
			const output = toChart(makeInputs(runs, runs, 101), { ttest: true });
			const summary = output.split("Summary (vs. baseline):")[1];
			assert.ok(summary.includes("faster"));
			assert.ok(!/ \*/.test(summary.split("Significance:")[0]));
			assert.ok(summary.includes("Significance:"));
		});

		it("should not run the t-test without the ttest option", () => {
			const inputs = makeInputs(makeRuns(100), makeRuns(200), 200);
			const output = toChart(inputs, {});
			const summary = output.split("Summary (vs. baseline):")[1];
			assert.ok(!summary.includes("*"));
			assert.ok(!summary.includes("Significance:"));
		});
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

describe("toJSON", () => {
	let results;

	before(async () => {
		const suite = new Suite({});

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
		results = await suite.run();
	});

	it("should run", () => {
		toJSON(results);
	});

	it("should print valid JSON", () => {
		const output = toJSON(results);
		const data = JSON.parse(output);

		assert.ok(Array.isArray(data), "Output should be an array of results");
	});

	it("should contain the required benchmark fields", () => {
		const output = toJSON(results);
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
				typeof entry.minNS === "number",
				"minNS should be a number (time in NS)",
			);
			assert.ok(
				typeof entry.max === "string",
				"max should be a string (formatted time)",
			);
			assert.ok(
				typeof entry.maxNS === "number",
				"maxNS should be a number (time in NS)",
			);
			assert.ok(Array.isArray(entry.plugins), "plugins should be an array");
		}
	});
});

describe("jsonReport", () => {
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
});

describe("toCSV", () => {
	it("should generate valid CSV output", async (t) => {
		const result = toCSV([
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

		assert.deepStrictEqual(
			result,
			"name,ops/sec,samples,plugins,min,max\n" +
				'single with matcher,"749,626",10,"v8-never-optimize=true",1.32us,1.35us\n' +
				'Multiple replaces,"634,285",11,"v8-never-optimize=true",1.55us,1.61us\n',
		);
	});

	it("should escape commas in names and quotes in plugin reports", () => {
		const result = toCSV([
			{
				name: "a,b",
				opsSec: 1,
				histogram: { samples: 1, min: 1, max: 1 },
				plugins: [{ report: 'x="y"' }],
			},
		]);

		assert.strictEqual(
			result,
			"name,ops/sec,samples,plugins,min,max\n" +
				'"a,b","1",1,"x=""y""",0.00us,0.00us\n',
		);
	});

	it("should escape quotes in names", () => {
		const result = toCSV([
			{
				name: 'say "hi"',
				opsSec: 1,
				histogram: { samples: 1, min: 1, max: 1 },
				plugins: [],
			},
		]);

		assert.strictEqual(
			result,
			"name,ops/sec,samples,plugins,min,max\n" +
				'"say ""hi""","1",1,"",0.00us,0.00us\n',
		);
	});

	it("should escape names in time mode", () => {
		const result = toCSV([
			{
				name: "a,b",
				totalTime: 1,
				histogram: { samples: 1, min: 1, max: 1 },
				plugins: [],
			},
		]);

		assert.strictEqual(
			result,
			"name,total time,samples,plugins,min,max\n" +
				'"a,b",1.00 s,1,"",0.00us,0.00us\n',
		);
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

		assert.strictEqual(process.stdout.write.mock.callCount(), 1);
		assert.deepStrictEqual(callArgs, [
			"name,ops/sec,samples,plugins,min,max\n" +
				'single with matcher,"749,626",10,"v8-never-optimize=true",1.32us,1.35us\n' +
				'Multiple replaces,"634,285",11,"v8-never-optimize=true",1.55us,1.61us\n',
		]);
	});
});

describe("plugin reports", () => {
	const results = [
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
				{
					name: "NoReportPlugin",
					result: "enabled",
				},
			],
		},
	];

	it("toText should include plugin reports", () => {
		const output = toText(results);
		assert.ok(
			output.includes("v8-never-optimize=true"),
			"text output should include the plugin report",
		);
		assert.ok(
			output.indexOf("v8-never-optimize=true") < output.indexOf("min..max="),
			"plugin report should come before min..max",
		);
		assert.ok(!output.includes("undefined"));
	});

	it("toJSON should include plugin reports", () => {
		const data = JSON.parse(toJSON(results));
		assert.deepStrictEqual(data[0].plugins, ["v8-never-optimize=true"]);
	});
});

describe("t-test banner", () => {
	const results = [
		{
			opsSec: 1000,
			iterations: 500,
			opsSecPerRun: Array.from({ length: 50 }, () => 1000),
			histogram: { samples: 10, min: 1, max: 2 },
			name: "baseline",
			baseline: true,
			plugins: [],
		},
	];

	it("toText should not hardcode repeatSuite", () => {
		const output = toText(results, { ttest: true });
		assert.ok(output.includes("T-Test Mode: Enabled"));
		assert.ok(!output.includes("repeatSuite=30"));
	});

	it("toPretty should not hardcode repeatSuite", () => {
		const output = toPretty(results, { ttest: true });
		assert.ok(output.includes("T-Test Mode: Enabled"));
		assert.ok(!output.includes("repeatSuite=30"));
	});
});
