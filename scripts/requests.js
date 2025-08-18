import checks from "./checks.js"

const BASE_URL = 'https://qrbe2ko4o5.execute-api.us-east-2.amazonaws.com/v1'
const noteCache = {}

/** @type {import("../types/note")} */

/**
 * Gets the Notes given the provided parameters.
 * 
 * If `false` is provided to the `useCache` param, then a new request will
 * be sent to the server.
 * 
 * If `true` is provided to the `useCache` param and a full fetch was never
 * sent to the server, an empty array will be returned.
 * 
 * @param {boolean} useCache Whether this method should use the cache to return the values or not.
 * @returns {Promise<Array<Note>>} The notes given the provided params.
 */
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

/**
 * Creates a new note and returns the Note object the server has created.
 * 
 * @param {CreateNote} note The note to be created.
 * @returns {Note} The note created and responded by the server.
 */
async function createNote(note) {
  checks.notNull(note, 'Note')

  const payload = new FormData()
  payload.set('name', note.name)
  payload.set('aliases', JSON.stringify(note.aliases))
  payload.set('file', note.data)

  const resp = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    body: payload
  })

  if (resp.ok) {
    return await resp.json()
  } else {
    alert(`Failed to create note (${resp.status}):\n${await resp.text()}`)
    return null
  }
}

function getNoteById(id) {
  return noteCache[id] || null
}

// =====================
// Internal
// =====================
function _setCache(notes) {
  Object.keys(noteCache).forEach(key => delete noteCache[key])

  for (const note of notes) {
    noteCache[note.id] = note
  }
}

export default { fetchNotes, createNote, getNoteById }