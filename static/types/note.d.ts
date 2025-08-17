// note.d.ts
interface Note {
  id: number
  name: string
  content: string
  visibility: "PUBLIC" | "CONFIDENTIAL"
  aliases: string[]
  created_by_id: number
  created_at: string
  updated_at: string
}

interface CreateNote {
  name: string
  data: Blob
  aliases: string[]
}