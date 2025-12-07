import type { FullNoteResponseData, NoteRequestPayload, NoteResponseData } from "@/types/api/notes"
import { noteService } from "@/services/noteService"

import { create } from "zustand"

type NotesState = {
  // Sidebar State
  notes: NoteResponseData[]
  isLoading: boolean

  // Content State
  shownNote: FullNoteResponseData | null
  isRendering: boolean

  // Actions
  fetchNotes: () => Promise<void>
  openNote: (note: NoteResponseData) => Promise<void>
  closeNote: () => void
  deleteNoteAndRefresh: (noteId: number) => Promise<boolean>
  createNoteAndOpen: (payload: NoteRequestPayload, file: File) => Promise<boolean>
  setRendering: (flag: boolean) => void
}

export const useNoteStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  shownNote: null,
  isRendering: false,

  fetchNotes: async () => {
    set({ isLoading: true })
    const resp = await noteService.listNotes()
    if (resp.success) {
      set({ notes: resp.data.notes })
    }
    set({ isLoading: false })
  },

  openNote: async (note) => {
    const currentShown = get().shownNote
    if (currentShown?.id === note.id) return

    set({ isRendering: true })

    const resp = await noteService.fetchNote(note.id)
    if (!resp.success) {
      set({ isRendering: false })
      alert("Failed to load note.")
      return
    }

    set({ shownNote: resp.data })

    if (resp.data.note_type === 'TEXT') {
      set({ isRendering: false })
    }
  },

  closeNote: () => set({ shownNote: null }),

  deleteNoteAndRefresh: async (noteId) => {
    const resp = await noteService.deleteNote(noteId)

    if (!resp.success) return false

    const currentNotes = get().notes
    const currentShown = get().shownNote

    set({
      notes: currentNotes.filter(n => n.id !== noteId),
      shownNote: currentShown?.id === noteId ? null : currentShown
    })

    return true
  },

  createNoteAndOpen: async (data, file) => {
    const resp = await noteService.createNote(data, file)
    
    if (!resp.success) return false

    await get().fetchNotes()

    set({ shownNote: resp.data })
    return true
  },

  setRendering: (flag) => set({ isRendering: flag })
}))