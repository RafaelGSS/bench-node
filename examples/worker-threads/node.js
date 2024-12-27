const { Suite } = require("../../lib");

const suite = new Suite({
	useWorkers: true,
});

suite
	.add("Using import without node: prefix", () => import("node:fs"))
	.add("Using import with node: prefix", () => import("node:fs"))
	.run();
