function ERR_INVALID_ARG_TYPE (message) {
  const err = new Error(message);
  err.code = 'ERR_INVALID_ARG_TYPE';
  return err;
}

function ERR_INVALID_ARG_VALUE (message) {
  const err = new Error(message);
  err.code = 'ERR_INVALID_ARG_VALUE';
  return err;
}

function validateNumber(value, name, min = undefined, max) {
  if (typeof value !== 'number')
    throw ERR_INVALID_ARG_TYPE(`value must be a number, name: ${name}, value: ${value}`);

  if ((min != null && value < min) || (max != null && value > max) ||
    ((min != null || max != null) && Number.isNaN(value))) {
    throw ERR_INVALID_ARG_VALUE(`value must be ${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}, name: ${name}, value: ${value}`);
  }
}

function validateObject(value, name) {
  if (value === null || Array.isArray(value)) {
    throw ERR_INVALID_ARG_TYPE(`value must be an object, name: ${name}, value: ${value}`);
  }

  if (typeof value !== 'object') {
    throw ERR_INVALID_ARG_TYPE(`value must be an object, name: ${name}, value: ${value}`);
  }
}

function validateFunction(value, name) {
  if (typeof value !== 'function')
    throw ERR_INVALID_ARG_TYPE(`value must be a function, name: ${name}, value: ${value}`);
}

function validateString(value, name) {
  if (typeof value !== 'string')
    throw ERR_INVALID_ARG_TYPE(`value must be a string, name: ${name}, value: ${value}`);
}

function validateArray(value, name) {
  if (!Array.isArray(value))
    throw ERR_INVALID_ARG_TYPE(`value must be a array, name: ${name}, value: ${value}`);
}

module.exports = {
  validateFunction,
  validateNumber,
  validateObject,
  validateString,
  validateArray,
};
