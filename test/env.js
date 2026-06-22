const { describe, it, before } = require("node:test");
const assert = require("node:assert");
const { Suite } = require("../lib");
const copyBench = require("./fixtures/copy");
const { managedBench, managedOptBench } = require("./fixtures/opt-managed");

function assertMaxBenchmarkDifference(
	results,
	{ percentageLimit, ciPercentageLimit },
) {
	assertBenchmarkDifference(results, {
		percentageLimit,
		ciPercentageLimit,
		greaterThan: false,
	});
}

function getPercentageDifference(opsSec1, opsSec2) {
	const difference = Math.abs(opsSec1 - opsSec2);
	return (difference / Math.min(opsSec1, opsSec2)) * 100;
}

function assertBenchmarkDifference(
	results,
	{ percentageLimit, ciPercentageLimit, greaterThan },
) {
	const limit = process.env.CI ? ciPercentageLimit : percentageLimit;

	for (let i = 0; i < results.length; i++) {
		for (let j = i + 1; j < results.length; j++) {
			const percentageDifference = getPercentageDifference(
				results[i].opsSec,
				results[j].opsSec,
			);

			assert.ok(
				greaterThan
					? percentageDifference >= limit
					: percentageDifference <= limit,
				`"${results[i].name}" too different from "${results[j].name}" - ${percentageDifference} ${greaterThan ? "<" : ">"} ${limit}`,
			);
		}
	}
}

// TODO: on small machines the results are discrepant. Fix it.
if (!process.env.CI) {
	describe("Same benchmark function", () => {
		let results;

		before(async () => {
			results = await copyBench.run();
		});

		it("must have a similar benchmark result", () => {
			assertMaxBenchmarkDifference(results, {
				percentageLimit: 10,
				ciPercentageLimit: 30,
			});
		});
	});
}
describe("Managed can be V8 optimized", () => {
	let optResults;
	let results;

	before(async () => {
		optResults = await managedOptBench.run();
		results = await managedBench.run();
	});

	it("should be faster when V8 can optimize away unused results", () => {
		const deopt = results.find((r) => r.name === "Using includes");
		const opt = optResults.find((r) => r.name === "Using includes");
		const percentageDifference = getPercentageDifference(
			deopt.opsSec,
			opt.opsSec,
		);
		const limit = 10;

		assert.ok(
			percentageDifference >= limit,
			`expected >=${limit}% ops/sec difference with vs without assert.ok, got ${percentageDifference}%`,
		);
	});

	// it('should be similar when avoiding V8 optimizatio', () => {
	//   assertBenchmarkDifference(results, 50, 30);
	// });
});

describe("Workers should have parallel context", () => {
	let results;
	before(async () => {
		const bench = new Suite({
			reporter: () => {},
			useWorkers: true,
			benchmarkMode: "ops",
		});

		bench
			.add("Import with node: prefix", () => {
				return import("node:fs");
			})
			.add("Import without node: prefix", () => {
				return import("node:fs");
			});
		results = await bench.run();
	});

	it("should have a similar result as they will not share import.meta.cache", () => {
		assertMaxBenchmarkDifference(results, {
			percentageLimit: 35,
			ciPercentageLimit: 35,
		});
	});
});
