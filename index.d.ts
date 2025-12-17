// Type definitions for bench-node

/// <reference types="node" />
import type { Histogram } from "node:perf_hooks";

export declare namespace BenchNode {
	class Benchmark {
		name: string;
		fn: any;
		minTime: number;
		maxTime: number;
		plugins: Plugin[];
		repeatSuite: number;
		minSamples: number;
		baseline: boolean;

		constructor(
			name: string,
			fn: any,
			minTime: number,
			maxTime: number,
			plugins: Plugin[],
			repeatSuite: number,
			minSamples: number,
			baseline?: boolean,
		);

		serializeBenchmark(): void;
	}

	interface PluginHookVarNames {
		awaitOrEmpty: string;
		bench: string;
		context: string;
		timer: string;
		managed: boolean;
	}

	interface BenchmarkResult {
		name: string;
		opsSec?: number; // Only in 'ops' mode
		opsSecPerRun?: number[]; // Useful when repeatSuite > 1
		totalTime?: number; // Total execution time in seconds (Only in 'time' mode)
		iterations: number;
		histogram: Histogram;
		plugins?: Record<string, any>; // Object with plugin results
	}

	type ReporterFunction = (results: BenchmarkResult[]) => void;

	interface ReporterOptions {
		printHeader?: boolean;
		labelWidth?: number;
		ttest?: boolean; // Passed automatically when Suite ttest option is enabled
		alpha?: number; // Significance level for t-test (default: 0.05)
	}

	interface SuiteOptions {
		reporter?: ReporterFunction | false | null;
		benchmarkMode?: "ops" | "time";
		useWorkers?: boolean;
		plugins?: Plugin[];
		minSamples?: number; // Minimum number of samples per round for all benchmarks
		repeatSuite?: number; // Number of times to repeat each benchmark (default: 1, or 30 when ttest is enabled)
		ttest?: boolean; // Enable t-test mode for statistical significance (auto-sets repeatSuite=30)
		reporterOptions?: ReporterOptions;
		detectDeadCodeElimination?: boolean; // Enable DCE detection, default: false
		dceThreshold?: number; // DCE detection threshold multiplier, default: 10
	}

	interface BenchmarkOptions {
		minTime?: number; // Minimum duration in seconds
		maxTime?: number; // Maximum duration in seconds
		repeatSuite?: number; // Number of times to repeat benchmark
		minSamples?: number; // Minimum number of samples per round
	}

	type BenchmarkFunction = (timer?: {
		start: () => void;
		end: (iterations?: number) => void;
		count: number;
	}) => void | Promise<void>;

	type OnCompleteBenchmarkResult = [
		duration: number,
		count: number,
		context: Record<string, any>,
	];
	type PluginResult = {
		type: string;
		[key: string]: any;
	};

	interface Plugin {
		isSupported?(): boolean;
		beforeClockTemplate?(varNames: PluginHookVarNames): string[];
		afterClockTemplate?(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark?(
			result: OnCompleteBenchmarkResult,
			bench: Benchmark,
		): void;
		toString?(): string;
		getReport?(benchmarkName: string): string;
		getResult?(benchmarkName: string): PluginResult;
		reset?(): void;
	}

	class Suite {
		constructor(options?: SuiteOptions);
		add(name: string, fn: BenchmarkFunction): this;
		add(name: string, options: BenchmarkOptions, fn: BenchmarkFunction): this;
		run(): Promise<BenchmarkResult[]>;
	}

	class V8NeverOptimizePlugin implements Plugin {
		isSupported(): boolean;
		beforeClockTemplate(varNames: PluginHookVarNames): string[];
		toString(): string;
		getReport(benchmarkName: string): string;
	}

	class V8GetOptimizationStatus implements Plugin {
		isSupported(): boolean;
		afterClockTemplate(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark(result: OnCompleteBenchmarkResult): void;
		toString(): string;
		getReport(benchmarkName: string): string;
		getResult?(benchmarkName: string): PluginResult;
	}

