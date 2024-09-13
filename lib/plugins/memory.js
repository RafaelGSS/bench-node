const {
  kStatisticalHistogramRecord,
  StatisticalHistogram,
  kStatisticalHistogramFinish,
} = require('../histogram');

function formatBytes(bytes) {
  if (bytes < 1024)
    return `${ Math.round(bytes) }B`;

  const kbytes = bytes / 1024;
  if (kbytes < 1024)
    return `${ (kbytes, 2).toFixed() }Kb`;

  const mbytes = kbytes / 1024;
  if (mbytes < 1024)
    return `${ (mbytes, 2).toFixed() }MB`;

  const gbytes = mbytes / 1024;
  return `${ (gbytes, 2).toFixed() }GB`;
}

class MemoryPlugin {
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
    if (managed && !MemoryPlugin.#WARNING_REPORTED) {
      MemoryPlugin.#WARNING_REPORTED = true;
      process.emitWarning('The memory statistics can be inaccurate since it will include the tear-up and teardown of your benchmark.')
    }

    let code = '';

    code += `${ contextVar }.${ MemoryPlugin.MEMORY_BEFORE_RUN } = 0;\n`;
    code += `${ contextVar }.${ MemoryPlugin.MEMORY_AFTER_RUN } = 0;\n`;
    code += `${ globalThisVar }.gc();\n`;
    code += `${ contextVar }.${ MemoryPlugin.MEMORY_BEFORE_RUN } = ${ globalThisVar }.process.memoryUsage();\n`;

    return code;
  }

  afterClockTemplate({ globalThisVar, contextVar }) {
    return `${ contextVar }.${ MemoryPlugin.MEMORY_AFTER_RUN } = ${ globalThisVar }.process.memoryUsage();\n`;
  }

  onCompleteClock(result) {
    const realIterations = result[1];
    const context = result[2];

    const heapUsed = context[MemoryPlugin.MEMORY_AFTER_RUN].heapUsed - context[MemoryPlugin.MEMORY_BEFORE_RUN].heapUsed;
    const externalUsed = context[MemoryPlugin.MEMORY_AFTER_RUN].external - context[MemoryPlugin.MEMORY_BEFORE_RUN].external;

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
      proto: null,
      type: 'MemoryPlugin',
      histogram: this.#heapUsedHistogram,
    };
  }
}

module.exports = {
  MemoryPlugin,
};
