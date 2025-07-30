import requests from './requests.js'
import sidebar from './sidebar.js'

const DEFAULT_DISPLAY_ID = 'display-box'

function openNote(noteId) {
  const $board = $('#content-board')
  const note = requests.getNoteById(noteId)

  if (!note) {
    alert('Anotação não encontrada! Pedimos desculpas :/')
    sidebar.removeNote(noteId)
    return
  }
  
  const $el = _createElement(note.type, note.content)
  removeItem()
  showEmptyIcon(false)
  _hookEvents($el)

  $board.append($el)
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
  $(`#${DEFAULT_DISPLAY_ID}`).remove()
  showEmptyIcon(true)
}

function _createElement(type, value) {
  let $el

  switch (type) {
    case 'IMAGE': $el = _createImage(value); break
    case 'TEXT': $el = _createText(value); break
    case 'PDF': $el = _createPdf(value); break
    case 'AUDIO': $el = _createAudio(value); break
    case 'VIDEO': $el = _createVideo(value); break

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

function _createImage(value) {
  return $('<img>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .addClass('note-frame-image')
    .attr('src', value)
}

function _createText(value) {
  return $('<textarea>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .attr('readonly', true)
    .addClass('note-frame-text')
    .text(value)
}

function _createPdf(value) {
  return $('<iframe>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .addClass('note-frame-pdf')
    .attr('src', value)
    .attr('type', 'application/pdf')
}

function _createAudio(value) {
  return $('<audio>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .addClass('note-frame-audio')
    .attr('controls', true)
    .attr('src', value)
}

function _createVideo(value) {
  return $('<video>')
    .attr('id', DEFAULT_DISPLAY_ID)
    .addClass('note-frame-video')
    .attr('controls', true)
    .attr('src', value)
}

export default { openNote, showEmptyIcon, removeItem }