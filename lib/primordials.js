const createPrototypePrimordial = (prototypeFn) => (_this, ...args) => prototypeFn.apply(_this, args);

const ArrayPrototypePush = createPrototypePrimordial(Array.prototype.push);
const ArrayPrototypeSort = createPrototypePrimordial(Array.prototype.sort);
const ArrayPrototypeReduce = createPrototypePrimordial(Array.prototype.reduce);
const ArrayPrototypeFilter = createPrototypePrimordial(Array.prototype.filter);
const ArrayPrototypeMap = createPrototypePrimordial(Array.prototype.map);
const ArrayIsArray = Array.isArray;
const FunctionPrototypeBind = createPrototypePrimordial(Function.prototype.bind);
const MathFloor = Math.floor;
const MathMin = Math.min;
const MathMax = Math.max;
const MathCeil = Math.ceil;
const MathPow = Math.pow;
const MathSqrt = Math.sqrt;
const MathRound = Math.round;
const NumberMAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
const NumberMIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
const NumberPrototypeToFixed = createPrototypePrimordial(Number.prototype.toFixed);
const NumberIsNaN = Number.isNaN;
const NumberIsInteger = Number.isInteger;

module.exports = {
  ArrayPrototypePush,
  ArrayPrototypeSort,
  ArrayPrototypeReduce,
  ArrayPrototypeFilter,
  ArrayPrototypeMap,
  ArrayIsArray,
  FunctionPrototypeBind,
  MathFloor,
  MathMin,
  MathMax,
  MathCeil,
  MathPow,
  MathSqrt,
  MathRound,
  NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER,
  NumberPrototypeToFixed,
  NumberIsNaN,
  NumberIsInteger,
}
