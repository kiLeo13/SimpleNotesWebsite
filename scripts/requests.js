import checks from "./checks.js"
import utils from "./utils.js"
import cache from "memory-cache"

const BASE_URL = 'https://qrbe2ko4o5.execute-api.us-east-2.amazonaws.com/v1'
const noteCache = {} // Mapping NoteID -> Note
let selfCache = null

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

  if (!resp) return null
  
  if (resp.ok) {
    const notes = (await resp.json()).notes
    _setCache(notes)
  } else {
    utils.showMessage(`Failed to fetch notes with status code ${resp.status}:\n${await resp.text()}`, 'error')
  }

  return Object.values(noteCache)
}

async function fetchNoteData(noteId, url) {
  const cacheKey = `note_data_${noteId}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const resp = await makeRequest({
    url: url,
    method: "GET"
  })

  if (!resp.ok) {
    utils.showMessage(`Failed to fetch note data, returning null: ${await resp.text()}`)
    return null
  }

  const MINUTE = 60 * 1000
  const blob = await resp.blob()
  cache.put(cacheKey, blob, 5 * MINUTE)

  return blob
}

async function verifyEmail(email, code) {
  const resp = await makeRequest({
    url: `${BASE_URL}/users/confirms`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "code": code,
      "email": email
    })
  })

  if (resp.ok) {
    return true
  } else {
    utils.showMessage(`Erro: ${await resp.text()}`, 'error')
    return false
  }
}

/**
 * Checks if a given user e-mail exists on the server's database.
 * 
 * @param {string} email The e-mail to be checked.
 * @returns {Promise<boolean | null>} 
 *          Resolves to `true` if the email exists, `false` if it does not. 
 *          Resolves to `null` (and shows an error message) if the request fails.
 */
async function checkEmail(email) {
  const resp = await makeRequest({
    url: `${BASE_URL}/users/check-email`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "email": email
    })
  })

  const text = await resp.json()

  if (resp.ok) {
    return text["exists"]
  } else {
    utils.showMessage(`Não conseguimos verificar a existência de uma conta. Tente novamente mais tarde:\n${JSON.stringify(text)}`, 'error')
    return null
  }
}

async function register(username, email, password) {
  const resp = await makeRequest({
    url: `${BASE_URL}/users`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "username": username,
      "email": email,
      "password": password
    })
  })

  if (resp.ok) {
    return true
  } else {
    utils.showMessage(`Erro: ${await resp.text()}`, 'error')
    return false
  }
}

async function login(email, password) {
  const resp = await makeRequest({
    url: `${BASE_URL}/users/login`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "email": email,
      "password": password
    })
  })

  const text = await resp.json()

  if (resp.ok) {
    return text
  } else {
    utils.showMessage(`Erro: ${JSON.stringify(text)}`, 'error')
    return null
  }
}

async function retrieveSelf() {
  if (selfCache) {
    return selfCache
  }

  const resp = await makeRequest({
    url: `${BASE_URL}/users/@me`,
    method: "GET",
    authType: 'id'
  })

  if (resp.ok) {
    const text = await resp.json()
    selfCache = text
    return text
  } else {
    utils.showMessage(`Erro: ${await resp.text()}`, 'error')
    return null
  }
}

async function fetchNote(noteId) {
  const cached = noteCache[noteId]
  if (cached.content) return cached

  const resp = await makeRequest({
    url: `${BASE_URL}/notes/${noteId}`,
    method: "GET",
    authType: 'id'
  })

  if (!resp.ok) {
    utils.showMessage(await resp.text())
    return null
  }

  const body = await resp.json()
  noteCache[noteId] = body
  return body
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

  if (!resp) {
    utils.showMessage(`Failed to create note (${resp.status}):\n${await resp.text()}`, 'error')
    return null
  }

  return await resp.json()
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
  if (!req.headers) req.headers = {}

  if (req.authType === 'none' || !req.authType) return true

  const token = localStorage.getItem(`${req.authType}_token`)
  const hasSession = !!token && utils.isSignedIn()
  if (!hasSession) {
    console.warn('No valid authorization token found. Aborting request.')
    utils.showMessage('Sua sessão expirou ou ainda não existe. Por favor, faça login novamente recarregando a página.', 'error')
    return false
  }

  req.headers['Authorization'] = `Bearer ${token}`
  return true
}

export default {
  fetchNotes,
  verifyEmail,
  checkEmail,
  fetchSelf: retrieveSelf,
  register,
  login,
  fetchNote,
  createNote,
  getNoteById
}