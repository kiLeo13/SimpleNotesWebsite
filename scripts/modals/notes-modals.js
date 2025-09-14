import $ from "jquery"

import validators from "./validators.js"
import utils from "../utils.js"

const MODAL_FORM_INVALID_INPUT = 'invalid-note-modal-input'

function showNoteUploadModal(onSubmit) {
  const $container = $('<div>')
    .addClass('app-modal modal-screen-container')
    .attr('id', this.id)

  const $title = buildModalTitle()
  const $form = buildBaseForm(this.title)
  const $nameField = buildNoteNameField()
  const $visibility = buildVisibilityField()
  const $aliases = buildNoteAliasesField()
  const $content = buildFileInputField()

  // Appending all fields to the form
  $form.append($title, $nameField, $visibility, $aliases, $content)

  // Applying submit handler
  if (onSubmit) {
    $form.on('submit', onSubmit)
  }
    
  // Applying buttons to the modal
  applyNewNoteButtons($container, $form)
  return $container.append($form)
}

function buildNoteNameField() {
  const id = randomId()
  return newTextSection({
    id: id,
    labelName: 'Nome',
    classes: ['create-note-name-input-field'],
    required: true,
    type: 'text',
    minlength: validators.MIN_NOTE_NAME_LENGTH,
    maxlength: validators.MAX_NOTE_NAME_LENGTH,
    validators: [{
      event: 'input',
      handler: validators.modalNameValidator
    }]
  })
}

function buildVisibilityField() {
  const id = randomId()
  return newDropdownSection({
    id: id,
    labelName: 'Visibilidade',
    classes: ['create-note-visibility-input-field'],
    required: true,
    helpText: 'A visibilidade de uma nota é apenas para fins de organização e ' +
      'não afeta a privacidade a nível de permissões de visualização do arquivo.',
    options: validators.VISIBLITY_OPTIONS
  })
}

function buildNoteAliasesField() {
  const id = randomId()

  return newTextSection({
    id: id,
    labelName: 'Apelidos',
    required: false,
    classes: ['create-note-tags-input-field'],
    placeholder: 'Separe os apelidos por espaço',
    type: 'text',
    minlength: validators.MIN_NOTE_ALIAS_LENGTH,
    maxlength: validators.MAX_NOTE_ALIAS_LENGTH * validators.MAX_NOTE_ALIASES,
    validators: [{
      event: 'input',
      handler: validators.modalAliasesValidator
    }]
  })
}

function buildFileInputField() {
  const id = randomId()

  return newFileSection({
    id: id,
    labelName: 'Conteúdo',
    required: true,
    classes: ['create-note-file-input-field'],
    helpText: `Arquivo máximo: ${utils.getPrettySize(validators.MAX_NOTE_FILE_SIZE_BYTES)}.`,
    accept: validators.NOTE_FILE_TYPES,
    validators: [{
      event: 'change',
      handler: validators.modalFileValidator
    }]
  })
}

/**
 * Creates a new file input section, that is, it already includes the label, input and error field.
 * 
 * @param {NoteModalFileInput} params The parameters of the file input.
 * @returns {JQuery<HTMLElement>} The built file input element.
 */
function newFileSection(params) {
  const $errField = newErrorInput(params.id)
  const $label = buildLabelElement(params.id, params.labelName, params.required, params.helpText)
  const accepts = params.accept ? params.accept.map(ext => `.${ext}`).join(',') : null
  const $spanSelect = $('<span>').text('Selecione um arquivo')
  const $spanChosen = $('<span>').addClass('modal-chosen-file')
  const $input = $('<input>')
    .addClass('hidden-styled-file-input')
    .addClass(params.classes?.join(' ') || '')
    .attr('required', params.required || false)
    .attr('accept', accepts)
    .attr('type', 'file')
    .attr('id', params.id)
  const $component = $('<label>')
    .attr('for', params.id)
    .addClass('modal-content-in-styled')

  // Registering listeners
  $input.on('change', (e) => handleFileSelection(e, $spanChosen))

  // Custom validator
  $input.on('change', (e) => {
    const msg = validators.modalFileValidator($(e.target))
    setFieldValidStyle($component, !msg)
    setErrorMessage($errField, msg)
  })

  $component.append($spanSelect, $spanChosen, $input)
  return buildActionRow($label, $component, $errField)
}

/**
 * Creates a new text input section, that is, it already includes the label, input and error field.
 * 
 * @param {NoteModalTextInput} params The parameters of the text input.
 * @returns {JQuery<HTMLElement>} The built input element.
 */
