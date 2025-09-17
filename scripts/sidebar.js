import $ from "jquery"
import board from "./board.js"
import entity from "./entity.js"
import requests from "./requests.js"
import utils from "./utils.js"

const BASE_SIDEBAR_PADDING_PX = 13
let hasSidebarInit = false

function focusSearch() {
  $('#search-input').trigger('focus')
}

async function reloadNotes() {
  _clearNotes()
  _showLoader(true)

  const notes = await requests.fetchNotes(false)

  // Auth failed
  if (notes === null) {
    entity.showLoginScreen()
    return
  }

  showNotes(notes)
  _showLoader(false)
}

function showNotes(notes) {
  const orderedNotes = notes.sort((a, b) => a.name.localeCompare(b.name));
  const $container = $('#notes-container')
  _clearNotes()
  _showResultCount(notes.length)
  _showLoader(false)

  for (const note of orderedNotes) {
    const $noteItem = _buildNoteItem(note)
    _hookNoteEvents($noteItem)

    $container.append($noteItem)
  }
}

function removeNote(noteId) {
  $('.note-item').each(function() {
    const $note = $(this)

    if ($note.attr('itemid') == noteId) {
      $note.remove()
    }
  })
}

function initSidebar() {
  if (hasSidebarInit) return
  
  initSearchBar()
  initHoverActions()
  initUploadButtonListener()

  hasSidebarInit = true
}

function toggleSearchBar(enable = true) {
  const $bar = $('#search-input')
  const isDisabled = $bar.is(':disabled')

  if (enable && isDisabled) {
    $bar.removeAttr('disabled')
  }

  if (!enable && !isDisabled) {
    $bar.attr('disabled', 'true')
  }
}

async function initUploadButtonListener() {
  const $upload = $('#create-note-button')
  const self = await requests.fetchSelf()

  if (!self || !self["is_admin"]) {
    $upload.hide()
    return
  }

  $upload.show()
  $upload.on('click', () => {
    const $blackscreen = entity.getBlackBackground(true)
    const closeModal = () => $blackscreen.remove()
    const $modal = entity.buildNoteUploadScreen((e) => onNoteCreateSubmit(e, $modal, closeModal))
    
    $blackscreen.append($modal)
    $blackscreen.appendTo('body')
  })
}

function setNoteCreateLoading(flag) {
  const $loader = $('.create-note-loader-container')
  const $btn = $('.modal-submit-button')

  if (flag) {
    $loader.show()
    $btn.attr('disabled', true)
  } else {
    $loader.hide()
    $btn.removeAttr('disabled')
  }
}

/**
 * @param {JQuery.SubmitEvent} e The event triggered by the form submission.
 * @param {JQuery<HTMLElement>} $modal The modal element itself.
 * @param {Function} closeModal A function that closes the modal when called.
 */
async function onNoteCreateSubmit(e, $modal, closeModal) {
  e.preventDefault()

  const name = $('.create-note-name-input-field').val().trim()
  const visibility = $('.create-note-visibility-input-field').val()
  const tagsRaw = $('.create-note-tags-input-field').val().trim()
  const tags = tagsRaw === '' ? [] : tagsRaw.split(' ').map(a => a.trim().toLowerCase())
  const fileInput = $('.create-note-file-input-field')[0]
  const file = fileInput?.files?.[0]
  
  if (!file) {
    utils.showMessage('Por favor, forneça um arquivo para a nota.', 'error')
    return
  }

  //$modal.css('animation', 'shake 0.2s linear infinite')
  setNoteCreateLoading(true)
  const resp = await requests.createNote({
    note: {
      name: name,
      visibility: visibility,
      tags: tags
    },
    file: {
      file: file,
      fileName: file?.name
    }
  })
  //$modal.css('animation', '')
  setNoteCreateLoading(false)

  // We failed and the method itself has already shown an error message.
  if (!resp) return

  closeModal()
  utils.showMessage(`Nota "${resp.name}" criada com sucesso!`, 'success')

  await reloadNotes()
  board.openNote(resp.id)
}

function initSearchBar() {
  const $bar = $('#search-input')

  toggleSearchBar(true)
  $bar.on('input', async () => {
    const search = $bar.val().trim().toLowerCase()
    const notes = await requests.fetchNotes()
    _clearNotes()

    const filtered = notes.filter(note => {
      const name = note.name.toLowerCase()
      const aliases = note.tags

      return name.includes(search) || _findsByAliases(aliases, search)
    })
    showNotes(filtered)
  })
}

function initHoverActions() {
  /*  
   * This makes sure the content doesn't shift when the scrollbar appears.
   * We reduce the padding when it's visible to keep everything
   * in the same place and avoid that "jump" effect.
   */
  const $sidebar = $('.menu-lower-items')

  $sidebar.on('mouseenter', function ()  {
    const overflows = this.scrollHeight > this.clientHeight
    
    if (overflows) {
      const scrollbarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'))
      
      $sidebar.css('padding-right', `${BASE_SIDEBAR_PADDING_PX - scrollbarWidth}px`)
    }
  })

  $sidebar.on('mouseleave', () => {
    $sidebar.css('padding-right', '')
  })
}

function _clearNotes() {
  const $notes = $('.note-item')
  $notes.remove()
}

function _findsByAliases(aliases, search) {
  if (!aliases || aliases.length === 0) return false

  if (!search || search === '') return true

  return aliases.some(alias => alias.toLowerCase().includes(search))
}

function _hookNoteEvents($note) {
  $($note).on('click', () => {
    const noteId = $note.attr('itemid')
    board.openNote(noteId)
  })
}

function _buildNoteItem(note) {
  return entity.buildNoteItem(note)
}

function _showResultCount(count) {
  if (typeof count !== 'number')
    throw new TypeError(`Result Count is expected to be a number, but a ${typeof count} was provided: ${count}`)

  const $item = $('#search-result-count')
  $item.empty()

  const label = count === 1 ? '1 resultado encontrado' : `${count} resultados encontrados`
  $item.append(`${label}`)
}

function _showLoader(show) {
  const $item = $('#sidebar-loader')

  if (show) {
    $item.show()
  } else {
    $item.hide()
  }
}

export default {
  reloadNotes,
  focusSearch,
  showNotes,
  removeNote,
  initSidebar
}