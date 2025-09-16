import $ from "jquery"
import checks from "./checks.js"
import { jwtDecode } from "jwt-decode"

/** @type {import("../types/general")} */

const KB = 1024
const MB = KB * 1024
const GB = MB * 1024

/**
 * Displays the provided message on the screen.
 * 
 * @param {string} message The message to be displayed on screen.
 * @param {MessageLevel} level The level of the alert.
 * @param {number} [period=3000] The period the alert should stay on screen (in millis).
 */
function showMessage(message, level, period = 3000) {
  checks.notEmpty(message, 'Message')
  checks.notNull(level, 'Alert Level')
  checks.positive(period, 'Period')
  // If the user provided an invalid level...
  checks.checkCase(level, 'success', 'info', 'warn', 'error')

  const $el = createAlertMessage(message, level)
  $el.appendTo('body')

  setTimeout(() => {
    $el.fadeOut(100, () => $el.remove())
  }, period)
}

/**
 * Checks if a given number is between `start` and `end`.
 * 
 * **All values are inclusive**.
 * 
 * @param {number} n The value to be checked.
 * @param {number} start The initial/anchor position to check.
 * @param {number} end The final position to check the range.
 * @returns {boolean} `true` if `n` is between `start` and `end` (inclusive), `false` otherwise.
 * @throws {TypeError} If the parameters are not of type `number`.
 */
function isBetween(n, start, end) {
  checks.check(typeof n === 'number', `"n" should be a number, not ${typeof n}`)
  checks.check(typeof start === 'number', `"start" should be a number, not ${typeof start}`)
  checks.check(typeof end === 'number', `"end" should be a number, not ${typeof end}`)
  return n >= start && n <= end
}

function randomId(len = 16) {
  return Math.random()
    .toString(36)
    .substring(2, len + 2)
}

/**
 * Checks if there are any modals being shown on screen.
 * 
 * @returns {boolean} `true` if there are any modals being shown, `false` otherwise.
 */
function isModalShown() {
  return $('.app-modal').length > 0
}

function getPrettySize(size) {
  if (size < KB) return `${size} Bytes`
  if (size < MB) return `${formatNumber(size / KB)} KB`
  if (size < GB) return `${formatNumber(size / MB)} MB`
  
  return `${formatNumber(size / GB)} GB`
}

function isSignedIn() {
  const accessToken = localStorage.getItem('access_token')
  const idToken = localStorage.getItem('id_token')

  return isTokenValid(accessToken) && isTokenValid(idToken)
}

function isTokenValid(jwt) {
  if (!jwt || jwt.trim() === '') return false
  const now = Date.now()
  const { exp } = jwtDecode(jwt)

  return now < exp * 1000
}

function createAlertMessage(message, level) {
  const $wrapper = createAlertWrapper()
  const $warning = $('<div>')
    .addClass('page-alert-container')
    .addClass(`alert-level-${level}`)
    .append($('<span>').text(message))

  return $wrapper.append($warning)
}

function createAlertWrapper() {
  return $('<div>').addClass('page-alert-wrapper')
}

function formatNumber(num) {
  return num.toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

export default { getPrettySize, isModalShown, showMessage, isBetween, randomId, isSignedIn, isTokenValid }