const { kStatisticalHistogramRecord, StatisticalHistogram, kStatisticalHistogramFinish } = require("./histogram");
const { MathRound, NumberPrototypeToFixed } = require('./primordials');

function formatBytes(bytes) {
  if (bytes < 1024)
    return `${ MathRound(bytes) }B`;

  const kbytes = bytes / 1024;
  if (kbytes < 1024)
    return `${ NumberPrototypeToFixed(kbytes, 2) }Kb`;

  const mbytes = kbytes / 1024;
  if (mbytes < 1024)
    return `${ NumberPrototypeToFixed(mbytes, 2) }MB`;

  const gbytes = mbytes / 1024;
  return `${ NumberPrototypeToFixed(gbytes, 2) }GB`;
}

class MemoryEnricher {
  static MEMORY_BEFORE_RUN = 'memoryBeforRun';
  static MEMORY_AFTER_RUN = 'memoryAfterRun';

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
    if (managed) {
      process.emitWarning('The memory statistics can be inaccurate since it will include the tear-up and teardown of your benchmark.')
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
    return `heap usage=${ formatBytes(this.#heapUsedHistogram.mean) } (${ formatBytes(this.#heapUsedHistogram.min) } ... ${ formatBytes(this.#heapUsedHistogram.max) })`;
  }

  getResult() {
    return {
      proto: null,
      type: 'MemoryEnricher',
      histogram: this.#heapUsedHistogram,
    };
  }
}

const supportedEnrichers = [MemoryEnricher].filter(enricher => enricher.isSupported());

module.exports = {
  MemoryEnricher,
  supportedEnrichers,
};
