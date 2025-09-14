import checks from "./checks.js"
import utils from "./utils.js"

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

  const resp = await makeRequest({
    url: `${BASE_URL}/notes`,
    method: 'GET',
    authType: 'id'
  })

  if (!resp) return []
  
  if (resp.ok) {
    const notes = (await resp.json()).notes
    _setCache(notes)
  } else {
    utils.showMessage(`Failed to fetch notes with status code ${resp.status}:\n${await resp.text()}`, 'error')
  }

  return Object.values(noteCache)
}

/**
 * Creates a new note and returns the Note object the server has created.
 * 
 * @param {CreateNote} note The note to be created.
 * @returns {Promise<Note>} The note created and responded by the server.
 */
async function createNote(note) {
  checks.notNull(note, 'Note')

  const payload = new FormData()
  payload.append('json_payload', JSON.stringify(note.note))
  payload.append('content', note.file.file, note.file.fileName)

  const resp = await makeRequest({
    url: `${BASE_URL}/notes`,
    method: 'POST',
    body: payload,
    authType: 'id'
  })

  if (!resp) return null

  if (resp.ok) {
    return await resp.json()
  } else {
    utils.showMessage(`Failed to create note (${resp.status}):\n${await resp.text()}`, 'error')
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

/**
 * Sends an application request to the server and returns the response.
 * 
 * @param {ApplicationRequest} req The request to be sent.
 * @returns {Promise<Response> | null} The response from the server.
 *          This method returns `null` if no authorization token was found or the server responded wiht a 401 status code.
 */
async function makeRequest(req) {
  checks.notNull(req, 'Request')

  const ok = finalizeRequest(req)
  if (!ok) return null

  const resp = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body
  })
  
  if (resp.status === 401) {
    console.warn('The server responded with a 401 status code. Aborting request.')
    utils.showMessage('Sua sessão expirou ou ainda não existe. Por favor, faça login novamente recarregando a página.', 'error')
    return null
  }
  return resp
}

function finalizeRequest(req) {
  if (!req.authType) {
    req.authType = 'access'
  }

  const token = localStorage.getItem(`${req.authType}_token`)
  const hasSession = !!token && utils.isSignedIn()
  if (!hasSession) {
    console.warn('No valid authorization token found. Aborting request.')
    utils.showMessage('Sua sessão expirou ou ainda não existe. Por favor, faça login novamente recarregando a página.', 'error')
    return false
  }

  if (!req.headers) req.headers = {}
  req.headers['Authorization'] = `Bearer ${token}`
  return true
}

export default { fetchNotes, createNote, getNoteById }