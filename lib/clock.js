const { debug, types } = require("node:util");
const { validateNumber } = require("./validators");

let debugBench = debug("benchmark", (fn) => {
	debugBench = fn;
});

const kUnmanagedTimerResult = Symbol("kUnmanagedTimerResult");

// If the smallest time measurement is 1ns
// the minimum resolution of this timer is 0.5
const MIN_RESOLUTION = 0.5;

class Timer {
	constructor() {
		this.now = process.hrtime.bigint;
	}

	get scale() {
		return 1e9;
	}

	get resolution() {
		return 1 / 1e9;
	}

	/**
	 * @param {number} timeInNs
	 * @returns {string}
	 */
	format(timeInNs) {
		validateNumber(timeInNs, "timeInNs", 0);

		if (timeInNs > 1e9) {
			return `${(timeInNs / 1e9).toFixed(2)}s`;
		}

		if (timeInNs > 1e6) {
			return `${(timeInNs / 1e6).toFixed(2)}ms`;
		}

		if (timeInNs > 1e3) {
			return `${(timeInNs / 1e3).toFixed(2)}us`;
		}

		return `${(timeInNs).toFixed(2)}ns`;
	}
}

const timer = new Timer();

class ManagedTimer {
	startTime;
	endTime;
	iterations;
	recommendedCount;

	/**
	 * @param {number} recommendedCount
	 */
	constructor(recommendedCount) {
		this.recommendedCount = recommendedCount;
	}

	/**
	 * Returns the recommended value to be used to benchmark your code
	 * @returns {number}
	 */
	get count() {
		return this.recommendedCount;
	}

	/**
	 * Starts the timer
	 */
	start() {
		this.startTime = timer.now();
	}

	/**
	 * Stops the timer
	 * @param {number} [iterations=1] The amount of iterations that run
	 */
	end(iterations = 1) {
		this.endTime = timer.now();
		validateNumber(iterations, "iterations", 1);
		this.iterations = iterations;
	}

	[kUnmanagedTimerResult](context) {
		if (this.startTime === undefined)
			throw new Error("You forgot to call .start()");

		if (this.endTime === undefined)
			throw new Error("You forgot to call .end(count)");

		return [Number(this.endTime - this.startTime), this.iterations, context];
	}
}

function createRunUnmanagedBenchmark(bench, awaitOrEmpty) {
	const varNames = {
		awaitOrEmpty,
		timer: "timer",
		context: "context",
		bench: "bench",
	};

	let code = `
let i = 0;
let ${varNames.context} = {};
`;

	let benchFnCall = `${awaitOrEmpty}${varNames.bench}.fn()`;
	const wrapFunctions = [];
	for (const p of bench.plugins) {
		if (typeof p.beforeClockTemplate === "function") {
			const [newCode, functionToCall] = p.beforeClockTemplate(varNames);
			code += newCode;
			if (functionToCall) {
				wrapFunctions.push(functionToCall);
			}
		}
	}
	benchFnCall = wrapFunctions.reduce((prev, n) => {
		return `${n}(${prev})`;
	}, benchFnCall);

	code += `
const startedAt = ${varNames.timer}.now();

for (; i < count; i++)
  ${benchFnCall};

const duration = Number(${varNames.timer}.now() - startedAt);
`;

	for (const p of bench.plugins) {
		if (typeof p.afterClockTemplate === "function") {
			[newCode] = p.afterClockTemplate(varNames);
			code += newCode;
		}
	}

	code += `return [duration, count, ${varNames.context}];`;
	return code;
}

function createRunManagedBenchmark(bench, awaitOrEmpty) {
	const varNames = {
		awaitOrEmpty,
		timer: "timer",
		context: "context",
		bench: "bench",
	};

	let code = `
let i = 0;
let ${varNames.context} = {};
`;

	let benchFnCall = `${awaitOrEmpty}${varNames.bench}.fn(${varNames.timer})`;
	const wrapFunctions = [];
	for (const p of bench.plugins) {
		if (typeof p.beforeClockTemplate === "function") {
			[newCode, functionToCall] = p.beforeClockTemplate(varNames);
			code += newCode;
			if (functionToCall) {
				wrapFunctions.push(functionToCall);
			}
		}
	}
	benchFnCall = wrapFunctions.reduce((prev, n) => {
		return `${n}(${prev})`;
	}, benchFnCall);

	code += `
${benchFnCall};
const result = ${varNames.timer}[kUnmanagedTimerResult](${varNames.context});
`;
	for (const p of bench.plugins) {
		if (typeof p.afterClockTemplate === "function") {
			[newCode] = p.afterClockTemplate(varNames);
			code += newCode;
		}
	}

	code += "return result;";
	return code;
}

const AsyncFunction = (async () => {}).constructor;
const SyncFunction = (() => {}).constructor;

function createFnString(bench) {
	const { isAsync, hasArg } = bench;

	const compiledFnStringFactory = hasArg
		? createRunManagedBenchmark
		: createRunUnmanagedBenchmark;
	const compiledFnString = compiledFnStringFactory(
		bench,
		isAsync ? "await " : "",
	);
	return compiledFnString;
}

function createRunner(bench, recommendedCount) {
	const { isAsync, hasArg } = bench;
	const compiledFnString = bench.fnStr;

	const createFnPrototype = isAsync ? AsyncFunction : SyncFunction;
	const compiledFn = createFnPrototype(
		"bench",
		"timer",
		"count",
		"kUnmanagedTimerResult",
		compiledFnString,
	);
	const selectedTimer = hasArg ? new ManagedTimer(recommendedCount) : timer;
	const runner = compiledFn.bind(
		globalThis,
		bench,
		selectedTimer,
		recommendedCount,
		kUnmanagedTimerResult,
	);
	debugBench(`Compiled Code: ${compiledFnString}`);
	debugBench(
		`Created compiled benchmark, hasArg=${hasArg}, isAsync=${isAsync}, recommendedCount=${recommendedCount}`,
	);

	return runner;
}

/**
 * Executes a benchmark and returns the time taken and number of iterations
 * @param {import('./index').Benchmark} bench - The benchmark to execute
 * @param {number} recommendedCount - The recommended number of iterations
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.timeMode=false] - If true, runs the benchmark exactly once
 * @returns {Promise<[number, number]>} - Returns [duration, iterations]
 */
async function clockBenchmark(bench, recommendedCount, options = {}) {
	const runner = createRunner(bench, recommendedCount);
	const result = await runner();

	// Just to avoid issues with empty fn
	result[0] = Math.max(MIN_RESOLUTION, result[0]);

	for (const p of bench.plugins) {
		if (typeof p.onCompleteBenchmark === "function") {
			// TODO: this won't work when useWorkers=true
			p.onCompleteBenchmark(result, bench);
		}
	}

	debugBench(
		`Took ${timer.format(result[0])} to execute ${result[1]} iterations${options.timeMode ? " (time mode)" : ""}`,
	);
	return result;
}

module.exports = {
	clockBenchmark,
	createFnString,
	timer,
	MIN_RESOLUTION,
	debugBench,
};
