const { debuglog } = require("node:util");
const { validateNumber } = require("./validators");

const debugBench = debuglog("benchmark");

class Timer {
	constructor() {
		this.now = process.hrtime.bigint;
	}

	get scale() {
		return 1e9;
	}

	get resolution() {
		return 1 / 1e9;
	}

	format(timeInNs) {
		validateNumber(timeInNs, "timeInNs", 0);

		if (timeInNs > 1e9) return `${(timeInNs / 1e9).toFixed(2)}s`;
		if (timeInNs > 1e6) return `${(timeInNs / 1e6).toFixed(2)}ms`;
		if (timeInNs > 1e3) return `${(timeInNs / 1e3).toFixed(2)}us`;
		return `${timeInNs.toFixed(2)}ns`;
	}
}

const timer = new Timer();

module.exports = {
	debugBench,
	timer,
};
