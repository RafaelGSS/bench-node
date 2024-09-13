const {
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin
} = require('./plugins/v8-opt');

const {
  MemoryPlugin,
} = require('./plugins/memory');

const supportedPlugins = [
  MemoryPlugin,
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin,
].filter(plugin => plugin.isSupported());

module.exports = {
  MemoryPlugin,
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin,
  supportedPlugins,
};
