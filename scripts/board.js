import $ from "jquery"
import entity from "./entity.js"
import requests from "./requests.js"
import sidebar from "./sidebar.js"
import utils from "./utils.js"

/** @type {import("../types/note")} */

const DEFAULT_DISPLAY_ID = 'display-box'
const DEFAULT_BACKGROUND_COLOR = 'rgb(30, 27, 37)'
const BACKGROUND_COLORS = {
  "IMAGE": 'rgba(16, 15, 20, 1)',
  "VIDEO": '#000000'
}
const types = {
  txt:  'TEXT',
  md:   'TEXT',
  pdf:  'PDF',
  mp4:  'VIDEO',
  mp3:  'AUDIO',
  png:  'IMAGE',
  jpg:  'IMAGE',
  jpeg: 'IMAGE',
  jfif: 'IMAGE',
  webp: 'IMAGE',
  gif:  'IMAGE',
}

async function openNote(noteId) {
  // If this note is already open, do nothing
  if (!noteId || isNoteOpen(noteId)) return

  const $board = $('#content-board')
  const note = requests.getNoteById(noteId)

  if (!note) {
    utils.showMessage('Anotação não encontrada! Pedimos desculpas :/', 'error')
    sidebar.removeNote(noteId)
    return
  }
  
  const noteType = resolveType(note)
  const backgroundColor = BACKGROUND_COLORS[noteType] || DEFAULT_BACKGROUND_COLOR
  const $el = await createElement(note)
  removeItem()
  showEmptyIcon(false)
  _hookEvents($el)

  $board.append($el)
  $board.css('background-color', backgroundColor)
}

function isNoteOpen(noteId) {
  const openId = getOpenNoteId() 
  return openId && openId == noteId
}

function getOpenNoteId() {
  const $el = $(`#${DEFAULT_DISPLAY_ID}`)
  return $el.length > 0 ? $el.attr('itemid') : null
}

function showEmptyIcon(show) {
  const $icon = $('.empty-content-box')

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

/**
 * @param {Note} note 
 * @returns {Promise<JQuery<HTMLElement>>}
 */
async function createElement(note) {
  const value = await resolveContent(note)
  const elementType = resolveType(note)
  const noteId = note.id
  let $el

  switch (elementType) {
    case 'IMAGE': $el = entity.createImageDisplay(value, noteId); break
    case 'TEXT':  $el = entity.createTextDisplay(value, noteId); break
    case 'PDF':   $el = entity.createPdfDisplay(value, noteId); break
    case 'AUDIO': $el = entity.createAudioDisplay(value, noteId); break
    case 'VIDEO': $el = entity.createVideoDisplay(value, noteId); break

    // ???
    default: {
      utils.showMessage(`Não foi possível abrir a anotação. Tipo desconhecido: ${elementType}.`, 'error')
      throw new Error(`Unknown note type: ${elementType}`)
    }
  }
  return $el
}

async function resolveContent(note) {
  const resp = await requests.fetchNote(note.id)
  return resp.content
}

function resolveType(note) {
  const type = note.note_type
  if (type === "TEXT") {
    return "TEXT"
  }

  const content = note.content
  const extIdx = content.lastIndexOf('.')
  const ext = content.substring(extIdx + 1).toLowerCase()
  
  return types[ext] || null
}

function _hookEvents($el) {
  $el.on('keydown', (e) => {
    if (e.key === 'Escape') {
      removeItem()
      showEmptyIcon(true)
    }
  })
}

export default {
  DEFAULT_DISPLAY_ID,
  openNote,
  showEmptyIcon,
  isNoteOpen,
  getOpenNoteId,
  removeItem
}