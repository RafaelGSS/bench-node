import type { Histogram } from "node:perf_hooks";
import { expectAssignable, expectNotAssignable, expectType } from "tsd";

import {
	Suite,
	V8GetOptimizationStatus,
	V8NeverOptimizePlugin,
	V8OptimizeOnNextCallPlugin,
	chartReport,
	csvReport,
	htmlReport,
	jsonReport,
	textReport,
} from "..";

import type { BenchNode } from "..";

expectType<BenchNode.Suite>(new Suite());
expectType<BenchNode.Suite>(
	new Suite({
		reporter: textReport,
		benchmarkMode: "ops",
		useWorkers: true,
		plugins: [new V8NeverOptimizePlugin()],
	}),
);
expectType<BenchNode.Suite>(new Suite({ reporter: false }));
expectType<BenchNode.Suite>(new Suite({ reporter: null }));

expectAssignable<BenchNode.SuiteOptions>({});
expectAssignable<BenchNode.SuiteOptions>({ reporter: chartReport });
expectAssignable<BenchNode.SuiteOptions>({ benchmarkMode: "time" });
expectAssignable<BenchNode.SuiteOptions>({ useWorkers: false });
expectAssignable<BenchNode.SuiteOptions>({
	plugins: [new V8GetOptimizationStatus()],
});
expectNotAssignable<BenchNode.SuiteOptions>({ unknownOption: "test" });
expectNotAssignable<BenchNode.SuiteOptions>({ reporter: "not-a-function" });

expectAssignable<BenchNode.BenchmarkOptions>({});
expectAssignable<BenchNode.BenchmarkOptions>({ minTime: 0.1 });
expectAssignable<BenchNode.BenchmarkOptions>({ maxTime: 1 });
expectAssignable<BenchNode.BenchmarkOptions>({ repeatSuite: 2 });
expectAssignable<BenchNode.BenchmarkOptions>({ minSamples: 5 });
expectNotAssignable<BenchNode.BenchmarkOptions>({ minTime: "not-a-number" });

// Test Suite.add method
const suite = new Suite();
expectType<BenchNode.Suite>(
	suite.add("sync benchmark", () => {
		const arr = [];
		for (let i = 0; i < 1000; i++) {
			arr.push(i);
		}
	}),
);
expectType<BenchNode.Suite>(
	suite.add("async benchmark", async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
	}),
);
expectType<BenchNode.Suite>(
	suite.add(
		"benchmark with options",
		{ minTime: 0.1, maxTime: 1, repeatSuite: 2, minSamples: 5 },
		() => {
			/* ... */
		},
	),
);

const managedBenchFn: BenchNode.BenchmarkFunction = (timer) => {
	if (timer) {
		expectType<() => void>(timer.start);
		expectType<number>(timer.count);
		timer.start();
		for (let i = 0; i < timer.count; i++) {
			// some operation
		}
	}
};
expectType<BenchNode.Suite>(suite.add("managed benchmark", managedBenchFn));

// Test Suite.run method
expectType<Promise<BenchNode.BenchmarkResult[]>>(suite.run());

suite.run().then((results) => {
	expectType<BenchNode.BenchmarkResult[]>(results);
	if (results.length > 0) {
		const result = results[0];
		expectType<string>(result.name);
		expectType<number | undefined>(result.opsSec);
		expectType<number[] | undefined>(result.opsSecPerRun);
		expectType<number | undefined>(result.totalTime);
		expectType<number>(result.iterations);
		expectType<Histogram>(result.histogram);
		expectType<Record<string, any> | undefined>(result.plugins);

		if (result.plugins?.V8GetOptimizationStatus) {
			expectType<any>(
				result.plugins.V8GetOptimizationStatus.optimizationStatuses,
			);
		}
	}
});

// Test ReporterFunction
const sampleResults: BenchNode.BenchmarkResult[] = [
	{
		name: "sample",
		iterations: 100,
		histogram: {} as Histogram, // Cast for simplicity in type test
		opsSec: 10000,
		opsSecPerRun: [10000],
		totalTime: 0.1,
		plugins: { MyPlugin: { data: "value" } },
	},
];
expectType<void>(textReport(sampleResults));
expectType<void>(chartReport(sampleResults));
expectType<void>(htmlReport(sampleResults));
expectType<void>(jsonReport(sampleResults));
expectType<void>(csvReport(sampleResults));

// Test Plugins
const plugin1 = new V8NeverOptimizePlugin();
expectAssignable<BenchNode.Plugin>(plugin1);
if (plugin1.isSupported?.()) {
	expectType<boolean>(plugin1.isSupported());
	const varNames: BenchNode.PluginHookVarNames = {
		awaitOrEmpty: "",
		bench: "fn",
		context: {},
		timer: {},
	};
	expectType<string[]>(plugin1.beforeClockTemplate(varNames));
	expectType<string>(plugin1.toString());
}

const plugin2 = new V8GetOptimizationStatus();
expectAssignable<BenchNode.Plugin>(plugin2);
if (plugin2.isSupported?.()) {
	expectType<boolean>(plugin2.isSupported());
	const varNames: BenchNode.PluginHookVarNames = {
		awaitOrEmpty: "",
		bench: "fn",
		context: {},
		timer: {},
	};
	expectType<string[]>(plugin2.beforeClockTemplate(varNames));
	expectType<string[]>(plugin2.afterClockTemplate(varNames));
	if (plugin2.onCompleteBenchmark) {
		expectType<void>(plugin2.onCompleteBenchmark(sampleResults[0]));
	}
	expectType<string>(plugin2.toString());
}

const plugin3 = new V8OptimizeOnNextCallPlugin();
expectAssignable<BenchNode.Plugin>(plugin3);
if (plugin3.isSupported?.()) {
	expectType<boolean>(plugin3.isSupported());
	const varNames: BenchNode.PluginHookVarNames = {
		awaitOrEmpty: "",
		bench: "fn",
		context: {},
		timer: {},
	};
	expectType<string[]>(plugin3.beforeClockTemplate(varNames));
	expectType<string>(plugin3.toString());
}

expectAssignable<BenchNode.Suite>(new Suite());
expectAssignable<BenchNode.V8NeverOptimizePlugin>(new V8NeverOptimizePlugin());
expectAssignable<BenchNode.V8GetOptimizationStatus>(
	new V8GetOptimizationStatus(),
);
expectAssignable<BenchNode.V8OptimizeOnNextCallPlugin>(
	new V8OptimizeOnNextCallPlugin(),
);
