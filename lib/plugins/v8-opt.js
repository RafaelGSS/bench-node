class V8OptimizeOnNextCallPlugin {
	isSupported() {
		try {
			new Function(`
				const fn = () => {};
				%PrepareFunctionForOptimization(fn);
				fn();
				fn();
				%OptimizeFunctionOnNextCall(fn);
				fn();
			`)();

			return true;
		} catch (e) {
			return false;
		}
	}

	beforeClockTemplate({ awaitOrEmpty, bench, timer }) {
		let code = "";

		code += `%PrepareFunctionForOptimization(${bench}.fn);\n`;
		code += `${awaitOrEmpty}${bench}.fn(${timer});\n`;
		code += `${awaitOrEmpty}${bench}.fn(${timer});\n`;
		code += `%OptimizeFunctionOnNextCall(${bench}.fn);\n`;

		return [code];
	}

	getReport() {
		return "v8-optimize-next-call=enabled";
	}

	toString() {
		return "V8OptimizeOnNextCallPlugin";
	}
}

module.exports = {
	V8OptimizeOnNextCallPlugin,
};
