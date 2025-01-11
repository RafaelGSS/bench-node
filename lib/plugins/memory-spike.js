const v8 = require("node:v8");

const translateHeapStats = (stats = []) => {
  const result = {};
  for (const { space_name, space_used_size } of stats) {
    result[space_name] = space_used_size;
  }
  return result;
};

const updateMaxEachKey = (current, update) => {
  for (const key in current) {
    current[key] = Math.max(current[key], update[key]);
  }
};

const diffEachKey = (a, b, divBy = 1) => {
  const result = {};
  for (const key in a) {
    result[key] = (b[key] - a[key]) / divBy;
  }
  return result;
};

const avgEachKey = (items) => {
  const result = {};
  for (const item of items) {
    for (const key in item) {
      result[key] = (result[key] || 0) + item[key];
    }
  }
  for (const key in result) {
    result[key] /= items.length;
  }

  return result;
};

const toHumanReadable = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] > 0) result[key] = `+${(obj[key] / 1024).toFixed(4)} KB`;
  }
  return result;
};

globalThis.__recordMemorySpike = (frequency = 2) => {
  const initial = translateHeapStats(v8.getHeapSpaceStatistics());
  const result = { ...initial };
  const collect = () =>
    updateMaxEachKey(result, translateHeapStats(v8.getHeapSpaceStatistics()));
  const interval = setInterval(collect, frequency);
  return {
    collect,
    getResult: () => {
      clearInterval(interval);
      collect();
      return [initial, result];
    },
  };
};

class RecordMemorySpikePlugin {
  #spikeSamples = {};
  isSupported() {
    try {
      new Function(`gc()`)();
      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate() {
    return [`const __mem_spike__ = __recordMemorySpike();`];
  }
  afterClockTemplate({ context, bench }) {
    return [
      `;
      ${context}.benchName=${bench}.name;
      ${context}.memSpike = __mem_spike__.getResult();
      `,
    ];
  }

  onCompleteBenchmark([_time, iterations, results]) {
    gc();
    const [initial, result] = results.memSpike;
    const diff = diffEachKey(initial, result, iterations);
    if (!this.#spikeSamples[results.benchName]) {
      this.#spikeSamples[results.benchName] = [];
    }
    this.#spikeSamples[results.benchName].push(diff);
  }

  getResult(name) {
    return toHumanReadable(avgEachKey(this.#spikeSamples[name]));
  }

  getReport() { 
    process._rawDebug('grp',arguments);

  }

  toString() {
    return "RecordMemorySpikePlugin";
  }
}
exports.RecordMemorySpikePlugin = RecordMemorySpikePlugin;
