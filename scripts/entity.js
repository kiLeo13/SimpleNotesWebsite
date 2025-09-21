import $ from "jquery"

import board from "./board.js"
import sidebar from "./sidebar.js"
import notesModals from "./modals/notes-modals.js"
import { marked } from "marked"
import DOMPurify from "dompurify"
import authModal from "./modals/auth-modal.js"
import utils from "./utils.js"

const CDN_BASE_URL = 'https://d26143aouxq3ma.cloudfront.net/attachments'

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
    .attr('src', `${CDN_BASE_URL}/${value}`)
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
    .attr('src', `${CDN_BASE_URL}/${value}`)
    .attr('type', 'application/pdf')
}

function createAudioDisplay(value, noteId) {
  return $('<audio>')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .addClass('note-frame-audio')
    .attr('controls', true)
    .attr('src', `${CDN_BASE_URL}/${value}`)
}

function createVideoDisplay(value, noteId) {
  return $('<video>')
    .addClass('note-frame-video')
    .attr('id', board.DEFAULT_DISPLAY_ID)
    .attr('itemid', noteId)
    .attr('controls', true)
    .attr('src', `${CDN_BASE_URL}/${value}`)
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

function getPrivateNoteWarning() {
  const $background = getBlackBackground()
  const $cont = $('<div>').addClass('private-warning-container')
  const $header = buildPrivateWarningHeader()
  const $body = buildPrivateWarningBody()
  const $div = $('<div>').addClass('private-warning-divisor')
  const $footer = $('<div>').addClass('private-warning-footer')
  const $button = buildPrivateWarningButton()

  $footer.append($button)
  $cont.append($header, $body, $div, $footer)

  $button.on('click', () => $background.remove())

  // Make it a little darker than usual :P
  $background.css('background-color', 'rgba(0, 0, 0, 0.8)')

  $background.append($cont)
  $background.appendTo('body')
}

function buildPrivateWarningHeader() {
  const $cont = $('<div>').addClass('private-warning-header')
  const $svg = createPrivateIcon()
  const $message = $('<span>').text('Arquivo Privado')

  return $cont.append($svg, $message)
}

function buildPrivateWarningBody() {
  const $container = $('<div>').addClass('private-warning-body')
  
  $container.append('Este arquivo ')
  $container.append($('<b>').append($('<u>').text('NÃO DEVE')))
  $container.append(' ser enviado para fora desta organização e apenas lhe é autorizado a visualização para uso interno.')
  return $container
}

function buildPrivateWarningButton() {
  return $('<button>')
    .addClass('private-warning-btn-ok')
    .text('Entendi')
}

function createPrivateIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("role", "img")
  svg.setAttribute("width", "22")
  svg.setAttribute("height", "22")
  svg.setAttribute("viewBox", "0 0 24 24")

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  circle.setAttribute("cx", "12")
  circle.setAttribute("cy", "12")
  circle.setAttribute("r", "10")
  circle.setAttribute("fill", "transparent")

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path.setAttribute("fill", "currentColor")
  path.setAttribute("fill-rule", "evenodd")
  path.setAttribute("d", "M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1.44-15.94L13.06 14a1.06 1.06 0 0 1-2.12 0l-.38-6.94a1 1 0 0 1 1-1.06h.88a1 1 0 0 1 1 1.06Zm-.19 10.69a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z")
  path.setAttribute("clip-rule", "evenodd")

  svg.appendChild(circle)
  svg.appendChild(path)
  
  return $(svg)
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

async function handlePostLogin() {
  sidebar.initSidebar()
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
  getPrivateNoteWarning,
  showLoginScreen
}