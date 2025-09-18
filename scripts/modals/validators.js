import utils from "../utils.js"

const MIN_NOTE_ALIAS_LENGTH = 2
const MAX_NOTE_ALIAS_LENGTH = 30
const MAX_NOTE_ALIASES = 50
const MAX_NOTE_FILE_SIZE_BYTES = 30 * 1024 * 1024
const MIN_NOTE_NAME_LENGTH = 2
const MAX_NOTE_NAME_LENGTH = 80
const NOTE_FILE_TYPES = ["txt", "md", "pdf", "png", "jpg", "jpeg", "jfif", "webp", "gif", "mp4", "mp3"]
const VISIBLITY_OPTIONS = [
  { value: 'PUBLIC', text: 'Público' },
  { value: 'CONFIDENTIAL', text: 'Confidencial' }
]

/**
 * @param {JQuery.SubmitEvent<HTMLElement>} e
 */
function modalNameValidator($el) {
  const text = $el.val().trim()

  if (text.length < MIN_NOTE_NAME_LENGTH) {
    return `Nomes precisam ter pelo menos ${MIN_NOTE_NAME_LENGTH} caracteres`
  }

  if (text.length > MAX_NOTE_NAME_LENGTH) {
    return `Nomes podem ter, no máximo, ${MAX_NOTE_NAME_LENGTH} caracteres`
  }

  return text === '' ? 'Nomes não podem estar vazios' : null 
}

function modalAliasesValidator($el) {
  const val = $el.val()

  if (!val || val.trim() === '') {
    return null
  }

  const words = val.split(' ')  
  if (words.length > 50) {
    return `Máximo de apelidos: ${MAX_NOTE_ALIASES}, fornecido: ${words.length}`
  }
  
  for (const alias of words) {
    const errMsg = checkAlias(alias)
    if (errMsg) {
      return errMsg
    }
  }

  $el.val(val.toLowerCase())
  return null
}

function modalFileValidator($el) {
  const file = $el.prop('files')?.[0]
  
  // Maybe the array is empty? Better safe than sorry?
  if (!file) return null
  
  const fileTooBig = file.size > MAX_NOTE_FILE_SIZE_BYTES
  return fileTooBig ? getFileTooBigErrorMessage(file.size) : null
}

function checkAlias(val) {
  if (val.trim() === '') return 'Apelido fornecido aparenta estar vazio'

  const length = val.length
  if (length < MIN_NOTE_ALIAS_LENGTH) return `Apelidos precisam ter pelo menos ${MIN_NOTE_ALIAS_LENGTH} caracteres`
  if (length > MAX_NOTE_ALIAS_LENGTH) return `Apelidos podem ter, no máximo, ${MAX_NOTE_ALIAS_LENGTH} caracteres`
  return null
}

function getFileTooBigErrorMessage(size) {
  return `Arquivo grande demais: ${utils.getPrettySize(size)}, máx.: ${utils.getPrettySize(MAX_NOTE_FILE_SIZE_BYTES)}`
}

export default {
  modalAliasesValidator,
  modalFileValidator,
  modalNameValidator,

  // Constants
  MIN_NOTE_ALIAS_LENGTH,
  MAX_NOTE_ALIAS_LENGTH,
  MAX_NOTE_ALIASES,
  MAX_NOTE_FILE_SIZE_BYTES,
  MIN_NOTE_NAME_LENGTH,
  MAX_NOTE_NAME_LENGTH,
  NOTE_FILE_TYPES,
  VISIBLITY_OPTIONS
}