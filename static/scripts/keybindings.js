import sidebar from "./sidebar.js"

const keyBindings = {
  "ctrl+r": (e) => {
    e.preventDefault()
    sidebar.reloadNotes()
  },
  "t": runSearchBarFocus,
  "/": runSearchBarFocus,
  ";": runSearchBarFocus
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
  if (e.ctrlKey) keys.push('ctrl')
  if (e.altKey) keys.push('alt')
  if (e.shiftKey) keys.push('shift')
  if (e.metaKey) keys.push('meta')
  keys.push(e.key.toLowerCase())

  return keys.join('+').toLowerCase()
}

function runSearchBarFocus(e) {
  const $search = $('#search-input')

  if (!$search.is(':focus')) {
    e.preventDefault()
    sidebar.focusSearch()
  }
}

$(onDomReady)