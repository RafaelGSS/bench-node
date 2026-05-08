class V8NeverOptimizePlugin {
	isSupported() {
		try {
			new Function("%NeverOptimizeFunction(() => {})")();

			return true;
		} catch (e) {
			return false;
		}
	}

	beforeClockTemplate({ bench }) {
		let code = "";

		code += `
function DoNotOptimize(x) {}
// Prevent the benchmark function and result consumer from optimizing or being inlined.
%NeverOptimizeFunction(${bench}.fn);
%NeverOptimizeFunction(DoNotOptimize);
`;
		return [code, "DoNotOptimize"];
	}

	toString() {
		return "V8NeverOptimizePlugin";
	}

	getReport() {
		return "v8-never-optimize=true";
	}
}

module.exports = {
	V8NeverOptimizePlugin,
};
