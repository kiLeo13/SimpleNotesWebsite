import $ from "jquery"

import utils from "../utils.js"
import requests from "../requests.js"
import sidebar from "../sidebar.js"

/**
 * Returns a modal of the dynamic authentication screen.
 * 
 * @param {Function} onLogin The callback function (with no parameters) when the user Signs In or Signs Up.
 * @returns {JQuery<HTMLElement>} The appendable modal element.
 */
function getAuthScreen(onLogin) {
  const $container = newContainer()
  const $header = newModalHeader()
  const $form = buildBaseForm()

  $form.on('submit', (e) => handleSubmit(e, onLogin, $form))

  return $container.append($header, $form)
}

function buildBaseForm() {
  const $formTop = buildFormMain()
  const $formBottom = buildFormBottom()

  return $('<form>')
    .addClass('auth-base-form')
    .append($formTop, $formBottom)
}

function buildFormMain() {
  const $body = $('<div>').addClass('auth-modal-body')
  const $email = buildInput('Email', 'email', true, {}, ['auth-email-field-input'])
  // Soon {"pattern": "^[a-z0-9]+(?:[._%+\\-][a-z0-9]+)*@consorciomagalu\\.com\\.br$"}

  $body.append($email.wrapper)
  return $('<div>')
    .addClass('auth-form-main')
    .append($body)
}

function buildFormBottom() {
  const $loader = buildLoader().hide()
  const $proceedButton = $('<button>')
    .addClass('auth-proceed-btn')
    .text('Próximo')

  return $('<div>')
    .addClass('auth-modal-footer')
    .append($loader, $proceedButton)
}

/**
 * @param {string} label The label title to be shown.
 * @param {boolean} [required=true] Whether this input is required or not (defaults to `true`).
 * @param {string} type The input type.
 * @param {Record<string, any>} [attrs={}] Custom attributes to the element.
 * @param {string[]} [classes=[]] The additional classes to be added TO THE INPUT ELEMENT.
 * @returns {Object} The full form control element.
 */
function buildInput(label, type, required, attrs, classes) {
  if (!classes) classes = []

  const id = utils.randomId()
  const $label = $('<label>')
    .addClass('auth-form-label')
    .attr('for', id)
    .text(label)
    .append(getRuleHint(required || true))

  classes.push('auth-form-input')
  const $input = $('<input>')
    .addClass(classes.join(' '))
    .attr('required', required || true)
    .attr('type', type)
    .attr('id', id)
    .attr(attrs || {})

  const $wrapper = $('<div>')
    .addClass('auth-form-control')
    .append($label, $input)

  return {
    wrapper: $wrapper,
    input: $input
  }
}

function getRuleHint(required) {
  if (required) {
    return $('<span>')
      .addClass('required-hint')
      .text('*')
  } else {
    return $('<span>')
      .addClass('optional-hint')
      .text('(opcional)')
  }
}

function setLoading(flag) {
  const $loader = $('.auth-footer-loader-container')
  const $btn = $('.auth-proceed-btn')

  if (flag) {
    $loader.show()
    $btn.attr('disabled', true)
  } else {
    $loader.hide()
    $btn.removeAttr('disabled')
  }
}

function newContainer() {
  return $('<div>').addClass('app-modal auth-modal-container')
}

function lock(...$els) {
  for (const $el of $els) {
    $el.attr('disabled', true)
  }
}

function unlock(...$els) {
  for (const $el of $els) {
    $el.removeAttr('disabled')
  }
}

function allDigits(str) {
  return /^\d+$/.test(str)
}

function newModalHeader() {
  const message = resolveHeaderMessage()
  const $title = $('<div>').addClass('auth-modal-header-title').text(`${message}! Insira seu e-mail profissional`)
  const $div = $('<div>').addClass('auth-modal-division')

  return $('<div>')
    .addClass('auth-modal-header')
    .append($title, $div)
}

function resolveHeaderMessage() {
  const hourNow = new Date().getHours()

  if (utils.isBetween(hourNow,  6, 11)) return 'Bom dia'
  if (utils.isBetween(hourNow, 12, 18)) return 'Boa tarde'
  
  return 'Boa noite'
}

function buildLoader() {
  return $('<div>')
    .addClass('auth-footer-loader-container')
    .append(
      $('<div>').addClass('loader')
    )
}

// Helper Handlers
// Note: Parameter types are mostly annotated for IntelliSense/autocomplete,
// not as complete documentation.

/**
 * @param {JQuery.SubmitEvent} e The submit event.
 * @param {Function} onLogin The callback function.
 * @param {JQuery<HTMLElement>} $form The form element.
 */
