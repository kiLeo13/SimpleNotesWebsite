import $ from "jquery"

import board from "./board.js"
import keybindings from "./keybindings.js"
import requests from "./requests.js"
import sidebar from "./sidebar.js"
import utils from "./utils.js"
import entity from "./entity.js"

const DOCUMENT_TITLE = 'Consórcio Magalu - Anotações'

$(async () => {
  if (utils.isSignedIn()) {
    const notes = await requests.fetchNotes(false)
    sidebar.initSidebar()
    sidebar.showNotes(notes) 
  } else {
    sidebar.showNotes([]) // Shows empty results just for a better UI experience XD
    entity.showLoginScreen()
  }
  
  keybindings.initKeybindings()

  runCyclicDocumentTitle()
})

function runCyclicDocumentTitle() {
  let showNoteTitle = false

  // Every 5 seconds, we are going to attempt to cycle the document title,
  // from `DOCUMENT_TITLE` to the current open note (if any).
  setInterval(() => {
    if (!showNoteTitle) {
      document.title = DOCUMENT_TITLE
      showNoteTitle = !showNoteTitle
      return
    }

    const noteId = board.getOpenNoteId()
    const note = requests.getNoteById(noteId)

    if (note) {
      document.title = note.name
    }

    showNoteTitle = !showNoteTitle
  }, 5000);
}