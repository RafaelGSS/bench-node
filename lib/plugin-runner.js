const { validateNumber } = require("./validators");

const AsyncFunction = (async () => {}).constructor;
const SyncFunction = (() => {}).constructor;

class ManagedTimer {
	#endTime;
	#iterations;
	#startTime;

	constructor(count) {
		this.count = count;
	}

	start() {
		this.#startTime = process.hrtime.bigint();
	}

	end(iterations = 1) {
		this.#endTime = process.hrtime.bigint();
		validateNumber(iterations, "iterations", 1);
		this.#iterations = iterations;
	}

	record(context) {
		if (this.#startTime === undefined) {
			throw new Error("You forgot to call .start()");
		}
		if (this.#endTime === undefined) {
			throw new Error("You forgot to call .end(count)");
		}

		const duration = this.#endTime - this.#startTime;
		return context.record({
			duration_ns: duration > 0n ? duration : 1n,
			operations: this.#iterations,
		});
	}
}

function createNativeFnString(benchmark) {
	const varNames = {
		awaitOrEmpty: benchmark.isAsync ? "await " : "",
		bench: "bench",
		context: "context",
		timer: "timer",
		managed: benchmark.hasArg,
	};

	let code = "let context = {};\n";
	let benchmarkCall = benchmark.hasArg
		? `${varNames.awaitOrEmpty}${varNames.bench}.fn(${varNames.timer})`
		: `${varNames.awaitOrEmpty}${varNames.bench}.fn()`;
	const wrappers = [];

	for (const plugin of benchmark.plugins) {
		if (typeof plugin.beforeClockTemplate !== "function") continue;
		const [injectedCode, wrapper] = plugin.beforeClockTemplate(varNames);
		code += injectedCode;
		if (wrapper) wrappers.push(wrapper);
	}

	benchmarkCall = wrappers.reduce(
		(previous, wrapper) => `${wrapper}(${previous})`,
		benchmarkCall,
	);

	if (benchmark.hasArg) {
		code += `${benchmarkCall};\n`;
		code += "const sample = timer.record(nodeContext);\n";
	} else {
		code += "nodeContext.start();\n";
		code += `for (let i = 0; i < count; i++) ${benchmarkCall};\n`;
		code += "const sample = nodeContext.end(count);\n";
	}

	for (const plugin of benchmark.plugins) {
		if (typeof plugin.afterClockTemplate !== "function") continue;
		const [injectedCode] = plugin.afterClockTemplate(varNames);
		code += injectedCode;
	}

	code += "return [sample, context];";
	return code;
}

function createPluginInvoker(benchmark) {
	const FunctionConstructor = benchmark.isAsync ? AsyncFunction : SyncFunction;
	return FunctionConstructor(
		"bench",
		"nodeContext",
		"timer",
		"count",
		benchmark.fnStr,
	);
}

function completePluginSample(benchmark, sample, context) {
	const result = [Number(sample.duration_ns), sample.operations, context];
	for (const plugin of benchmark.plugins) {
		plugin.onCompleteBenchmark?.(result, benchmark);
	}
}

function parsePluginsResult(plugins, name) {
	return plugins.map((plugin) => ({
		name: plugin.toString(),
		result: plugin.getResult?.(name) ?? "enabled",
		report: plugin.getReport?.(name) ?? "",
	}));
}

function resetPlugins(plugins) {
	for (const plugin of plugins) {
		plugin.reset?.();
	}
}

module.exports = {
	ManagedTimer,
	completePluginSample,
	createNativeFnString,
	createPluginInvoker,
	parsePluginsResult,
	resetPlugins,
};
