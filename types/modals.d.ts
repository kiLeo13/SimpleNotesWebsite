// modals.d.ts
interface ModalListener {
  type: string
  handler: (e: JQuery.Event) => void
}

interface ModalValidator {
  type: string
  handler: ($el: JQuery<HTMLElement>) => string | null
}

interface NoteModalInput {
  id: string
  labelName: string
  required?: boolean
  classes?: string[]
  helpText?: string
}

interface NoteModalTextInput extends NoteModalInput {
  type: 'text' | 'password' | 'email' | 'number'
  placeholder?: string
  value?: string
  minlength?: number
  maxlength?: number
  listeners: ModalListener[]
}

interface NoteModalDropdownInput extends NoteModalInput {
  options: { text: string; value: string; default: true }[]
  listeners: ModalListener[]
  validators: ModalValidator[]
}

interface NoteModalFileInput extends NoteModalInput {
  accept?: string[]
  // No validators or listeners here, they have to be hard coded for this input type
}