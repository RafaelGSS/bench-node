const {
  V8OptimizeOnNextCallPlugin
} = require('./plugins/v8-opt');

const {
  V8NeverOptimizePlugin
} = require('./plugins/v8-never-opt');

const {
  MemoryPlugin,
} = require('./plugins/memory');

function validatePlugins(plugins) {
  for (p of plugins) {
    if (!typeof p.isSupported === 'function') {
      throw ERR_INVALID_ARG_VALUE('Plugins must have a isSupported method.');
    }
    if (!typeof p.toString() === 'function') {
      throw ERR_INVALID_ARG_VALUE('Plugins must have a toString() method.');
    }

    if (!p.isSupported()) {
      throw new Error(`Plugin: ${p.toString()} is not supported.`);
    }
  }
  // TODO: validate functions returning iterator
}

module.exports = {
  MemoryPlugin,
  V8NeverOptimizePlugin,
  V8OptimizeOnNextCallPlugin,
  validatePlugins,
};
