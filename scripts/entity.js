import $ from "jquery"

import board from "./board.js"
import sidebar from "./sidebar.js"
import notesModals from "./modals/notes-modals.js"
import { marked } from "marked"
import DOMPurify from "dompurify"
import authModal from "./modals/auth-modal.js"
import utils from "./utils.js"

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

function buildNoteUploadScreen(onSubmit) {
  return notesModals.showNoteUploadModal(onSubmit)
}

function getBlackBackground(centered = true) {
  const $el = $('<div>').addClass('black-background-container')

  if (centered) {
    $el.addClass('centered-screen')
  }
  
  return $el
}

/**
 * Displays the login screen modal.
 */
function showLoginScreen() {
  if (utils.isModalShown()) return
  
  const $background = getBlackBackground()
  const $modal = authModal.getAuthScreen(handlePostLogin)

  $background.append($modal)
  $background.appendTo('body')
}

function handlePostLogin() {
  sidebar.reloadNotes()
}

export default {
  buildNoteItem,
  createImageDisplay,
  createTextDisplay,
  createPdfDisplay,
  createAudioDisplay,
  createVideoDisplay,
  buildNoteUploadScreen,
  getBlackBackground,
  showLoginScreen
}