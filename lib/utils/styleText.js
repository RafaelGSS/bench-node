const util = require("node:util");

module.exports.styleText =
	typeof util.styleText === "function"
		? util.styleText
		: (_style, text) => text;
