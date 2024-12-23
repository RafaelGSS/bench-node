'use strict';

const { parentPort } = require('worker_threads');
const { runBenchmark } = require('./lifecycle');

// Deserialize the benchmark function
function deserializeBenchmark(benchmark) {
  benchmark.fn = new Function(benchmark.fn);
}

parentPort.on('message', async ({ benchmark, initialIterations, repeatSuite }) => {
  deserializeBenchmark(benchmark);
  const result = await runBenchmark(benchmark, initialIterations, repeatSuite);
  parentPort.postMessage(result);
});
