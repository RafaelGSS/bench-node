/**
 * Creates an error object with ERR_INVALID_ARG_TYPE code
 * @param {string} message - The error message
 * @returns {Error} Error with code ERR_INVALID_ARG_TYPE
 */
function ERR_INVALID_ARG_TYPE(message) {
	const err = new Error(message);
	err.code = "ERR_INVALID_ARG_TYPE";
	return err;
}

/**
 * Creates an error object with ERR_INVALID_ARG_VALUE code
 * @param {string} message - The error message
 * @returns {Error} Error with code ERR_INVALID_ARG_VALUE
 */
function ERR_INVALID_ARG_VALUE(message) {
	const err = new Error(message);
	err.code = "ERR_INVALID_ARG_VALUE";
	return err;
}

/**
 * Validates that a value is a number within an optional range
 * @param {any} value - The value to validate
 * @param {string} name - Name of the parameter being validated
 * @param {number} [min] - Optional minimum value (inclusive)
 * @param {number} [max] - Optional maximum value (inclusive)
 * @throws {Error} If validation fails
 */
function validateNumber(value, name, min, max) {
	if (typeof value !== "number")
		throw ERR_INVALID_ARG_TYPE(
			`value must be a number, name: ${name}, value: ${value}`,
		);

	if (
		(min != null && value < min) ||
		(max != null && value > max) ||
		((min != null || max != null) && Number.isNaN(value))
	) {
		throw ERR_INVALID_ARG_VALUE(
			`value must be ${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}, name: ${name}, value: ${value}`,
		);
	}
}

/**
 * Validates that a value is an object (not null and not an array)
 * @param {any} value - The value to validate
 * @param {string} name - Name of the parameter being validated
 * @throws {Error} If validation fails
 */
function validateObject(value, name) {
	if (value === null || Array.isArray(value)) {
		throw ERR_INVALID_ARG_TYPE(
			`value must be an object, name: ${name}, value: ${value}`,
		);
	}

	if (typeof value !== "object") {
		throw ERR_INVALID_ARG_TYPE(
			`value must be an object, name: ${name}, value: ${value}`,
		);
	}
}

/**
 * Validates that a value is a function
 * @param {any} value - The value to validate
 * @param {string} name - Name of the parameter being validated
 * @throws {Error} If validation fails
 */
function validateFunction(value, name) {
	if (typeof value !== "function")
		throw ERR_INVALID_ARG_TYPE(
			`value must be a function, name: ${name}, value: ${value}`,
		);
}

/**
 * Validates that a value is a string
 * @param {any} value - The value to validate
 * @param {string} name - Name of the parameter being validated
 * @throws {Error} If validation fails
 */
function validateString(value, name) {
	if (typeof value !== "string")
		throw ERR_INVALID_ARG_TYPE(
			`value must be a string, name: ${name}, value: ${value}`,
		);
}

/**
 * Validates that a value is an array
 * @param {any} value - The value to validate
 * @param {string} name - Name of the parameter being validated
 * @throws {Error} If validation fails
 */
function validateArray(value, name) {
	if (!Array.isArray(value))
		throw ERR_INVALID_ARG_TYPE(
			`value must be a array, name: ${name}, value: ${value}`,
		);
}

module.exports = {
	validateFunction,
	validateNumber,
	validateObject,
	validateString,
	validateArray,
};
