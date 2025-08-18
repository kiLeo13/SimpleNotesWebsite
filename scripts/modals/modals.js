import checks from '../checks.js'
import utils from '../utils.js'

/**
 * This class name is not used for any style purposes, its purely to be easily
 * iterable and faster lookups.
 */
const MODAL_FORM_VALIDATOR_CLASS = 'modal-form-input'
const MODAL_FORM_INVALID_INPUT = 'invalid-modal-input'

function getModals() {
  return $('.modal-screen-container')
}

function isModalDisplayed() {
  return getModals().length > 0
}

function closeModals() {
  getModals().parent().remove()
}

// =====================
// Base Modal
// =====================
class Modal {
  constructor(title) {
    this.rows = []
    this.id = `modal-${randomId()}`
    this.title = title
  }

  isAvailableForSubmission() {
    return !$(`#${MODAL_FORM_VALIDATOR_CLASS}`).hasClass(MODAL_FORM_INVALID_INPUT)
  }
  
  addRow(row) {
    this.rows.push(row)
    return this
  }

  setSubmitButtonText(text) {
    this.sendButtonText = text
    return this
  }
  
  render() {
    checks.notEmpty('Submit Button Text')
    const $container = $('<div>')
      .addClass('modal-screen-container')
      .attr('id', this.id)

    const $title = $('<h1>').addClass('modal-title').text(this.title)
    const $closeButton = newCloseTabButton()
    const $form = newBaseForm(this.title)
    const $cancelButton = newBottomCancelButton()
    const $bottom = newModalBottom().append($cancelButton, newBottomSubmitButton(this.sendButtonText))

    $form.append($title)
    for (const row of this.rows) {
      try {
        $form.append(row.buildElement())
      } catch (e) {
        console.error(`Failed building modal row ${JSON.stringify(row, null, 2)}:`, e)
      }
    }

    handleCloseModal($closeButton, $cancelButton)

    $form.append($bottom)
    $container.append($closeButton, $form)
    return $container
  }
}

// =====================
// Action Row
// =====================
class ActionRow {
  constructor() {
    this.items = []
  }
  
  addItem(...items) {
    for (const item of items) {
      checks.notNull(item, 'Modal Item')
    }
    this.items.push(...items)
    return this
  }

  /**
   * Sets a given component for the given index of this current row.
   * 
   * This method automatically updates the DOM with the new inserted values,
   * meaning it is not necessary to render the `Modal` again.
   *
   * @param {AbstractComponent} component The component to be set.
   * @param {number} [index=0] The index of the component to be replaced in the row. Defaults to `0`.
   * @throws {TypeError} If either the `component` or `index` params are `null`.
   * @throws {RangeError} If the provided `index` is negative.
   */
  setItem(component, index = 0) {
    checks.notNull(component, 'Component')
    checks.positive(index, 'Index')

    this.items[index] = component
  }
  
  buildElement() {
    const $row = newActionRow()
    
    for (const item of this.items) {
      const $container = newModalRowSection()
      const $label = item.buildLabel()
      const $component = item.buildInput()
      const $errorField = item.getErrorField()

      // Adding required class for validation
      $component.addClass(MODAL_FORM_VALIDATOR_CLASS)

      $container.append($label, $component, $errorField)
      $row.append($container)
    }
    return $row
  }
}

// =====================
// Input Component
// =====================
class AbstractComponent {
  constructor(id) {
    this.label = ''
    this.helpText = null
    this.attributes = {}
    this.validator = null
    this.eventMap = new Map()
    this.id = id || `input-${randomId()}`
    this.$errorField = newErrorInput(this.id)
  }

  getId() {
    return this.id
  }

  setLabel(text, required = false) {
    this.label = text
    this.attributes['required'] = required
    return this
  }

  setPlaceholder(text) {
    this.attributes['placeholder'] = text
    return this
  }

  setHelpText(text) {
    this.helpText = text
    return this
  }

  setAttribute(key, value) {
    this.attributes[key] = value
    return this
  }

  removeAttribute(key) {
    delete this.attributes[key]
    return this
  }

  getJQueryField() {
    return $(`#${this.id}`)
  }

