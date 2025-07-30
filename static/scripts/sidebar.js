import board from './board.js'
import entity from './entity.js'
import requests from './requests.js'
// Every function with a leading underscore is private

function focusSearch() {
  $('#search-input').trigger('focus')
}

async function reloadNotes() {
  _clearNotes()
  _showLoader(true)

  const notes = await requests.fetchNotes(false)
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
    _hookEvents($noteItem)

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

function initSearchBar() {
  const $bar = $('#search-input')
  
  $bar.on('input', async () => {
    const search = $bar.val().toLowerCase()
    const notes = await requests.fetchNotes()
    _clearNotes()

    const filtered = notes.filter(note => {
      const name = note.name.toLowerCase()
      const aliases = note.aliases

      return name.includes(search) || _findsByAliases(aliases, search)
    })
    showNotes(filtered)
  })
}

function _clearNotes() {
  const $notes = $('.note-item')
  $notes.remove()
}

function _findsByAliases(search) {
  if (!aliases || aliases.length === 0) return false

  return aliases.some(alias => alias.toLowerCase().includes(search))
}

function _hookEvents($note) {
  $($note).on('mouseenter', () => {
    const fullSize = _resolveFitContentWidth($note)

    // If the new size is smaller than the default, don't resize
    if (fullSize < $note.outerWidth()) return

    $note.css('width', `${fullSize}px`)
  })
  
  $($note).on('mouseleave', () => {
    $note.css('width', '100%')
  })

  $($note).on('click', () => {
    const noteId = $note.attr('itemid')
    board.openNote(noteId)
  })
}

function _buildNoteItem(note) {
  return entity.buildNoteItem(note)
}

function _showResultCount(count) {
  const $item = $('#search-result-count')

  if (count === 1) {
    $item.text('1 resultado encontrado')
  } else {
    $item.text(`${count} resultados encontrados`)
  }
}

function _showLoader(show) {
  const $item = $('#sidebar-loader')

  if (show) {
    $item.show()
  } else {
    $item.hide()
  }
}

function _resolveFitContentWidth($el) {
  const $clone = $el.clone()
    .css({
      position: 'absolute',
      visibility: 'hidden',
      width: 'fit-content',
      whiteSpace: 'nowrap'
    })
    .appendTo('body')

    const fitContentWidth = $clone.outerWidth()
    $clone.remove()
    return fitContentWidth
}

export default {
  reloadNotes,
  focusSearch,
  showNotes,
  removeNote,
  initSearchBar
}