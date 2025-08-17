import board from './board.js'
import entity from './entity.js'
import modals from './modals/modals.js'
import requests from './requests.js'
// Every function with a leading underscore is private

const BASE_SIDEBAR_PADDING_PX = 13

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
  initSearchBar()
  initHoverActions()
  initUploadButtonListener()
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

function initUploadButtonListener() {
  $('#create-note-button').on('click', () => {
    const $blackscreen = entity.getBlackBackground(true)
    const $uploadscreen = entity.buildNoteUploadScreen()

    $uploadscreen.on('submit', (e) => {
      e.preventDefault()

      $blackscreen.remove()
    })

    $blackscreen.append($uploadscreen)
    $blackscreen.appendTo('body')
  })
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
      const aliases = note.aliases

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
  const fullSize = _resolveFitContentWidth($note)
  const $sidebar = $('.left-menu')

  $($note).on('mouseenter', () => {
    const noteOuterWidth = $note.outerWidth()

    // If the new size is smaller than the default, don't resize
    if (fullSize < noteOuterWidth) return

    const diff = fullSize - noteOuterWidth
    const newSize = $sidebar.outerWidth() + diff
    $sidebar.css('width', `${newSize}px`)
  })
  
  $($note).on('mouseleave', () => {
    $sidebar.css('width', '')
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
  if (typeof count !== 'number')
    throw new TypeError(`Result Count is expected to be a number, but a ${typeof count} was provided: ${count}`)

  const $item = $('#search-result-count')
  $item.empty()

  const label = count === 1 ? 'resultado encontrado' : 'resultados encontrados'
  const $bold = $('<span>')
    .text(count)
    .css('font-weight', 600)

  $item.append($bold).append(` ${label}`)
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
  initSidebar
}