const { debug, types } = require('node:util');
const path = require('node:path');
const { ManagedTimer, timer, kUnmanagedTimerResult } = require('./timer');
const { Piscina } = require('piscina');

let debugBench = debug('benchmark', (fn) => {
  debugBench = fn;
});

// If the smallest time measurement is 1ns
// the minimum resolution of this timer is 0.5
const MIN_RESOLUTION = 0.5;

const piscina = new Piscina({
  filename: path.resolve(__dirname, 'worker.js')
});

function createRunUnmanagedBenchmark(bench, awaitOrEmpty) {
  const varNames = {
    awaitOrEmpty,
    timer: 'timer',
    context: 'context',
    bench: 'bench',
  };

  let code = `
let i = 0;
let ${varNames.context} = {};
`;

  let benchFnCall = `${awaitOrEmpty}${varNames.bench}.fn()`;
  const wrapFunctions = [];
  for (const p of bench.plugins) {
    if (typeof p.beforeClockTemplate === 'function') {
      const [newCode, functionToCall] = p.beforeClockTemplate(varNames);
      code += newCode;
      if (functionToCall) {
        wrapFunctions.push(functionToCall);
      }
    }
  }
  benchFnCall = wrapFunctions.reduce((prev, n) => {
    return `${n}(${prev})`
  }, benchFnCall);

  code += `
const startedAt = ${varNames.timer}.now();

for (; i < count; i++)
  ${benchFnCall};

const duration = Number(${varNames.timer}.now() - startedAt);
`;

  for (const p of bench.plugins) {
    if (typeof p.afterClockTemplate === 'function') {
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
    timer: 'timer',
    context: 'context',
    bench: 'bench',
  };

  let code = `
let i = 0;
let ${varNames.context} = {};
`;

  let benchFnCall = `${awaitOrEmpty}${varNames.bench}.fn(${varNames.timer})`;
  const wrapFunctions = [];
  for (const p of bench.plugins) {
    if (typeof p.beforeClockTemplate === 'function') {
      [newCode, functionToCall] = p.beforeClockTemplate(varNames);
      code += newCode;
      if (functionToCall) {
        wrapFunctions.push(functionToCall);
      }
    }
  }
  benchFnCall = wrapFunctions.reduce((prev, n) => {
    return `${n}(${prev})`
  }, benchFnCall);

  code += `
${benchFnCall};
const result = ${varNames.timer}[kUnmanagedTimerResult](${varNames.context});
`
  for (const p of bench.plugins) {
    if (typeof p.afterClockTemplate === 'function'){
      [newCode] = p.afterClockTemplate(varNames);
      code += newCode;
    }
  }

  code += 'return result;';
  return code;
}

const AsyncFunction = async function () {
}.constructor;
const SyncFunction = function () {
}.constructor;

function createRunner(bench, recommendedCount) {
  const isAsync = types.isAsyncFunction(bench.fn);
  const hasArg = bench.fn.length >= 1;

  if (bench.fn.length > 1) {
    process.emitWarning(`The benchmark "${ bench.name }" function should not have more than 1 argument.`);
  }

  const compiledFnStringFactory = hasArg ? createRunManagedBenchmark : createRunUnmanagedBenchmark;
  const compiledFnString = compiledFnStringFactory(bench, isAsync ? 'await ' : '');
  const createFnPrototype = isAsync ? AsyncFunction : SyncFunction;
  const compiledFn = createFnPrototype('bench', 'timer', 'count', 'kUnmanagedTimerResult', compiledFnString);

  const selectedTimer = hasArg ? new ManagedTimer(recommendedCount) : timer;

  const runner = compiledFn.bind(globalThis, bench, selectedTimer, recommendedCount, kUnmanagedTimerResult);

  debugBench(`Compiled Code: ${ compiledFnString }`);
  debugBench(`Created compiled benchmark, hasArg=${ hasArg }, isAsync=${ isAsync }, recommendedCount=${ recommendedCount }`);

  return runner;
}

const getFunctionBody = (string) => string.substring(
  string.indexOf("{") + 1,
  string.lastIndexOf("}")
);

async function runInThread(bench, recommendedCount) {
  const isManaged = bench.fn.length >= 1;
  if (isManaged) {
    return piscina.run({
      fn: getFunctionBody(bench.fn.toString()),
      count: recommendedCount,
    }, { name: 'managed' });
  }

  return piscina.run({
    fn: getFunctionBody(bench.fn.toString()),
    count: recommendedCount,
  }, { name: 'unmanaged' });
}

async function clockBenchmark(bench, recommendedCount, thread = false) {
  let result;
  if (thread) {
    debugBench('Running benchmark in threads');
    result = await runInThread(bench, recommendedCount);
    debugBench('Worker Code', result[2]);
  } else {
    const runner = createRunner(bench, recommendedCount);
    result = await runner();
  }

  // Just to avoid issues with empty fn
  result[0] = Math.max(MIN_RESOLUTION, result[0]);
  for (const p of bench.plugins) {
    if (typeof p.onCompleteBenchmark === 'function') {
      p.onCompleteBenchmark(result);
    }
  }

  debugBench(`Took ${ timer.format(result[0]) } to execute ${ result[1] } iterations`);
  return result;
}

module.exports = {
  clockBenchmark,
  timer,
  MIN_RESOLUTION,
  debugBench,
};
