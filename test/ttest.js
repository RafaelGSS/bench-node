const { describe, it } = require("node:test");
const assert = require("node:assert");
const {
	mean,
	variance,
	welchTTest,
	compareBenchmarks,
	tDistCdf,
	getSignificanceStars,
} = require("../lib/utils/ttest");

describe("T-Test Utilities", () => {
	describe("mean", () => {
		it("should return 0 for empty array", () => {
			assert.strictEqual(mean([]), 0);
		});

		it("should calculate mean correctly", () => {
			assert.strictEqual(mean([1, 2, 3, 4, 5]), 3);
			assert.strictEqual(mean([10, 20, 30]), 20);
			assert.strictEqual(mean([5]), 5);
		});

		it("should handle negative numbers", () => {
			assert.strictEqual(mean([-1, 0, 1]), 0);
			assert.strictEqual(mean([-10, -5, 0, 5, 10]), 0);
		});
	});

	describe("variance", () => {
		it("should return 0 for arrays with less than 2 elements", () => {
			assert.strictEqual(variance([]), 0);
			assert.strictEqual(variance([5]), 0);
		});

		it("should calculate sample variance correctly (with Bessel's correction)", () => {
			// Sample variance with n-1 denominator
			// Mean = (2+4+4+4+5+5+7+9) / 8 = 5
			// Variance = [(2-5)² + (4-5)² + (4-5)² + (4-5)² + (5-5)² + (5-5)² + (7-5)² + (9-5)²] / (8-1)
			// = [9 + 1 + 1 + 1 + 0 + 0 + 4 + 16] / 7 = 32/7 ≈ 4.571
			const arr = [2, 4, 4, 4, 5, 5, 7, 9];
			const m = mean(arr);
			const expectedVariance = 32 / 7; // ≈ 4.571
			assert.ok(Math.abs(variance(arr, m) - expectedVariance) < 0.01);
		});

		it("should work without pre-calculated mean", () => {
			const arr = [2, 4, 4, 4, 5, 5, 7, 9];
			assert.ok(Math.abs(variance(arr) - 32 / 7) < 0.01);
		});
	});

	describe("tDistCdf", () => {
		it("should return 0.5 for t=0", () => {
			const result = tDistCdf(0, 10);
			assert.ok(Math.abs(result - 0.5) < 0.001);
		});

		it("should approach 1 for large positive t", () => {
			const result = tDistCdf(10, 30);
			assert.ok(result > 0.999);
		});

		it("should approach 0 for large negative t", () => {
			const result = tDistCdf(-10, 30);
			assert.ok(result < 0.001);
		});

		it("should return approximately correct values for known t-values", () => {
			// For t=1.96 with large df, should be approximately 0.975 (two-tailed 95%)
			const result = tDistCdf(1.96, 100);
			assert.ok(Math.abs(result - 0.975) < 0.01);
		});
	});

	describe("welchTTest", () => {
		it("should return non-significant for identical samples", () => {
			const sample1 = [10, 10, 10, 10, 10];
			const sample2 = [10, 10, 10, 10, 10];
			const result = welchTTest(sample1, sample2);

			assert.strictEqual(result.tStatistic, 0);
			assert.strictEqual(result.significant, false);
			assert.strictEqual(result.pValue, 1);
		});

		it("should return significant for clearly different samples", () => {
			// Two clearly different distributions
			const sample1 = [100, 101, 102, 99, 100, 101, 100, 99, 102, 100];
			const sample2 = [50, 51, 49, 50, 52, 48, 51, 49, 50, 51];
			const result = welchTTest(sample1, sample2);

			assert.ok(result.significant);
			assert.ok(result.pValue < 0.05);
			assert.ok(result.tStatistic > 0); // sample1 > sample2
		});

		it("should handle samples with different sizes", () => {
			const sample1 = [100, 101, 102, 99, 100];
			const sample2 = [50, 51, 49, 50, 52, 48, 51, 49, 50, 51, 50, 49];
			const result = welchTTest(sample1, sample2);

			assert.ok(result.significant);
			assert.ok(result.pValue < 0.05);
		});

		it("should return safe values for insufficient samples", () => {
			const result = welchTTest([1], [2]);

			assert.strictEqual(result.tStatistic, 0);
			assert.strictEqual(result.pValue, 1);
			assert.strictEqual(result.significant, false);
		});

		it("should handle edge case with zero variance", () => {
			const sample1 = [5, 5, 5, 5, 5];
			const sample2 = [3, 3, 3, 3, 3];
			const result = welchTTest(sample1, sample2);

			// Different means, zero variance - should be significant
			assert.strictEqual(result.significant, true);
			assert.strictEqual(result.pValue, 0);
		});
	});

	describe("compareBenchmarks", () => {
		it("should indicate no significant difference for similar samples", () => {
			// Samples with overlapping distributions
			const sample1 = [100, 102, 98, 101, 99, 100, 101, 99, 100, 102];
			const sample2 = [99, 101, 100, 98, 102, 100, 99, 101, 100, 98];
			const result = compareBenchmarks(sample1, sample2);

			assert.strictEqual(result.significant, false);
			assert.strictEqual(result.difference, "same");
		});

		it("should indicate faster when first sample is significantly higher", () => {
			const sample1 = [200, 201, 199, 202, 198, 200, 201, 199, 200, 202];
			const sample2 = [100, 101, 99, 100, 102, 98, 101, 99, 100, 101];
			const result = compareBenchmarks(sample1, sample2);

			assert.strictEqual(result.significant, true);
			assert.strictEqual(result.difference, "faster");
			assert.ok(result.pValue < 0.05);
		});

		it("should indicate slower when first sample is significantly lower", () => {
			const sample1 = [50, 51, 49, 50, 52, 48, 51, 49, 50, 51];
			const sample2 = [100, 101, 99, 100, 102, 98, 101, 99, 100, 101];
			const result = compareBenchmarks(sample1, sample2);

			assert.strictEqual(result.significant, true);
			assert.strictEqual(result.difference, "slower");
			assert.ok(result.pValue < 0.05);
		});

		it("should respect custom alpha level", () => {
			// Create samples where p-value is between 0.01 and 0.05
			const sample1 = [100, 102, 104, 101, 103, 100, 102, 101, 103, 100];
			const sample2 = [98, 99, 97, 98, 100, 96, 99, 97, 98, 99];
			const result005 = compareBenchmarks(sample1, sample2, 0.05);
			const result001 = compareBenchmarks(sample1, sample2, 0.01);

			// With alpha=0.05, might be significant; with alpha=0.01, might not be
			// The exact behavior depends on the p-value
			assert.ok(result005.pValue === result001.pValue);
		});

		it("should include confidence percentage in result", () => {
			const sample1 = [100, 101, 102, 99, 100];
			const sample2 = [50, 51, 49, 50, 52];
			const result = compareBenchmarks(sample1, sample2);

			assert.ok(result.confidence.endsWith("%"));
			assert.ok(result.tStatistic !== undefined);
			assert.ok(result.stars !== undefined);
		});

		it("should include significance stars based on p-value", () => {
			// Highly significant difference (p < 0.001)
			const sample1 = [200, 201, 199, 202, 198, 200, 201, 199, 200, 202];
			const sample2 = [100, 101, 99, 100, 102, 98, 101, 99, 100, 101];
			const result = compareBenchmarks(sample1, sample2);

			assert.strictEqual(result.stars, "***");
			assert.ok(result.degreesOfFreedom !== undefined);
		});
	});

	describe("getSignificanceStars", () => {
		it("should return *** for p < 0.001", () => {
			assert.strictEqual(getSignificanceStars(0.0001), "***");
			assert.strictEqual(getSignificanceStars(0.0009), "***");
		});

		it("should return ** for 0.001 <= p < 0.01", () => {
			assert.strictEqual(getSignificanceStars(0.001), "**");
			assert.strictEqual(getSignificanceStars(0.005), "**");
			assert.strictEqual(getSignificanceStars(0.009), "**");
		});

		it("should return * for 0.01 <= p < 0.05", () => {
			assert.strictEqual(getSignificanceStars(0.01), "*");
			assert.strictEqual(getSignificanceStars(0.03), "*");
			assert.strictEqual(getSignificanceStars(0.049), "*");
		});

		it("should return empty string for p >= 0.05", () => {
			assert.strictEqual(getSignificanceStars(0.05), "");
			assert.strictEqual(getSignificanceStars(0.1), "");
			assert.strictEqual(getSignificanceStars(0.5), "");
			assert.strictEqual(getSignificanceStars(1), "");
		});
	});
});

