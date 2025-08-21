import $ from "jquery"
import checks from "./checks.js"

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
function showMessage(message, level, period = 5000) {
  checks.notEmpty(message, 'Message')
  checks.notNull(level, 'Alert Level')
  checks.positive(period, 'Period')
  // If the user provided an invalid level...
  checks.checkCase(level, 'success', 'info', 'warn', 'error')

  const $el = createAlertMessage(message, level)
  $el.addClass('show').appendTo('body')

  setTimeout(() => {
    $el.fadeOut(100, () => $el.remove())
  }, period)
}

function getPrettySize(size) {
  if (size < KB) return `${size} Bytes`
  if (size < MB) return `${formatNumber(size / KB)} KB`
  if (size < GB) return `${formatNumber(size / MB)} MB`
  
  return `${formatNumber(size / GB)} GB`
}

function createAlertMessage(message, level) {
  return $('<div>')
    .addClass('page-alert-container')
    .addClass(`alert-level-${level}`)
    .append($('<span>').text(message))
}

function formatNumber(num) {
  return num.toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

export default { getPrettySize, showMessage }