function newTextSection(params) {
  const $errField = newErrorInput(params.id)
  const $label = buildLabelElement(params.id, params.labelName, params.required, params.helpText)
  const $component = $('<input>')
    .addClass('note-modal-std-in')
    .addClass(params.classes?.join(' ') || '')
    .attr('id', params.id)
    .attr('type', params.type)
    .attr('required', params.required || false)
    .attr('minlength', params.minlength || null)
    .attr('maxlength', params.maxlength || null)
    .attr('placeholder', params.placeholder || '')
    .val(params.value || '')

  // Registering listeners
  registerValidators($component, $errField, params.validators)
  registerListeners($component, params.listeners)

  return buildActionRow($label, $component, $errField)
}

/**
 * Creates a new dropdown section, that is, it already includes the label and the select input.
 * 
 * @param {NoteModalDropdownInput} params The parameters of the dropdown input.
 * @returns {JQuery<HTMLElement>} The built dropdown element.
 */
function newDropdownSection(params) {
  const $label = buildLabelElement(params.id, params.labelName, params.required, params.helpText)
  const $component = $('<select>')
      .attr('id', params.id)
      .attr('required', params.required || false)
      .addClass('note-modal-std-in modal-dropdown-input')
      .addClass(params.classes?.join(' ') || '')
      .append(params.options.map(opt => {
        return $('<option>')
          .attr('value', opt.value)
          .text(opt.text)
          .prop('selected', opt.defaultOption)
      }))

  // Registering listeners
  registerListeners($component, params.listeners)

  return buildActionRow($label, $component)
}

// =====================
// Helpers
// =====================
function newActionRow() {
  return $('<div>').addClass('modal-action-row')
}

function newModalRowSection() {
  return $('<div>').addClass('modal-row-section')
}

function newTopCloseTabButton() {
  return $('<button>')
    .addClass('close-tab-container')
    .append($('<span>')
      .addClass('close-tab-icon')
      .text('+'))
}

function buildActionRow(...$appends) {
  const $row = newActionRow()
  const $container = newModalRowSection()

  for (const $el of $appends) {
    $container.append($el)
  }
  return $row.append($container)
}

function buildBaseForm(title) {
  return $('<form>')
    .addClass('modal-screen-contents')
    .append($('h1')
      .addClass('modal-title')
      .text(title))
}

function buildLabelElement(forId, text, required = false, helpText = null) {
  const $el = $('<label>')
    .addClass('input-label')
    .attr('for', forId)
    .text(text)

  $el.append(newReqHint(required))

  if (helpText) {
    $el.append(newHelpText(helpText))
  }
  return $el
}

function buildModalTitle() {
  return $('<h1>')
    .addClass('modal-title')
    .text('Criar Nota')
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

function applyNewNoteButtons($container, $form) {
  const $closeButton = newTopCloseTabButton()
  const $submitButton = newBottomSubmitButton('Criar', 'rgba(168, 153, 204, 1)')
  const $row = newActionRow()
  const $bottom = $('<div>')
    .addClass('modal-bottom-container')
    .append($submitButton)
  
  // Add the close button to the container
  $container.append($closeButton)

  // Handle modal close
  handleCloseModal($closeButton, $container)

  // Adding the submit button
  $row.append($bottom)
  $form.append($row)
}

/**
 * Creates a new Submit Button as jQuery element.
 * 
 * @param {string} [text='Salvar'] The text to be shown in the button.
 * @param {string} [color=''] The color of the background of the button.
 * @returns {JQuery<HTMLElement>} A new button element.
 */
function newBottomSubmitButton(text, color) {
  return $('<button>')
    .addClass('modal-bottom modal-submit-button')
    .css('background-color', color || '')
    .attr('type', 'submit')
    .append($('<span>').text(text || 'Salvar'))
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

function handleCloseModal($button, $container) {
  $button.on('click', () => {
    $container.parent().remove()
  })
}

function registerValidators($input, $errField, validators) {
  for (const validator of validators || []) {
    $input.on(validator.event, (e) => {
      const msg = validator.handler($(e.target))
      
      setFieldValidStyle($input, !msg)
      setErrorMessage($errField, msg)
    })
  }
}

function registerListeners($input, listeners) {
  for (const listener of listeners || []) {
    $input.on(listener.event, listener.handler)
  }
}

export default { showNoteUploadModal }