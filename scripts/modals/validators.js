import $ from "jquery"
import entity from "../entity.js"

const MIN_NOTE_ALIAS_LENGTH = 2
const MAX_NOTE_ALIAS_LENGTH = 30
const MAX_NOTE_ALIASES = 50
const MAX_NOTE_FILE_SIZE_BYTES = 100 * 1024 * 1024
const MIN_NOTE_NAME_LENGTH = 2
const MAX_NOTE_NAME_LENGTH = 80
const VISIBLITY_OPTIONS = [
  { value: 'PUBLIC', text: 'Público' },
  { value: 'CONFIDENTIAL', text: 'Confidencial' }
]

/**
 * @param {JQuery.SubmitEvent<HTMLElement>} e
 */
function modalNameValidator(e) {
  const $el = $(e.target)
  const text = $el.val().trim()

  return text === '' ? 'Nomes não podem estar vazios' : null 
}

function modalAliasesValidator(e) {
  const $el = $(e.target)
  const val = $el.val()

  if (!val || val.trim() === '') {
    return null
  }

  const words = val.split(' ')  
  if (words.length > 50) {
    return `Máximo de apelidos: ${entity.MAX_NOTE_ALIASES}, fornecido: ${words.length}`
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

function modalFileValidator(e) {
  const file = e.target.files?.[0]
  
  // Maybe the array is empty? Better safe than sorry?
  if (!file) return null

  const fileTooBig = file.size > entity.MAX_NOTE_FILE_SIZE_BYTES
  return fileTooBig ? getFileTooBigErrorMessage(file.size) : null
}

function checkAlias(val) {
  if (val.trim() === '') return 'Apelido fornecido aparenta estar vazio'

  const length = val.length
  if (length < entity.MIN_NOTE_ALIAS_LENGTH) return `Apelidos precisam ter pelo menos ${entity.MIN_NOTE_ALIAS_LENGTH} caracteres`
  if (length > entity.MAX_NOTE_ALIAS_LENGTH) return `Apelidos podem ter, no máximo, ${entity.MAX_NOTE_ALIAS_LENGTH} caracteres`
  return null
}

function getFileTooBigErrorMessage(size) {
  return `Arquivo grande demais: ${utils.getPrettySize(size)}, máx.: ${utils.getPrettySize(entity.MAX_NOTE_FILE_SIZE_BYTES)}`
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
  VISIBLITY_OPTIONS
}