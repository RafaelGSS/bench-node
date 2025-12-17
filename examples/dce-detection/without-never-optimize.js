const { Suite } = require("../../lib/index");

// Enable DCE detection - this automatically disables V8NeverOptimizePlugin
// In this mode, V8 optimizations occur naturally and DCE warnings help identify issues
const suite = new Suite({
	detectDeadCodeElimination: true,
});

// Example 1: Likely to trigger DCE warning - result not used
suite.add("simple addition (likely DCE)", () => {
	const result = 1 + 1;
	// result is never used - JIT will optimize this away
});

// Example 2: Result is used - should not trigger warning
suite.add("simple addition (used)", () => {
	const result = 1 + 1;
	if (result !== 2) throw new Error("Unexpected result");
});

// Example 3: Array creation without use - likely DCE
suite.add("array creation (likely DCE)", () => {
	const arr = new Array(100);
	// arr is never accessed - will be optimized away
});

// Example 4: Array creation with access - should not trigger warning
suite.add("array creation (accessed)", () => {
	const arr = new Array(100);
	arr[0] = 1; // Using the array
});

// Example 5: More realistic computation that takes time
suite.add("actual work", () => {
	let sum = 0;
	for (let i = 0; i < 100; i++) {
		sum += Math.sqrt(i);
	}
	if (sum < 0) throw new Error("Impossible");
});

suite.run();
