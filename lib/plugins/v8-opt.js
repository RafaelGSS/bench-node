class V8OptimizeOnNextCallPlugin {
  isSupported() {
    try {
      new Function(`%OptimizeFunctionOnNextCall(() => {})`)();

      return true;
    } catch (e) {
      return false;
    }
  }

  beforeClockTemplate({ awaitOrEmpty, bench, timer }) {
    let code = '';

    code += `%OptimizeFunctionOnNextCall(${ bench }.fn);\n`;
    code += `${ awaitOrEmpty }${ bench }.fn(${timer});\n`;
    code += `${ awaitOrEmpty }${ bench }.fn(${timer});\n`;

    return [code];
  }

  getReport() {
    return 'v8-optimize-next-call=enabled';
  }

  toString() {
    return 'V8OptimizeOnNextCallPlugin';
  }
}

module.exports = {
  V8OptimizeOnNextCallPlugin,
};