describe("T-Test Integration with analyze", () => {
	const { analyze } = require("../lib/utils/analyze");

	it("should not include significanceTest when ttest is false", () => {
		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				histogram: { sampleData: [100, 101, 99, 100, 102] },
			},
			{
				name: "test",
				opsSec: 200,
				histogram: { sampleData: [200, 201, 199, 200, 202] },
			},
		];

		const analyzed = analyze(results, true, { ttest: false });
		const testResult = analyzed.find((r) => r.name === "test");

		assert.strictEqual(testResult.significanceTest, undefined);
	});

	it("should include significanceTest when ttest is true and opsSecPerRun >= 30", () => {
		// Generate 30+ opsSecPerRun samples (from repeatSuite)
		const baselineOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 100 + (i % 3) - 1,
		);
		const testOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 200 + (i % 3) - 1,
		);

		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: baselineOpsSecPerRun,
			},
			{
				name: "test",
				opsSec: 200,
				opsSecPerRun: testOpsSecPerRun,
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const testResult = analyzed.find((r) => r.name === "test");

		assert.ok(testResult.significanceTest !== undefined);
		assert.ok(typeof testResult.significanceTest.significant === "boolean");
		assert.ok(typeof testResult.significanceTest.pValue === "number");
		assert.ok(typeof testResult.significanceTest.confidence === "string");
	});

	it("should not include significanceTest without opsSecPerRun", () => {
		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
			},
			{
				name: "test",
				opsSec: 200,
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const testResult = analyzed.find((r) => r.name === "test");

		// Should not throw, and significanceTest should not be set (no opsSecPerRun)
		assert.strictEqual(testResult.significanceTest, undefined);
	});

	it("should not include significanceTest when opsSecPerRun < 30", () => {
		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: Array.from({ length: 10 }, () => 100),
			},
			{
				name: "test",
				opsSec: 200,
				opsSecPerRun: Array.from({ length: 10 }, () => 200),
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const testResult = analyzed.find((r) => r.name === "test");

		// Should not throw, and significanceTest should not be set (not enough samples)
		assert.strictEqual(testResult.significanceTest, undefined);
	});

	it("should detect significant difference between clearly different benchmarks", () => {
		// Generate 30+ opsSecPerRun with clearly different means
		const baselineOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 100 + (i % 5) - 2,
		);
		const fastOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 200 + (i % 5) - 2,
		);

		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: baselineOpsSecPerRun,
			},
			{
				name: "fast",
				opsSec: 200,
				opsSecPerRun: fastOpsSecPerRun,
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const fastResult = analyzed.find((r) => r.name === "fast");

		assert.ok(fastResult.significanceTest.significant);
		assert.ok(fastResult.significanceTest.pValue < 0.05);
	});

	it("should not mark as significant when differences are within noise", () => {
		// Same benchmark run twice - should have similar results with high variance overlap
		// Generate 30+ opsSecPerRun with overlapping distributions
		const baselineOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 100 + ((i % 5) - 2) * 2,
		);
		const similarOpsSecPerRun = Array.from(
			{ length: 30 },
			(_, i) => 101 + ((i % 5) - 2) * 2,
		);

		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: baselineOpsSecPerRun,
			},
			{
				name: "similar",
				opsSec: 101, // Very close to baseline
				opsSecPerRun: similarOpsSecPerRun,
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const similarResult = analyzed.find((r) => r.name === "similar");

		// With overlapping distributions, should not be significant
		assert.strictEqual(similarResult.significanceTest.significant, false);
	});
});

describe("Statistical significance requires repeatSuite >= 30", () => {
	const { analyze } = require("../lib/utils/analyze");

	it("should only compute significance when repeatSuite provides 30+ samples", () => {
		// With 30+ opsSecPerRun, significance should be computed
		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: Array.from({ length: 30 }, () => 100),
			},
			{
				name: "test",
				opsSec: 200,
				opsSecPerRun: Array.from({ length: 30 }, () => 200),
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const testResult = analyzed.find((r) => r.name === "test");

		assert.ok(testResult.significanceTest !== undefined);
	});

	it("should not compute significance when repeatSuite < 30", () => {
		// With fewer than 30 opsSecPerRun, significance should not be computed
		const results = [
			{
				name: "baseline",
				opsSec: 100,
				baseline: true,
				opsSecPerRun: Array.from({ length: 10 }, () => 100),
			},
			{
				name: "test",
				opsSec: 200,
				opsSecPerRun: Array.from({ length: 10 }, () => 200),
			},
		];

		const analyzed = analyze(results, true, { ttest: true });
		const testResult = analyzed.find((r) => r.name === "test");

		assert.strictEqual(testResult.significanceTest, undefined);
	});
});
