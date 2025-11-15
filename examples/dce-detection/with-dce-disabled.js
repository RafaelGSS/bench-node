const { Suite } = require("../../lib/index");

// Default behavior - DCE detection is disabled, V8NeverOptimizePlugin is used
// You don't need to set detectDeadCodeElimination: false explicitly
const suite = new Suite();

// These benchmarks will run with V8NeverOptimizePlugin, so they'll be slower
// but more deterministic and won't be optimized away
suite.add("simple addition", () => {
	const result = 1 + 1;
});

suite.add("array creation", () => {
	const arr = new Array(100);
});

suite.run();
