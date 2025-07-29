import requests from './requests.js'
import sidebar from './sidebar.js'

$(async () => {
  const notes = await requests.fetchNotes(false)
  sidebar.showNotes(notes)

  sidebar.initSearchBar()
})