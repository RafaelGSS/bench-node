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

	interface SuiteOptions {
		reporter?: ReporterFunction | false | null;
		benchmarkMode?: "ops" | "time";
		useWorkers?: boolean;
		plugins?: Plugin[];
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
