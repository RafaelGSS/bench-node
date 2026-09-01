const { Suite } = require("../../lib");

new Suite({
	reporter: () => {
		if (process.execArgv.includes("--bench")) {
			console.log("legacy reporter should not run under --bench");
		}
	},
	plugins: [],
	useWorkers: process.execArgv.includes("--bench"),
})
	.add(
		"suite cli",
		{ minTime: 0.00001, maxTime: 0.00002, minSamples: 2 },
		() => {
			Math.sqrt(42);
		},
	)
	.add(
		"suite cli",
		{ minTime: 0.00001, maxTime: 0.00002, minSamples: 2 },
		() => {
			Math.sqrt(84);
		},
	)
	.run();
