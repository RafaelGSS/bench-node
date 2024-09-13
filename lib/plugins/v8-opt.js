function checkBitmap(value, bit) {
  return ((value & bit) === bit);
}

function printStatus(optStatus) {
  if (optStatus === -1) {
    return 'unknown';
  }

  const optStat = [];
  if (checkBitmap(optStatus, 2)) {
    optStat.push("Never Optimized");
  }
  if (checkBitmap(optStatus, 4)) {
    optStat.push("Always Optimized");
  }
  if (checkBitmap(optStatus, 8)) {
    optStat.push("Maybe Deopted");
  }
  if (checkBitmap(optStatus, 16)) {
    optStat.push("Optimized");
  }
  if (checkBitmap(optStatus, 32)) {
    optStat.push("TurboFanned");
  }
  if (checkBitmap(optStatus, 64)) {
    optStat.push("Interpreted");
  }
  if (checkBitmap(optStatus, 128)) {
    optStat.push("Marked for Optimization");
  }
  if (checkBitmap(optStatus, 256)) {
    optStat.push("Marked for Concurrent Optimization");
  }
  if (checkBitmap(optStatus, 512)) {
    optStat.push("Concurrently Optimizing");
  }
  if (checkBitmap(optStatus, 1024)) {
    optStat.push("Is Executing");
  }
  if (checkBitmap(optStatus, 2048)) {
    optStat.push("Topmost frame is Turbo Fanned");
  }
  if (checkBitmap(optStatus, 4096)) {
    optStat.push("Lite Mode")
  }
  if (checkBitmap(optStatus, 8192)) {
    optStat.push("Marked for de-optimization")
  }

  return optStat.join(', ');
}

class V8OptimizeOnNextCallPlugin {
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

    code += `${ contextVar }.${ V8OptimizeOnNextCallPlugin.OPTIMIZATION_STATUS } = 0;\n`;
    code += `%OptimizeFunctionOnNextCall(${ benchVar }.fn);\n`;
    code += `${ awaitOrEmpty }${ benchVar }.fn();\n`;
    code += `${ awaitOrEmpty }${ benchVar }.fn();\n`;

    return code
  }

  afterClockTemplate({ benchVar, contextVar }) {
    let code = '';

    code += `${ contextVar }.${ V8OptimizeOnNextCallPlugin.OPTIMIZATION_STATUS } = %GetOptimizationStatus(${ benchVar }.fn);\n`;

    return code;
  }

  onCompleteClock(result) {
    const context = result[2];

    this.#optimizationStatuses.push(context[V8OptimizeOnNextCallPlugin.OPTIMIZATION_STATUS]);
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
      proto: null,
      type: 'V8OptimizeOnNextCall',
      optimizationStatuses: this.#optimizationStatuses.slice(),
    };
  }
}

module.exports = {
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin,
};
