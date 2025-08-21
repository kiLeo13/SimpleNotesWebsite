import utils from "./utils.js"

function success(message, period = 5000) {
  utils.showMessage(message, 'success', period)
}

function info(message, period = 5000) {
  utils.showMessage(message, 'info', period)
}

function warn(message, period = 5000) {
  utils.showMessage(message, 'warn', period)
}

function error(message, period = 5000) {
  utils.showMessage(message, 'error', period)
}

export default { success, info, warn, error }