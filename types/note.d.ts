// note.d.ts
interface Note {
  id: number
  name: string
  content: string
  visibility: "PUBLIC" | "CONFIDENTIAL"
  tags: string[]
  created_by_id: number
  created_at: string
  updated_at: string
}

type NoteVisibility = "PUBLIC" | "CONFIDENTIAL"

interface NoteFile {
  fileName: string
  file: File
}

interface NotePart {
  name: string
  visibvility: NoteVisibility
  tags: string[]
}

interface CreateNote {
  note: NotePart
  file: NoteFile
}