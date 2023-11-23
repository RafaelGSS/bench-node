const createPrototypePrimordial = (prototypeFn) => (_this, ...args) => prototypeFn.apply(_this, args);

export const ArrayPrototypePush = createPrototypePrimordial(Array.prototype.push);
export const ArrayPrototypeSort = createPrototypePrimordial(Array.prototype.sort);
export const ArrayPrototypeReduce = createPrototypePrimordial(Array.prototype.reduce);
export const ArrayPrototypeFilter = createPrototypePrimordial(Array.prototype.filter);
export const ArrayIsArray = Array.isArray;
export const FunctionPrototypeBind = createPrototypePrimordial(Function.prototype.bind);
export const MathFloor = Math.floor;
export const MathMin = Math.min;
export const MathMax = Math.max;
export const MathCeil = Math.ceil;
export const MathPow = Math.pow;
export const MathSqrt = Math.sqrt;
export const MathRound = Math.round;
export const NumberMAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
export const NumberPrototypeToFixed = createPrototypePrimordial(Number.prototype.toFixed);
export const NumberIsNaN = Number.isNaN;
