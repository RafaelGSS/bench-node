const { V8OptimizeOnNextCallPlugin } = require("./plugins/v8-opt");
const { V8NeverOptimizePlugin } = require("./plugins/v8-never-opt");

const { V8GetOptimizationStatus } = require("./plugins/v8-print-status");
const { MemoryPlugin } = require("./plugins/memory");

const { validateFunction, validateArray } = require("./validators");

/**
 * Validates that all plugins in the array implement the required plugin interface
 * and that they are supported in the current environment
 * @param {Array<Object>} plugins - Array of plugin objects to validate
 * @throws {Error} If any plugin doesn't meet the requirements or isn't supported
 */
function validatePlugins(plugins) {
	for (const p of plugins) {
		validateFunction(p.isSupported, "Plugins must have a isSupported method.");
		validateFunction(p.toString, "Plugins must have a toString() method.");

		if (!p.isSupported()) {
			throw new Error(`Plugin: ${p.toString()} is not supported.`);
		}

		if (typeof p.beforeClockTemplate === "function") {
			const result = p.beforeClockTemplate({
				bench: "",
				awaitOrEmpty: "",
				context: "",
				timer: "",
			});
			validateArray(result, `${p.toString()}.beforeClockTemplate()`);
		}

		if (typeof p.afterClockTemplate === "function") {
			const result = p.afterClockTemplate({
				bench: "",
				awaitOrEmpty: "",
				context: "",
				timer: "",
			});
			validateArray(result, `${p.toString()}.afterClockTemplate()`);
		}
	}
}

module.exports = {
	MemoryPlugin,
	V8NeverOptimizePlugin,
	V8GetOptimizationStatus,
	V8OptimizeOnNextCallPlugin,
	validatePlugins,
};
