function validateNumber(value, name, min = undefined, max) {
  if (typeof value !== 'number')
    throw new Error(`value must be a number, name: ${name}, value: ${value}`);

  if ((min != null && value < min) || (max != null && value > max) ||
    ((min != null || max != null) && Number.isNaN(value))) {
    throw new Error(`value must be ${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}, name: ${name}, value: ${value}`);
  }
}

function validateObject(value, name) {
  if (value === null || Array.isArray(value)) {
    throw new Error(`value must be an object, name: ${name}, value: ${value}`);
  }

  if (typeof value !== 'object') {
    throw new Error(`value must be an object, name: ${name}, value: ${value}`);
  }
}

function validateFunction(value, name) {
  if (typeof value !== 'function')
    throw new Error(`value must be a function, name: ${name}, value: ${value}`);
}

function validateString(value, name) {
  if (typeof value !== 'string')
    throw new Error(`value must be a string, name: ${name}, value: ${value}`);
}

module.exports = {
  validateFunction,
  validateNumber,
  validateObject,
  validateString,
};
