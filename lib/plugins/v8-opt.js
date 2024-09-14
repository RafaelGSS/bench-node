class V8OptimizeOnNextCallPlugin {
  static isSupported() {
    try {
      new Function(`%OptimizeFunctionOnNextCall(() => {})`)();

      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate({ awaitOrEmpty, bench }) {
    let code = '';

    code += `%OptimizeFunctionOnNextCall(${ bench }.fn);\n`;
    code += `${ awaitOrEmpty }${ bench }.fn();\n`;
    code += `${ awaitOrEmpty }${ bench }.fn();\n`;

    return [code]
  }

  toString() {
    return 'V8OptimizeOnNextCallPlugin';
  }
}

module.exports = {
  V8OptimizeOnNextCallPlugin,
};
