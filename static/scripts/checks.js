function notNull(value, name) {
  if (value === null || value === undefined) {
    throw new TypeError(`${name} must not be null or undefined`)
  }
}

function notEmpty(value, name) {
  notNull(value, name)
  check(value.trim() !== '', `${name} may not be empty or null`)
}

function positive(value, name) {
  notNull(value, name)
  if (typeof value !== 'number') {
    throw new TypeError(`${name} must be a number`)
  }

  if (value < 0) {
    throw new RangeError(`${name} must be positive`)
  }
}

function check(expression, message) {
  if (!expression) {
    throw new Error(message)
  }
}

export default { notNull, notEmpty, positive, check }