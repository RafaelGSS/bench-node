// Type definitions for bench-node

export declare namespace BenchNode {
	interface PluginHookVarNames {
		awaitOrEmpty: string;
		bench: string;
		context: string;
		timer: string;
		managed: boolean;
	}

	interface BenchmarkHistogram {
		samples: number;
		min: number;
		max: number;
		sampleData: number[];
	}

	interface BenchmarkPluginResult {
		name: string;
		result: any;
		report: string;
	}

	interface PluginResult {
		type: string;
		[key: string]: any;
	}

	interface BenchmarkMetadata {
		name: string;
		fn: BenchmarkFunction;
		fnStr: string;
		minTime: number;
		maxTime: number;
		plugins: Plugin[];
		repeatSuite: number;
		minSamples: number;
		baseline: boolean;
		hasArg: boolean;
		isAsync: boolean;
	}

	class Benchmark implements BenchmarkMetadata {
		name: string;
		fn: BenchmarkFunction;
		fnStr: string;
		minTime: number;
		maxTime: number;
		plugins: Plugin[];
		repeatSuite: number;
		minSamples: number;
		baseline: boolean;
		hasArg: boolean;
		isAsync: boolean;

		constructor(
			name: string,
			fn: BenchmarkFunction,
			minTime: number,
			maxTime: number,
			plugins: Plugin[],
			repeatSuite: number,
			minSamples: number,
			baseline?: boolean,
		);

		serializeBenchmark(): Record<string, unknown>;
	}

	interface BenchmarkResult {
		name: string;
		opsSec?: number; // Only in 'ops' mode
		opsSecPerRun?: number[]; // Useful when repeatSuite > 1
		totalTime?: number; // Mean execution time in seconds per sample in 'time' mode
		iterations: number;
		histogram: BenchmarkHistogram;
		plugins: BenchmarkPluginResult[];
		baseline: boolean;
	}

	interface ReporterOptions {
		printHeader?: boolean;
		labelWidth?: number;
		ttest?: boolean; // Passed automatically when Suite ttest option is enabled
		alpha?: number; // Significance level for t-test (default: 0.05)
	}

	type ReporterFunction = (
		results: BenchmarkResult[],
		options?: ReporterOptions,
	) => void;

	interface SuiteOptions {
		reporter?: ReporterFunction | false | null;
		benchmarkMode?: "ops" | "time";
		useWorkers?: boolean;
		plugins?: Plugin[];
		minSamples?: number; // Minimum number of samples per round for all benchmarks
		repeatSuite?: number; // Number of times to repeat each benchmark (default: 1, or 30 when ttest is enabled)
		ttest?: boolean; // Enable t-test mode for statistical significance (auto-sets repeatSuite=30)
		pretty?: boolean;
		reporterOptions?: ReporterOptions;
		detectDeadCodeElimination?: boolean; // Enable DCE detection, default: false
		dceThreshold?: number; // DCE detection threshold multiplier, default: 10
	}

	interface BenchmarkOptions {
		minTime?: number; // Minimum duration in seconds
		maxTime?: number; // Maximum duration in seconds
		repeatSuite?: number; // Number of times to repeat benchmark
		minSamples?: number; // Minimum number of timed samples collected per round
		baseline?: boolean;
	}

	type BenchmarkFunction = (timer?: {
		start: () => void;
		end: (iterations?: number) => void;
		count: number;
	}) => void | Promise<void>;

	type OnCompleteBenchmarkResult = [
		duration: number,
		iterations: number,
		context: Record<string, any>,
	];

	interface Plugin {
		isSupported(): boolean;
		beforeClockTemplate?(varNames: PluginHookVarNames): string[];
		afterClockTemplate?(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark?(
			result: OnCompleteBenchmarkResult,
			benchmark: BenchmarkMetadata,
		): void;
		getReport?(benchmarkName: string): string;
		getResult?(benchmarkName: string): any;
		reset?(): void;
		toString(): string;
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
		getReport(benchmarkName: string): string;
		toString(): string;
	}

	class V8GetOptimizationStatus implements Plugin {
		isSupported(): boolean;
		afterClockTemplate(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark(result: OnCompleteBenchmarkResult): void;
		getReport(benchmarkName: string): string;
		getResult(benchmarkName: string): PluginResult;
		reset(): void;
		toString(): string;
	}

	class V8OptimizeOnNextCallPlugin implements Plugin {
		isSupported(): boolean;
		beforeClockTemplate(varNames: PluginHookVarNames): string[];
		getReport(): string;
		toString(): string;
	}

	class MemoryPlugin implements Plugin {
		isSupported(): boolean;
		beforeClockTemplate(varNames: PluginHookVarNames): string[];
		afterClockTemplate(varNames: PluginHookVarNames): string[];
		onCompleteBenchmark(result: OnCompleteBenchmarkResult): void;
		getReport(benchmarkName: string): string;
		getResult(benchmarkName: string): PluginResult;
		reset(): void;
		toString(): string;
	}

	interface DceWarning {
		timePerOp: number;
		baselineTime: number;
		ratio: number;
	}

	class DeadCodeEliminationDetectionPlugin implements Plugin {
		constructor(options?: { threshold?: number });
		isSupported(): boolean;
		setBaseline(timePerOp: number): void;
		onCompleteBenchmark(
			result: OnCompleteBenchmarkResult,
			benchmark: BenchmarkMetadata,
		): void;
		getWarning(benchmarkName: string): DceWarning | undefined;
		getAllWarnings(): Array<DceWarning & { name: string }>;
		hasWarning(benchmarkName: string): boolean;
		emitWarnings(): void;
		reset(): void;
		toString(): string;
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
export declare class DeadCodeEliminationDetectionPlugin extends BenchNode.DeadCodeEliminationDetectionPlugin {}

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
 */
export declare function getSignificanceStars(
	pValue: number,
): "***" | "**" | "*" | "";

/**
 * Performs Welch's t-test for two independent samples.
 */
export declare function welchTTest(
	sample1: number[],
	sample2: number[],
): TTest.WelchTTestResult;

/**
 * Determines if two benchmark results are statistically different.
 */
export declare function compareBenchmarks(
	sample1: number[],
	sample2: number[],
	alpha?: number,
): TTest.CompareBenchmarksResult;
