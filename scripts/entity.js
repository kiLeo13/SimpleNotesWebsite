import $ from "jquery"
import board from "./board.js"
import { Modal, ActionRow, TextInputComponent, DropdownComponent, FileInputComponent } from "./modals/modals.js"
import utils from "./utils.js"
import validators from "./modals/validators.js"
import { marked } from "marked"
import DOMPurify from "dompurify"

function buildNoteItem(data) {
  return $('<div>')
    .addClass('note-item')
    .attr('itemid', data.id)
    .append(
      $('<span>')
        .addClass('note-item-title')
        .text(data.name)
    )
}

function createImageDisplay(value, noteId) {
  return $('<img>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-image')
    .attr('src', value)
}

function createTextDisplay(value, noteId) {
  const raw = marked.parse(value)
  const clean = DOMPurify.sanitize(raw)

  return $('<div>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-text')
    .html(clean)
}

function createPdfDisplay(value, noteId) {
  return $('<iframe>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-pdf')
    .attr('src', value)
    .attr('type', 'application/pdf')
}

function createAudioDisplay(value, noteId) {
  return $('<audio>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-audio')
    .attr('controls', true)
    .attr('src', value)
}

function createVideoDisplay(value, noteId) {
  return $('<video>')
    .addClass('note-frame-video')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .attr('controls', true)
    .attr('src', value)
    .prop('muted', true)
}

/**
 * Creates a new {@link Modal} instance for note uploads.
 * 
 * Unlike other methods in this module, this one DOES NOT return an appendable jQuery object. 
 * Instead, you **must** call {@link Modal#render} on the returned Modal instance to generate and 
 * append the corresponding HTML element to the DOM.
 * 
 * This is because the `Modal` class includes utility methods and component logic
 * that may be needed for validation, display handling, or interaction with other parts of the system. 
 * By using the `render()` method explicitly, the HTML element is constructed only when required..
 * 
 * Usage example:
 * ```javascript
 * const modal = createNoteUploadModal()
 * const $el = modal.render() // Builds the HTML element
 * 
 * $el.appendTo(anotherElement)
 * ```
 * 
 * @returns {Modal} A new instance of the Modal class configured for note uploads, which must be rendered 
 *                  manually using {@link Modal#render}.
 */
function buildNoteUploadScreen() {
  const $title = new TextInputComponent(true)
    .setLabel('Nome', true)
    .setValidator(validators.modalNameValidator)
    .setMaxLength(validators.MAX_NOTE_NAME_LENGTH)
    .setMinLength(validators.MIN_NOTE_NAME_LENGTH)

  const $visibility = new DropdownComponent()
    .setHelpText('A visibilidade de uma nota é apenas para fins de organização e ' +
      'não afeta a privacidade a nível de permissões de visualização do arquivo.')
    .setLabel('Visibilidade', true)
    .addOptions(validators.VISIBLITY_OPTIONS)

  const $aliases = new TextInputComponent()
    .setLabel('Apelidos')
    .setPlaceholder('Separe os apelidos por espaço')
    .setValidator(validators.modalAliasesValidator)
    .setMinLength(validators.MIN_NOTE_ALIAS_LENGTH)
    .setMaxLength(validators.MAX_NOTE_ALIAS_LENGTH * validators.MAX_NOTE_ALIASES)

  const $content = new FileInputComponent()
    .setValidator(validators.modalFileValidator)
    .setHelpText(`Arquivo máximo: ${utils.getPrettySize(validators.MAX_NOTE_FILE_SIZE_BYTES)}.`)
    .setLabel('Conteúdo', true)

  return new Modal('Criar Nota')
    .setSubmitStyle('Criar', 'rgba(168, 153, 204, 1)')
    .addRow(new ActionRow().addItem($title))
    .addRow(new ActionRow().addItem($visibility))
    .addRow(new ActionRow().addItem($aliases))
    .addRow(new ActionRow().addItem($content))
}

function getBlackBackground(centered = true) {
  const $el = $('<div>').addClass('black-background-container')

  if (centered) {
    $el.addClass('centered-screen')
  }
  
  return $el
}

export default {
  buildNoteItem,
  createImageDisplay,
  createTextDisplay,
  createPdfDisplay,
  createAudioDisplay,
  createVideoDisplay,
  buildNoteUploadScreen,
  getBlackBackground
}