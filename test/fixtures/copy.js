const { Suite } = require("../../lib");

const suite = new Suite({ reporter: false });

suite
	.add("Using includes", () => {
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
		const r = text.includes("application/json");
	})
	.add("Using includes 2", () => {
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
		const r = text.includes("application/json");
	})
	.add("Using includes 3", () => {
		const text =
			"text/html,application/xhtml+xml,application/xml;application/json;q=0.9,image/avif,image/webp,*/*;q=0.8";
		const r = text.includes("application/json");
	});

module.exports = suite;
