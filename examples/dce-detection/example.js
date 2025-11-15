const { Suite } = require("../../lib/index");

// Enable DCE detection to catch benchmarks that may be optimized away
const suite = new Suite({
	detectDeadCodeElimination: true,
});

// Example 1: Likely to trigger DCE warning - result not used
suite.add("simple addition (likely DCE)", () => {
	const result = 1 + 1;
	// result is never used - JIT might optimize this away
});

// Example 2: Result is used - should not trigger warning
suite.add("simple addition (used)", () => {
	const result = 1 + 1;
	if (result !== 2) throw new Error("Unexpected result");
});

// Example 3: Array creation without use - likely DCE
suite.add("array creation (likely DCE)", () => {
	const arr = new Array(100);
	// arr is never accessed - might be optimized away
});

// Example 4: Array creation with access - should not trigger warning
suite.add("array creation (accessed)", () => {
	const arr = new Array(100);
	arr[0] = 1; // Using the array
});

// Example 5: Object creation without use - likely DCE
suite.add("object creation (likely DCE)", () => {
	const obj = { x: 1, y: 2, z: 3 };
	// obj is never accessed
});

// Example 6: More realistic computation
suite.add("string operations", () => {
	const str1 = "hello";
	const str2 = "world";
	const result = str1 + " " + str2;
	if (!result.includes("hello")) throw new Error("Missing hello");
});

suite.run();