async function handleSubmit(e, onLogin, $form) {
  e.preventDefault()

  const $email = $('.auth-email-field-input')

  setLoading(true)
  const exists = await requests.checkEmail($email.val().trim())
  setLoading(false)

  // Already handled by the `requests` module.
  // I know I know, this violates SRP, but I will change whenever I have more time.
  if (exists == null) return

  $form.off()
  if (exists) {
    handleLogin(onLogin, $form, $email)
  } else {
    handleSignup(onLogin, $form, $email)
  }
}

/**
 * @param {Function} onLogin The callback function.
 * @param {JQuery<HTMLElement>} $form The form.
 * @param {JQuery<HTMLElement>} $email The email input.
 */
function handleSignup(onLogin, $form, $email) {
  const $anchor = $('.auth-modal-body')
  const $btn = $('.auth-proceed-btn')
  const $headerTitle = $('.auth-modal-header-title')
  const $username = buildInput('Nome Completo', 'text', true, {"minlength": 2, "maxlength": 80})
  const $password = buildInput('Nova Senha', 'password', true, {"minlength": 8, "maxlength": 64})
  
  $headerTitle?.text('Siga com o registro')
  $btn?.text('Enviar Código')
  
  $email.attr('disabled', true)
  
  $anchor.prepend($username.wrapper)
  $anchor.append($password.wrapper)
  $username.input.trigger('focus')
  
  $form.on('submit', async (e) => {
    e.preventDefault()

    const username = $username.input.val().trim()
    const email = $email.val().trim()
    const password = $password.input.val().trim()

    setLoading(true)
    lock($username.input, $password.input)
    const ok = await requests.register(username, email, password)
    setLoading(false)

    if (!ok) {
      unlock($username.input, $password.input)
      return
    }

    $btn?.text('Registrar')
    $form.off()
    handleCodeConfirmation(onLogin, $form, $email, $password.input)
  })
}

/**
 * @param {Function} onLogin The callback function.
 * @param {JQuery<HTMLElement>} $form The form.
 * @param {JQuery<HTMLElement>} $email The email input.
*/
function handleLogin(onLogin, $form, $email) {
  const $container = $('.auth-modal-container')
  const $anchor = $('.auth-modal-body')
  const $btn = $('.auth-proceed-btn')
  const $headerTitle = $('.auth-modal-header-title')
  const $password = buildInput('Senha', 'password', true, {"minlength": 8, "maxlength": 64}, ['auth-password-field-input'])

  $email.attr('disabled', true)
  $btn?.text('Entrar')
  $headerTitle?.text('Siga com o login')
  
  $anchor.append($password.wrapper)
  $password.input.trigger('focus')
  
  $form.on('submit', async (e) => {
    e.preventDefault()
    const password = $password.input.val().trim()
    const email = $email.val().trim()

    setLoading(true)
    lock($password.input)
    const resp = await requests.login(email, password)
    setLoading(false)

    if (!resp) {
      unlock($password.input)
      return
    }

    const accessToken = resp["access_token"]
    const idToken = resp["id_token"]

    if (!accessToken || !idToken) {
      utils.showMessage('Missing necessary tokens? What?', 'warn')
    }

    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('id_token', idToken)

    $container.parent().remove()
    onLogin()
  })
}

/**
 * @param {Function} onLogin The callback function.
 * @param {JQuery<HTMLElement>} $form The form.
 * @param {JQuery<HTMLElement>} $email The email input.
 * @param {JQuery<HTMLElement>} $password The password input.
 */
function handleCodeConfirmation(onLogin, $form, $email, $password) {
  const $container = $('.auth-modal-container')
  const $anchor = $('.auth-modal-body')
  const $code = buildInput('Código', 'text', true, {"minlength": 6, "maxlength": 6}, ['auth-code-field-input'])

  $anchor.append($code.wrapper)
  $code.input.trigger('focus')

  $form.on('submit', async (e) => {
    e.preventDefault()
    const email = $email.val().trim()
    const password = $password.val().trim()
    const code = $code.input.val().trim()

    if (!allDigits(code)) {
      $code.text('')
      utils.showMessage('Apenas números são aceitos no código.', 'warn')
      return
    }

    lock($code.input)
    setLoading(true)
    const ok = await requests.verifyEmail(email, code)
    
    if (!ok) {
      setLoading(false)
      unlock($code.input)
      return
    }

    // Now we try to also sign the user in XD
    const resp = await requests.login(email, password)

    // What? There isn't much I can do, to be very honest, unless unlocking all fields back
    if (!resp) {
      utils.showMessage('Isso definitivamente não deveria acontecer... favor entrar em contato com o desenvolvedor', 'warn', 30000)
      return
    }

    const accessToken = resp["access_token"]
    const idToken = resp["id_token"]

    if (!accessToken || !idToken) {
      utils.showMessage('Missing necessary tokens? What?', 'warn')
    }

    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('id_token', idToken)

    $container.parent().remove()
    onLogin()
  })
}

export default { getAuthScreen }