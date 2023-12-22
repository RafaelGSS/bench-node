const { kStatisticalHistogramRecord, StatisticalHistogram, kStatisticalHistogramFinish } = require('./histogram');

function formatBytes(bytes) {
  if (bytes < 1024)
    return `${ Math.round(bytes) }B`;

  const kbytes = bytes / 1024;
  if (kbytes < 1024)
    return `${ kbytes.toFixed(2) }Kb`;

  const mbytes = kbytes / 1024;
  if (mbytes < 1024)
    return `${ mbytes.toFixed(2) }MB`;

  const gbytes = mbytes / 1024;
  return `${ gbytes.toFixed(2) }GB`;
}

class MemoryEnricher {
  static MEMORY_BEFORE_RUN = 'memoryBeforeRun';
  static MEMORY_AFTER_RUN = 'memoryAfterRun';
  static #WARNING_REPORTED = false;

  /**
   * @type {StatisticalHistogram}
   */
  #heapUsedHistogram;

  constructor() {
    this.reset();
  }

  static isSupported() {
    return typeof globalThis.gc === 'function';
  }

  reset() {
    this.#heapUsedHistogram = new StatisticalHistogram();
  }

  beforeClockTemplate({ managed, globalThisVar, contextVar }) {
    if (managed && !MemoryEnricher.#WARNING_REPORTED) {
      MemoryEnricher.#WARNING_REPORTED = true;
      process.emitWarning('The memory statistics can be inaccurate since it will include the tear-up and teardown of your benchmark.');
    }

    let code = '';

    code += `${ contextVar }.${ MemoryEnricher.MEMORY_BEFORE_RUN } = 0;\n`;
    code += `${ contextVar }.${ MemoryEnricher.MEMORY_AFTER_RUN } = 0;\n`;
    code += `${ globalThisVar }.gc();\n`;
    code += `${ contextVar }.${ MemoryEnricher.MEMORY_BEFORE_RUN } = ${ globalThisVar }.process.memoryUsage();\n`;

    return code;
  }

  afterClockTemplate({ globalThisVar, contextVar }) {
    return `${ contextVar }.${ MemoryEnricher.MEMORY_AFTER_RUN } = ${ globalThisVar }.process.memoryUsage();\n`;
  }

  onCompleteClock(result) {
    const realIterations = result[1];
    const context = result[2];

    const heapUsed = context[MemoryEnricher.MEMORY_AFTER_RUN].heapUsed - context[MemoryEnricher.MEMORY_BEFORE_RUN].heapUsed;
    const externalUsed = context[MemoryEnricher.MEMORY_AFTER_RUN].external - context[MemoryEnricher.MEMORY_BEFORE_RUN].external;

    const memoryAllocated = (heapUsed + externalUsed) / realIterations;

    // below 0, we just coerce to be zero
    this.#heapUsedHistogram[kStatisticalHistogramRecord](Math.max(0, memoryAllocated));
  }

  onCompleteBenchmark() {
    this.#heapUsedHistogram[kStatisticalHistogramFinish]();
  }

  toString() {
    return this.getReport();
  }

  getReport() {
    return `heap usage=${ formatBytes(this.#heapUsedHistogram.mean) } (${ formatBytes(this.#heapUsedHistogram.min) } ... ${ formatBytes(this.#heapUsedHistogram.max) })`;
  }

  getResult() {
    return {
      __proto__: null,
      name: 'MemoryEnricher',
      histogram: this.#heapUsedHistogram,
    };
  }
}

function checkBitmap(value, bit) {
  return ((value & bit) === bit);
}

/**
 * @reference https://github.com/NathanaelA/v8-Natives/blob/3194dcac0bc7786d0933a9c54eec946163aee480/lib/v8-node.js#L78
 */
