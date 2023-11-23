/**
 * @callback validateNumber
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

import { ArrayIsArray, NumberIsInteger, NumberIsNaN, NumberMAX_SAFE_INTEGER, NumberMIN_SAFE_INTEGER } from './primordials.mjs';

/**
 * @callback validateInteger
 * @param {*} value
 * @param {string} name
 * @param {number} [min]
 * @param {number} [max]
 * @returns {asserts value is number}
 */

/** @type {validateInteger} */
export function validateInteger(value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) {
  if (typeof value !== 'number')
    throw new Error(`value must be a number, name: ${name}, value: ${value}`);
  if (!NumberIsInteger(value))
    throw new Error(`value must be an integer, name: ${name}, value: ${value}`);
  if (value < min || value > max)
    throw new Error(`value must be >= ${min} && <= ${max}, name: ${name}, value: ${value}`);
}

/** @type {validateNumber} */
export function validateNumber(value, name, min = undefined, max) {
  if (typeof value !== 'number')
    throw new Error(`value must be a number, name: ${name}, value: ${value}`);

  if ((min != null && value < min) || (max != null && value > max) ||
    ((min != null || max != null) && NumberIsNaN(value))) {
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
export function validateObject(value, name, options = kValidateObjectNone) {
  if (options === kValidateObjectNone) {
    if (value === null || ArrayIsArray(value)) {
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

    if (throwOnArray && ArrayIsArray(value)) {
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
export function validateFunction(value, name) {
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
export function validateString(value, name) {
  if (typeof value !== 'string')
    throw new Error(`value must be a string, name: ${name}, value: ${value}`);
}
