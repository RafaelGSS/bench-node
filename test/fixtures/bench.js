const { Suite } = require("../../lib");

const suite = new Suite();

suite
	.add("empty", () => {})
	.add("empty async", async () => {})
	.run();
