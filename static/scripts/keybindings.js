import board from "./board.js"
import sidebar from "./sidebar.js"

const keyBindings = {
  "ctrl+r": (e) => {
    e.preventDefault()
    sidebar.reloadNotes()
  },
  "t": runSearchBarFocus,
  "/": runSearchBarFocus,
  ";": runSearchBarFocus,
  "ctrl+space": runSearchBarFocus,
  "escape": handleEscape,
}

function handleKeyDown(e) {
  const combo = getKeyCombo(e)
  const action = keyBindings[combo]
  if (action) {
    action(e)
  }
}

function onDomReady() {
  $(document).on('keydown', handleKeyDown)
}

function getKeyCombo(e) {
  const keys = []
  const pressed = e.key.toLowerCase()
  if (e.ctrlKey) keys.push('ctrl')
  if (e.altKey) keys.push('alt')
  if (e.spaceBar) keys.push('space')
  if (e.shiftKey) keys.push('shift')
  if (e.metaKey) keys.push('meta')

  keys.push(pressed === ' ' ? 'space' : pressed)

  return keys.join('+').toLowerCase()
}

function handleEscape(_) {
  const $search = $('#search-input')

  if ($search.is(':focus')) {
    $search.trigger('blur') // Removes focus
    return
  }

  board.removeItem()
}

function runSearchBarFocus(e) {
  const $search = $('#search-input')

  if (!$search.is(':focus')) {
    e.preventDefault()
    sidebar.focusSearch()
  }
}

$(onDomReady)