function printStatus(optStatus) {
  if (optStatus === -1) {
    return 'unknown';
  }

  const optStat = [];
  if (checkBitmap(optStatus, 2)) {
    optStat.push('Never Optimized');
  }
  if (checkBitmap(optStatus, 4)) {
    optStat.push('Always Optimized');
  }
  if (checkBitmap(optStatus, 8)) {
    optStat.push('Maybe Deopted');
  }
  if (checkBitmap(optStatus, 16)) {
    optStat.push('Optimized');
  }
  if (checkBitmap(optStatus, 32)) {
    optStat.push('TurboFanned');
  }
  if (checkBitmap(optStatus, 64)) {
    optStat.push('Interpreted');
  }
  if (checkBitmap(optStatus, 128)) {
    optStat.push('Marked for Optimization');
  }
  if (checkBitmap(optStatus, 256)) {
    optStat.push('Marked for Concurrent Optimization');
  }
  if (checkBitmap(optStatus, 512)) {
    optStat.push('Concurrently Optimizing');
  }
  if (checkBitmap(optStatus, 1024)) {
    optStat.push('Is Executing');
  }
  if (checkBitmap(optStatus, 2048)) {
    optStat.push('Topmost frame is Turbo Fanned');
  }
  if (checkBitmap(optStatus, 4096)) {
    optStat.push('Lite Mode');
  }
  if (checkBitmap(optStatus, 8192)) {
    optStat.push('Marked for de-optimization');
  }

  return optStat.join(', ');
}

class V8OptimizeOnNextCallEnricher {
  static OPTIMIZATION_STATUS = 'optimizationStatus';

  #optimizationStatuses = [];

  static isSupported() {
    try {
      new Function(`%OptimizeFunctionOnNextCall(() => {})`)();

      return true;
    } catch (e) {
      return false;
    }
  }

  reset() {
    this.#optimizationStatuses = [];
  }

  beforeClockTemplate({ awaitOrEmpty, benchVar, contextVar }) {
    let code = '';

    code += `${ contextVar }.${ V8OptimizeOnNextCallEnricher.OPTIMIZATION_STATUS } = 0;\n`;
    code += `%OptimizeFunctionOnNextCall(${ benchVar }.fn);\n`;
    code += `${ awaitOrEmpty }${ benchVar }.fn();\n`;
    code += `${ awaitOrEmpty }${ benchVar }.fn();\n`;

    return code;
  }

  afterClockTemplate({ benchVar, contextVar }) {
    let code = '';

    code += `${ contextVar }.${ V8OptimizeOnNextCallEnricher.OPTIMIZATION_STATUS } = %GetOptimizationStatus(${ benchVar }.fn);\n`;

    return code;
  }

  onCompleteClock(result) {
    const context = result[2];

    this.#optimizationStatuses.push(context[V8OptimizeOnNextCallEnricher.OPTIMIZATION_STATUS]);
  }

  toString() {
    return this.getReport();
  }

  getReport() {
    const allAvailableStatus = this.#optimizationStatuses.reduce((acc, v) => acc | v, 0);

    return `v8-opt-status="${ printStatus(allAvailableStatus) }"`;
  }

  getResult() {
    return {
      __proto__: null,
      name: 'V8OptimizeOnNextCall',
      optimizationStatuses: this.#optimizationStatuses.slice(),
    };
  }
}

class V8NeverOptimizeEnricher {
  static isSupported() {
    try {
      new Function(`%NeverOptimizeFunction(() => {})`)();

      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate({ benchVar }) {
    return `%NeverOptimizeFunction(${ benchVar }.fn);\n`;
  }

  toString() {
    return this.getReport();
  }

  getReport() {
    return `v8-never-optimize=enabled`;
  }

  getResult() {
    return {
      __proto__: null,
      name: 'V8NeverOptimizeEnricher',
    };
  }
}

module.exports = {
  MemoryEnricher,
  V8NeverOptimizeEnricher,
  V8OptimizeOnNextCallEnricher,
};
