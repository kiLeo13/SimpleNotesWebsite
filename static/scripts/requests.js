const BASE_URL = 'https://qrbe2ko4o5.execute-api.us-east-2.amazonaws.com/v1'
const noteCache = {}

async function fetchNotes(useCache = true) {
  if (useCache) return Object.values(noteCache)

  const resp = await fetch(`${BASE_URL}/notes`)
  
  if (resp.ok) {
    const notes = (await resp.json()).notes
    _setCache(notes)
  } else {
    alert(`Failed to fetch notes with status code ${resp.status}:\n${await resp.text()}`)
  }

  return Object.values(noteCache)
}

function getNoteById(id) {
  return noteCache[id] || null
}

function _setCache(notes) {
  Object.keys(noteCache).forEach(key => delete noteCache[key])

  for (const note of notes) {
    noteCache[note.id] = note
  }
}

export default { fetchNotes, getNoteById }