  setValidator(validator) {
    checks.check(typeof validator === 'function', 'Validator must be a function')
    this.validator = validator
    return this
  }

  addListener(event, handler) {
    const handlers = this.eventMap.get(event) || []

    handlers.push(handler)
    this.eventMap.set(event, handlers)
    return this
  }

  getErrorField() {
    return this.$errorField
  }

  /**
   * Sets this component field as valid or invalid.
   * 
   * This method changes ONLY the style of the input, NOT its behavior.
   * 
   * @param {string} reason Defines the reaon of the error,
   * if this parameter is `null`, then the field is considered as VALID.
   */
  setValid(reason) {
    const $field = this.getJQueryField()
    setFieldValidStyle($field, !reason)
    setErrorMessage(this.$errorField, reason)
  }

  buildLabel() {
    const required = this.attributes['required'] === true || false
    const $el = newLabelElement(this.id, this.label)

    $el.append(newReqHint(required))

    if (this.helpText) {
      $el.append(newHelpText(this.helpText))
    }
    return $el
  }

  bindEvents($el, defaultEvent) {
    if (this.validator && defaultEvent) {
      $el.on(defaultEvent, (e) => {
        const msg = this.validator(e)
        this.setValid(msg)
      })
    }

    this.eventMap?.forEach((handlers, event) => {
      for (const handler of handlers) {
        $el.on(event, handler)
      }
    })
  }

  checkBuild() {
    checks.notNull(this.label, 'Label')
    checks.notNull(this.id, 'ID')
    checks.notNull(this.$errorField, 'Error Field')
    checks.check(!!this.validator && typeof this.validator === 'function', 'Validator must be a function')
  }
}

// =====================
// Dropdown Component
// =====================
class DropdownComponent extends AbstractComponent {
  constructor() {
    super(`dropdown-${randomId()}`)
    this.options = []
  }
  
  addOption(value, text, defaultOption = false) {
    this.options.push(new DropDownOption(value, text, defaultOption))
    return this
  }

  addOptions(options = []) {
    for (const opt of options) {
      this.addOption(opt.value, opt.text, opt.defaultOption || false)
    }
    return this
  }
  
  getDefaultEvent() {
    return 'change'
  }

  buildInput() {
    const $el = $('<select>')
      .attr('id', this.id)
      .addClass('modal-std-in modal-dropdown-input')
      .append(this.options.map(opt => {
        return $('<option>')
          .attr('value', opt.value)
          .text(opt.text)
          .prop('selected', opt.defaultOption)
      }))

    this.bindEvents($el, this.getDefaultEvent())
    return $el
  }
}

class DropDownOption {
  constructor(value, text, defaultOption = false) {
    this.value = value
    this.text = text
    this.defaultOption = defaultOption
  }
}

// =====================
// Text Input Component
// =====================
class TextInputComponent extends AbstractComponent {
  constructor(isShort = true) {
    super(`input-${randomId()}`)
    this.isShort = isShort
    this.defaultValue = ''
  }

  getDefaultEvent() {
    return 'input'
  }

  setMinLength(length) {
    this.setAttribute('minlength', length)
    return this
  }

  setDefaultValue(text) {
    this.defaultValue = text
    return this
  }

  setMaxLength(length) {
    this.setAttribute('maxlength', length)
    return this
  }
  
  buildInput() {
    let $input
    if (this.isShort) {
      $input = $('<input>')
        .attr('id', this.id)
        .attr('type', 'text')
        .addClass('modal-std-in')
        .val(this.defaultValue)
    } else {
      $input = $('<textarea>')
        .attr('id', this.id)
        .addClass('modal-std-in')
        .text(this.defaultValue)
    }

    for (const [key, value] of Object.entries(this.attributes)) {
      $input.attr(key, value)
    }

    this.bindEvents($input, this.getDefaultEvent())
    return $input
  }
}

// =====================
// File Input Component
// =====================
class FileInputComponent extends AbstractComponent {
  constructor() {
    super(`file-input-${randomId()}`)
  }

  getDefaultEvent() {
    return 'change'
  }

  setValid(reason) {
    const $field = this.getJQueryField().parent()
    setFieldValidStyle($field, !reason)
    setErrorMessage(this.$errorField, reason)
  }

