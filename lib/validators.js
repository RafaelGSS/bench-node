/**
 * @callback validateNumber
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/**
 * @callback validateInteger
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInteger} */
function validateInteger(value, name, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'number')
    throw new Error(`value must be a number, name: ${name}, value: ${value}`);
  if (!Number.isInteger(value))
    throw new Error(`value must be an integer, name: ${name}, value: ${value}`);
  if (value < min || value > max)
    throw new Error(`value must be >= ${min} && <= ${max}, name: ${name}, value: ${value}`);
}

/** @type {validateNumber} */
function validateNumber(value, name, min = undefined, max) {
  if (typeof value !== 'number')
    throw new Error(`value must be a number, name: ${name}, value: ${value}`);

  if ((min != null && value < min) || (max != null && value > max) ||
    ((min != null || max != null) && Number.isNaN(value))) {
    throw new Error(`value must be ${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}, name: ${name}, value: ${value}`);
  }
}

const kValidateObjectNone = 0;
const kValidateObjectAllowNullable = 1 << 0;
const kValidateObjectAllowArray = 1 << 1;
const kValidateObjectAllowFunction = 1 << 2;

/**
 * @callback validateObject
 * @param {*} value
 * @param {string} name
 * @param {number} [options]
 */

/** @type {validateObject} */
function validateObject(value, name, options = kValidateObjectNone) {
  if (options === kValidateObjectNone) {
    if (value === null || Array.isArray(value)) {
      throw new Error(`value must be an object, name: ${name}, value: ${value}`);
    }

    if (typeof value !== 'object') {
      throw new Error(`value must be an object, name: ${name}, value: ${value}`);
    }
  } else {
    const throwOnNullable = (kValidateObjectAllowNullable & options) === 0;

    if (throwOnNullable && value === null) {
      throw new Error(`value must be an object, name: ${name}, value: ${value}`);
    }

    const throwOnArray = (kValidateObjectAllowArray & options) === 0;

    if (throwOnArray && Array.isArray(value)) {
      throw new Error(`value must be an object, name: ${name}, value: ${value}`);
    }

    const throwOnFunction = (kValidateObjectAllowFunction & options) === 0;
    const typeofValue = typeof value;

    if (typeofValue !== 'object' && (throwOnFunction || typeofValue !== 'function')) {
      throw new Error(`value must be an object, name: ${name}, value: ${value}`);
    }
  }
}

/**
 * @callback validateFunction
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is Function}
 */

/** @type {validateFunction} */
function validateFunction(value, name) {
  if (typeof value !== 'function')
    throw new Error(`value must be a function, name: ${name}, value: ${value}`);
}

/**
 * @callback validateString
 * @param {*} value
 * @param {string} name
 * @returns {asserts value is string}
 */

/** @type {validateString} */
function validateString(value, name) {
  if (typeof value !== 'string')
    throw new Error(`value must be a string, name: ${name}, value: ${value}`);
}

module.exports = {
  validateFunction,
  validateInteger,
  validateNumber,
  validateObject,
  validateString,
};
