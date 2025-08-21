/**
 * Assures the provided `value` is not `null`.
 * 
 * @param {any} value The value to be checked if its null.
 * @param {string} name The name of the field to be displayed in the error message.
 */
function notNull(value, name) {
  if (value === null || value === undefined) {
    throw new TypeError(`${name} must not be null or undefined`)
  }
}

/**
 * Assures the provided `value` **is** a string and **is not** empty.
 * 
 * @param {string} value The value to be checked.
 * @param {string} name The name of the field to be displayed in the error message.
 */
function notEmpty(value, name) {
  notNull(value, name)
  check(typeof value === 'string', `${name} must be a string`)
  check(value.trim() !== '', `${name} may not be empty or null`)
}

/**
 * Assures the provided `value` is positive, that is, the value cannot be LESS THAN `0`.
 * 
 * @param {number} value The number to be checked.
 * @param {string} name The name of the field being tested, to display in the error message.
 * @throws {RangeError} If the `value` is less than zero.
 * @throws {TypeError} if the `value` is not of type `number`.
 */
function positive(value, name) {
  notNull(value, name)
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`)
  }

  if (value < 0) {
    throw new RangeError(`${name} must be positive`)
  }
}

/**
 * Assures the `value` is a valid choice (defined by the `choices` parameter).
 * 
 * @template T
 * @param {T} value The value to be checked if it is present in the list of choices.
 * @param  {...T} choices The valid choices.
 */
function checkCase(value, ...choices) {
  notNull(value, 'Value')
  notNull(choices, 'Choices')

  if (choices.length === 0) return false

  if (!choices.includes(value)) {
    throw new Error(`Invalid choice/option: "${value}" IS NOT present in: ${choices.join(', ')}`)
  }
}

/**
 * Assures the `expression` evaluates to `true`, otherwise this method fails.
 * 
 * @param {boolean} expression The expression to be checked.
 * @param {string} message The message of the error (if it fails).
 */
function check(expression, message) {
  if (!expression) {
    throw new Error(message)
  }
}

export default { notNull, notEmpty, positive, checkCase, check }