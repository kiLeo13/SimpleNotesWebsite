import type {
  FullNoteResponseData,
  NoteResponseData,
  NoteType,
  UpdateNoteRequestPayload
} from "@/types/api/notes"
import type { NoteFormFields } from "@/types/forms/notes"
import type { ApiResponse } from "@/types/api/api"

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
  deleteNoteAndRefresh: (noteId: number) => Promise<boolean>
  updateNoteAndRefresh: (
    noteId: number,
    payload: UpdateNoteRequestPayload
  ) => Promise<boolean>

  createNoteAndOpen: (data: NoteFormFields, noteType: NoteType) => Promise<boolean>

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
      notes: state.notes.map((n) => (n.id == newNote.id ? { ...n, ...newNote } : n))
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

  createNoteAndOpen: async (data, noteType) => {
    const resp = await uploadNote(data, noteType)
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

async function uploadNote(
  note: NoteFormFields,
  type: NoteType
): Promise<ApiResponse<FullNoteResponseData>> {
  if (note.mode === "EDITOR") {
    return noteService.createTextNote({
      ...note,
      note_type: type
    })
  }

  if (note.mode === "UPLOAD") {
    return noteService.createFileNote(
      {
        ...note,
        note_type: type
      },
      note.file[0]
    )
  }

  return Promise.reject()
}