  buildInput() {
    const $label = $('<label>')
      .attr('for', this.id)
      .addClass('modal-content-in-styled')
    
    const $spanSelect = $('<span>').text('Selecione um arquivo')
    const $spanChosen = $('<span>').addClass('modal-chosen-file')
    const $input = $('<input>')
      .attr('type', 'file')
      .attr('id', this.id)
      .hide()

    for (const [key, value] of Object.entries(this.attributes)) {
      $input.attr(key, value)
    }

    this.bindEvents($input, this.getDefaultEvent())
    $label.append($spanSelect, $spanChosen, $input)

    // Handling file selection
    $input.on('change', (e) => handleFileSelection(e, $spanChosen))
    return $label
  }
}

// =====================
// Helpers
// =====================
function newActionRow() {
  return $('<div>').addClass('modal-action-row')
}

function newCloseTabButton() {
  return $('<button>')
    .addClass('close-tab-container')
    .append($('<span>')
      .addClass('close-tab-icon')
      .text('+'))
}

function newBaseForm(title) {
  return $('<form>')
    .addClass('modal-screen-contents')
    .append($('h1')
      .addClass('modal-title')
      .text(title))
}

function newLabelElement(forId, text) {
  return $('<label>')
    .addClass('input-label')
    .attr('for', forId)
    .text(text)
}

function newReqHint(required) {
  const className = required ? 'required-hint' : 'optional-hint'
  const text = required ? '*' : '(opcional)'
  return $('<span>')
    .addClass(className)
    .text(text)
}

function newHelpText(text) {
  const $icon = $('<span>').text('?')
  const $text = $('<span>').addClass('modal-help-hint-text').text(text)

  return $('<span>')
    .addClass('help-hint')
    .append($icon, $text)
}

function newErrorInput(id) {
  return $('<span>')
    .addClass('input-error-msg')
    .attr('id', `error-${id}`)
    .hide()
}

function newModalRowSection() {
  return $('<div>').addClass('modal-input-section')
}

function newFileNameSpan(fileName) {
  return $('<span>')
    .addClass('file-name')
    .text(fileName)
}

function newFileSizeSpan(bytes) {
  return $('<span>')
    .addClass('file-size')
    .text(utils.getPrettySize(bytes))
}

/**
 * Builds only the container of the bottom of the `Modal`.
 * 
 * @returns An `ActionRow` with the bottom container inside of it (empty).
 */
function newModalBottom() {
  const $row = newActionRow()
  return $('<div>')
    .addClass('modal-bottom-container')
    .appendTo($row)
}

function newBottomCancelButton() {
  return $('<button>')
    .addClass('modal-bottom modal-cancel-button')
    .attr('type', 'button')
    .text('Cancelar')
}

function newBottomSubmitButton(text = 'Salvar') {
  return $('<button>')
    .addClass('modal-bottom modal-submit-button')
    .attr('type', 'submit')
    .append($('<span>').text(text))
    .append(
      $('<div>')
        .addClass('loader modal-button-loader')
        .hide()
    )
}

function randomId(len = 16) {
  return Math.random()
    .toString(36)
    .substring(2, len + 2)
}

function setErrorMessage($field, value) {
  if (value) {
    $field.show()
  } else {
    $field.hide()
  }

  $field.text(value || '')
}

function setFieldValidStyle($el, valid) {
  if (valid) {
    $el.removeClass(MODAL_FORM_INVALID_INPUT)
  } else {
    $el.addClass(MODAL_FORM_INVALID_INPUT)
  }
}

function handleCloseModal(...$els) {
  $els.forEach($el => $el.on('click', closeModals))
}

function handleFileSelection(e, $viewContainer) {
  const file = e.target.files?.[0]

  if (file) {
    const $name = newFileNameSpan(file.name)
    const $size = newFileSizeSpan(file.size)

    $viewContainer.empty() // Remove previous file
    $viewContainer.append($name, $size)
  } else {
    $viewContainer.empty()
  }
}

export {
  Modal,
  ActionRow,
  DropdownComponent,
  TextInputComponent,
  FileInputComponent,
  DropDownOption
}

export default { getModals, isModalDisplayed, closeModals }