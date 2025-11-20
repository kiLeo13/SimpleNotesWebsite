/*
 * A package made only for password utility functions, intending to center
 * all constraints/checks in a single place.
 */

/**
 * Checks whether the string/password has lowercase characters.
 * 
 * @param s The string to be checked.
 * @returns `true` if the string contains at least one lowercase character,
 *  `false` otherwise.
 */
export function hasLower(s: string): boolean {
  return /[a-z]/.test(s)
}

/**
 * Checks whether the string/password has uppercase characters.
 * 
 * @param s The string to be checked.
 * @returns `true` if the string contains at least one uppercase character,
 *  `false` otherwise.
 */
export function hasUpper(s: string): boolean {
  return /[A-Z]/.test(s)
}

/**
 * Checks whether the string/password has digits.
 * 
 * @param s The string to be checked.
 * @returns `true` if the string contains at least one digit, `false` otherwise.
 */
export function hasDigits(s: string): boolean {
  return /\d/.test(s)
}

/**
 * Checks whether the string/password has custom characters.
 * 
 * **Valid custom characters**:
 * ```txt
 * ^ $ * . [ ] { } ( ) ? " ! @ # % & / , > < ' : ; | _ ~ \` = + -
 * ```
 * 
 * @param s The string to be checked.
 * @returns `true` if the string contains custom characters, `false` otherwise.
 */
export function hasCustom(s: string): boolean {
  return /[\^$*.[\]{}()?"!@#%&/,><':;|_~`=+-]/.test(s)
}