import type {
  FullNoteResponseData,
  NoteRequestPayload,
  NoteResponseData,
  UpdateNoteRequestPayload
} from "@/types/api/notes"
import { noteService } from "@/services/noteService"

import { toasts } from "@/utils/toastUtils"
import { create } from "zustand"

type NotesState = {
  notes: NoteResponseData[]
  isLoading: boolean
  shownNote: FullNoteResponseData | null
  isRendering: boolean

  fetchNotes: () => Promise<void>
  openNote: (note: NoteResponseData) => Promise<void>
  closeNote: () => void
  deleteNoteAndRefresh: (noteId: number) => Promise<boolean>
  updateNoteAndRefresh: (
    noteId: number,
    payload: UpdateNoteRequestPayload
  ) => Promise<boolean>
  createNoteAndOpen: (
    payload: NoteRequestPayload,
    file: File
  ) => Promise<boolean>
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

    set({
      notes: resp.success ? resp.data.notes : [],
      isLoading: false
    })
  },

  openNote: async (note) => {
    const { shownNote } = get()
    if (shownNote?.id === note.id) return

    set({ isRendering: true })

    // We don't need to fetch reference notes, as the `content` is already present
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

    // We only turn off rendering for TEXT
    // (Assuming PDFs/Images handle their own loading state in the UI component)
    const isText = resp.data.note_type === "TEXT"

    set({
      shownNote: resp.data,
      ...(isText && { isRendering: false })
    })
  },

  closeNote: () => set({ shownNote: null }),

  deleteNoteAndRefresh: async (noteId) => {
    const resp = await noteService.deleteNote(noteId)
    if (!resp.success) {
      toasts.apiError("Erro ao apagar anotação", resp)
      return false
    }

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
      shownNote: state.shownNote?.id === noteId ? null : state.shownNote
    }))

    return true
  },

  updateNoteAndRefresh: async (noteId, payload) => {
    const resp = await noteService.updateNote(noteId, payload)
    if (!resp.success) {
      toasts.apiError("Erro ao atualizar anotação", resp)
      return false
    }

    toasts.success("Nota atualizada com sucesso")

    set((state) => ({
      notes: state.notes.map((n) => (n.id === noteId ? resp.data : n)),
      // If the updated note is currently open, update the view too
      shownNote:
        state.shownNote?.id === noteId
          ? { ...state.shownNote, ...resp.data }
          : state.shownNote
    }))

    return true
  },

  createNoteAndOpen: async (data, file) => {
    const resp = await noteService.createNote(data, file)
    if (!resp.success) {
      toasts.apiError("Não foi possível criar anotação", resp)
      return false
    }

    set((state) => ({
      notes: [...state.notes, resp.data],
      shownNote: resp.data
    }))
    return true
  },

  setRendering: (flag) => set({ isRendering: flag })
}))
