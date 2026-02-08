import type { FullNoteResponseData, NoteResponseData } from "@/types/api/notes"

import { noteService } from "@/services/noteService"
import { toasts } from "@/utils/toastUtils"
import { create } from "zustand"

type NotesState = {
  notes: NoteResponseData[]
  isLoading: boolean
  shownNote: FullNoteResponseData | null
  isRendering: boolean

  addNote: (note: NoteResponseData) => void
  updateNote: (newNote: NoteResponseData) => void
  removeNote: (noteId: number) => void

  fetchNotes: () => Promise<void>
  openNote: (note: NoteResponseData) => Promise<void>
  closeNote: () => void

  setRendering: (flag: boolean) => void
}

export const useNoteStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  shownNote: null,
  isRendering: false,

  addNote: (note) => {
    set((state) => ({
      notes: [...state.notes, note]
    }))
  },

  updateNote: (newNote) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id == newNote.id ? { ...n, ...newNote } : n
      )
    }))
  },

  removeNote: (noteId) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
      shownNote: state.shownNote?.id === noteId ? null : state.shownNote
    }))
  },

  fetchNotes: async () => {
    set({ isLoading: true })
    const resp = await noteService.listNotes()

    set({
      notes: resp.success ? resp.data.notes : [],
      isLoading: false
    })
  },

  openNote: async (note) => {
    const { shownNote } = get()
    if (shownNote?.id === note.id) return

    set({ isRendering: true })

    // We don't need to fetch reference notes content (binary files),
    // as we just show the metadata or a download button.
    if (note.note_type === "REFERENCE") {
      set({ shownNote: note as FullNoteResponseData, isRendering: false })
      return
    }

    const resp = await noteService.fetchNote(note.id)
    if (!resp.success) {
      set({ isRendering: false })
      toasts.apiError("Não foi possível encontrar nota completa", resp)
      return
    }

    // We turn off rendering immediately for text-based notes (Markdown and Mermaid).
    // For binary files (like PDF/Images), we leave it true so the specific UI component
    const isTextBased = ["MARKDOWN", "FLOWCHART"].includes(resp.data.note_type)

    set({
      shownNote: resp.data,
      ...(isTextBased && { isRendering: false })
    })
  },

  closeNote: () => set({ shownNote: null }),

  setRendering: (flag) => set({ isRendering: flag })
}))