	class V8OptimizeOnNextCallPlugin implements Plugin {
		isSupported(): boolean;
		beforeClockTemplate(varNames: PluginHookVarNames): string[];
		toString(): string;
		getReport(): string;
	}

	class MemoryPlugin implements Plugin {
		isSupported(): boolean;
		beforeClockTemplate(varNames: PluginHookVarNames): string[];
		afterClockTemplate(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark(result: OnCompleteBenchmarkResult): void;
		getReport(benchmarkName: string): string;
		getResult(benchmarkName: string): PluginResult;
		toString(): string;
	}

	class DeadCodeEliminationDetectionPlugin implements Plugin {
		constructor(options?: { threshold?: number });
		isSupported(): boolean;
		setBaseline(timePerOp: number): void;
		onCompleteBenchmark(
			result: OnCompleteBenchmarkResult,
			bench: Benchmark,
		): void;
		getWarning(
			benchmarkName: string,
		): { timePerOp: number; baselineTime: number; ratio: number } | undefined;
		getAllWarnings(): Array<{
			name: string;
			timePerOp: number;
			baselineTime: number;
			ratio: number;
		}>;
		hasWarning(benchmarkName: string): boolean;
		emitWarnings(): void;
		toString(): string;
		reset(): void;
	}
}

export declare const textReport: BenchNode.ReporterFunction;
export declare const chartReport: BenchNode.ReporterFunction;
export declare const prettyReport: BenchNode.ReporterFunction;
export declare const htmlReport: BenchNode.ReporterFunction;
export declare const jsonReport: BenchNode.ReporterFunction;
export declare const csvReport: BenchNode.ReporterFunction;

export declare class Suite extends BenchNode.Suite {}
export declare class V8NeverOptimizePlugin extends BenchNode.V8NeverOptimizePlugin {}
export declare class V8GetOptimizationStatus extends BenchNode.V8GetOptimizationStatus {}
export declare class V8OptimizeOnNextCallPlugin extends BenchNode.V8OptimizeOnNextCallPlugin {}
export declare class MemoryPlugin extends BenchNode.MemoryPlugin {}

// Statistical T-Test utilities
export declare namespace TTest {
	interface WelchTTestResult {
		tStatistic: number;
		degreesOfFreedom: number;
		pValue: number;
		significant: boolean;
		mean1: number;
		mean2: number;
		variance1: number;
		variance2: number;
	}

	interface CompareBenchmarksResult {
		significant: boolean;
		pValue: number;
		confidence: string;
		stars: "***" | "**" | "*" | "";
		difference: "faster" | "slower" | "same";
		tStatistic: number;
		degreesOfFreedom: number;
	}
}

/**
 * Returns significance stars based on p-value thresholds.
 * @param pValue - The p-value from statistical test
 * @returns Stars indicating significance level ('***', '**', '*', or '')
 */
export declare function getSignificanceStars(
	pValue: number,
): "***" | "**" | "*" | "";

/**
 * Performs Welch's t-test for two independent samples.
 * Does not assume equal variances between the samples.
 * @param sample1 - First sample array
 * @param sample2 - Second sample array
 * @returns Test results including t-statistic, degrees of freedom, p-value, and significance
 */
export declare function welchTTest(
	sample1: number[],
	sample2: number[],
): TTest.WelchTTestResult;

/**
 * Determines if two benchmark results are statistically different
 * using Welch's t-test at a given significance level.
 * @param sample1 - Sample data from first benchmark
 * @param sample2 - Sample data from second benchmark
 * @param alpha - Significance level (default 0.05 for 95% confidence)
 * @returns Comparison result with significance info
 */
export declare function compareBenchmarks(
	sample1: number[],
	sample2: number[],
	alpha?: number,
): TTest.CompareBenchmarksResult;

export declare class DeadCodeEliminationDetectionPlugin extends BenchNode.DeadCodeEliminationDetectionPlugin {}
