function checkBitmap(value, bit) {
  return ((value & bit) === bit);
}

function translateStatus(optStatus) {
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

class V8GetOptimizationStatus {
  #optimizationStatuses = [];

  isSupported() {
    try {
      new Function("%GetOptimizationStatus(() => {})")();

      return true;
    } catch (e) {
      return false;
    }
  }

 afterClockTemplate({ bench, context }) {
    let code = '';
    code += `${context}.v8OptimizationStatus = %GetOptimizationStatus(${bench}.fn);\n`;
    return [code];
 }

  onCompleteBenchmark(result) {
    const context = result[2];
    this.#optimizationStatuses.push(context.v8OptimizationStatus);
  }

  toString() {
    return 'V8GetOptimizationStatus';
  }

  getReport() {
    const allAvailableStatus = this.#optimizationStatuses.reduce((acc, v) => acc | v, 0);
    return `v8-opt-status="${translateStatus(allAvailableStatus)}"`;
  }

  getResult() {
    const allAvailableStatus = this.#optimizationStatuses.reduce((acc, v) => acc | v, 0);
    return {
      type: this.toString(),
      optimizationStatuses: translateStatus(allAvailableStatus),
    };
  }
}

module.exports = {
  V8GetOptimizationStatus,
};
