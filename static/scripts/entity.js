import board from './board.js'
import { Modal, ActionRow, TextInputComponent, DropdownComponent, FileInputComponent } from './modals/modals.js'
import utils from './utils.js'

const MIN_NOTE_ALIAS_LENGTH = 2
const MAX_NOTE_ALIAS_LENGTH = 30
const MAX_NOTE_ALIASES = 50
const MAX_NOTE_FILE_SIZE_BYTES = 100 * 1024 * 1024
const MIN_NOTE_NAME_LENGTH = 2
const MAX_NOTE_NAME_LENGTH = 80
const VISIBLITY_OPTIONS = [
  { value: 'PUBLIC', text: 'Pública' },
  { value: 'CONFIDENTIAL', text: 'Confidencial' }
]
const NOTE_TYPES = [
  { value: "AUDIO", text: "Áudio" },
  { value: "IMAGE", text: "Imagem" },
  { value: "PDF", text: "PDF" },
  { value: "TEXT", text: "Texto", defaultOption: true },
  { value: "VIDEO", text: "Vídeo" }
]

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
  return $('<textarea>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .attr('readonly', true)
    .addClass('note-frame-text')
    .text(value)
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

function buildNoteUploadScreen() {
  const $title = new TextInputComponent(true)
    .setLabel('Nome', true)
    .setMaxLength(MAX_NOTE_NAME_LENGTH)
    .setMinLength(MIN_NOTE_NAME_LENGTH)

  const $type = new DropdownComponent()
    .setLabel('Tipo', true)
    .addOptions(NOTE_TYPES)
  const $visibility = new DropdownComponent()
    .setHelpText('A visibilidade de uma nota é apenas para fins de organização e ' +
      'não afeta a privacidade a nível de permissões de visualização do arquivo.')
    .setLabel('Visibilidade', true)
    .addOptions(VISIBLITY_OPTIONS)

  const $aliases = new TextInputComponent()
    .setLabel('Apelidos')
    .setPlaceholder('Separe os apelidos por espaço')
    .setValidator(handleAliasesValidation)
    .setMinLength(MIN_NOTE_ALIAS_LENGTH)
    .setMaxLength(MAX_NOTE_ALIAS_LENGTH * MAX_NOTE_ALIASES)

  const $content = new FileInputComponent()
    .setValidator((e) => modalFileValidator(e, $content))
    .setHelpText(`Arquivo máximo: ${utils.getPrettySize(MAX_NOTE_FILE_SIZE_BYTES)}.`)
    .setLabel('Conteúdo', true)

  return new Modal('Criar Nota')
    .addRow(new ActionRow().addItem($title))
    .addRow(new ActionRow().addItem($type, $visibility))
    .addRow(new ActionRow().addItem($aliases))
    .addRow(new ActionRow().addItem($content))
    .render()
}

function handleAliasesValidation(e) {
  const $el = $(e.target)
  const val = $el.val()

  if (!val || val.trim() === '') {
    return null
  }

  const words = val.split(' ')  
  if (words.length > 50) {
    return `Máximo de apelidos: ${MAX_NOTE_ALIASES}, fornecido: ${words.length}`
  }
  
  for (const alias of words) {
    const errMsg = checkAlias(alias)
    if (errMsg) {
      return errMsg
    }
  }

  $el.val(val.toLowerCase())
  return null
}

function checkAlias(val) {
  if (val.trim() === '') return 'Apelido fornecido aparenta estar vazio'

  const length = val.length
  if (length < MIN_NOTE_ALIAS_LENGTH) return `Apelidos precisam ter pelo menos ${MIN_NOTE_ALIAS_LENGTH} caracteres`
  if (length > MAX_NOTE_ALIAS_LENGTH) return `Apelidos podem ter, no máximo, ${MAX_NOTE_ALIAS_LENGTH} caracteres`
  return null
}

/**
 * @param {JQuery.TriggeredEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} e The event triggered.
 */
function modalFileValidator(e, $component) {
  const $parent = $(e.target).parent()
  const file = e.target.files?.[0]
  
  // Maybe the array is empty? Better safe than sorry?
  if (!file) return null

  const fileTooBig = file.size > MAX_NOTE_FILE_SIZE_BYTES
  Modal.setValid($parent, !fileTooBig)

  return fileTooBig ? getFileTooBigErrorMessage(file.size) : null
}

function getFileTooBigErrorMessage(size) {
  return `Arquivo grande demais: ${utils.getPrettySize(size)}, máx.: ${utils.getPrettySize(MAX_NOTE_FILE_SIZE_BYTES)}`
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