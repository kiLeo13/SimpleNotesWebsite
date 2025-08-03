import requests from './requests.js'
import sidebar from './sidebar.js'

const DEFAULT_DISPLAY_ID = 'display-box'
const DEFAULT_BACKGROUND_COLOR = 'rgb(30, 27, 37)'
const BACKGROUND_COLORS = {
  "IMAGE": 'rgba(16, 15, 20, 1)',
  "VIDEO": '#000000'
}

function openNote(noteId) {
  // If this note is already open, do nothing
  if (!noteId || isNoteOpen(noteId)) return

  const $board = $('#content-board')
  const note = requests.getNoteById(noteId)

  if (!note) {
    alert('Anotação não encontrada! Pedimos desculpas :/')
    sidebar.removeNote(noteId)
    return
  }
  
  const backgroundColor = BACKGROUND_COLORS[note.type] || DEFAULT_BACKGROUND_COLOR
  const $el = _createElement(note)
  removeItem()
  showEmptyIcon(false)
  _hookEvents($el)

  $board.append($el)
  $board.css('background-color', backgroundColor)
}

function isNoteOpen(noteId) {
  const $el = $(`#${DEFAULT_DISPLAY_ID}`)
  return $el.length > 0 && $el.attr('itemid') == noteId
}

function showEmptyIcon(show) {
  const $icon = $('#empty-icon')

  if (show) {
    $icon.show()
  } else {
    $icon.hide()
  }
}

function removeItem() {
  const $board = $('#content-board')
  $board.css('background-color', DEFAULT_BACKGROUND_COLOR)

  $(`#${DEFAULT_DISPLAY_ID}`).remove()
  showEmptyIcon(true)
}

function _createElement(note) {
  const type = note.type
  const value = note.content
  const noteId = note.id
  let $el

  switch (type) {
    case 'IMAGE': $el = _createImage(value, noteId); break
    case 'TEXT':  $el = _createText(value, noteId); break
    case 'PDF':   $el = _createPdf(value, noteId); break
    case 'AUDIO': $el = _createAudio(value, noteId); break
    case 'VIDEO': $el = _createVideo(value, noteId); break

    default: {
      alert(`Não foi possível abrir a anotação. Tipo desconhecido: ${type}.`)
      throw new Error(`Unknown note type: ${type}`)
    }
  }
  return $el
}

function _hookEvents($el) {
  $el.on('keydown', (e) => {
    if (e.key === 'Escape') {
      removeItem()
      showEmptyIcon(true)
    }
  })
}

function _createImage(value, noteId) {
  return $('<img>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-image')
    .attr('src', value)
}

function _createText(value, noteId) {
  return $('<textarea>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .attr('readonly', true)
    .addClass('note-frame-text')
    .text(value)
}

function _createPdf(value, noteId) {
  return $('<iframe>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-pdf')
    .attr('src', value)
    .attr('type', 'application/pdf')
}

function _createAudio(value, noteId) {
  return $('<audio>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-audio')
    .attr('controls', true)
    .attr('src', value)
}

function _createVideo(value, noteId) {
  return $('<video>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-video')
    .attr('controls', true)
    .attr('src', value)
}

export default { openNote, showEmptyIcon, removeItem }