import type {
  FullNoteResponseData,
  ListNoteResponseData,
  NoteResponseData
} from "@/types/api/notes"
import type { ApiErrorResponse, ApiResponse } from "@/types/api/api"

import { noteService } from "@/services/noteService"
import { create } from "zustand"

export type NotesStoreState = "NONE" | "LOADING" | "READY" | "ERROR"

type NotesState = {
  notes: NoteResponseData[]
  state: NotesStoreState
  _fetchPromise: Promise<ApiResponse<ListNoteResponseData> | void> | null

  shownNote: FullNoteResponseData | null
  isFetchingNote: boolean
  isRendering: boolean

  addNote: (note: NoteResponseData) => void
  updateNote: (newNote: NoteResponseData) => void
  removeNote: (noteId: number) => void
  getNoteById: (noteId: number) => NoteResponseData | null

  ensureLoaded: () => Promise<ApiResponse<ListNoteResponseData> | void>
  reload: () => void

  openNote: (noteId: number) => Promise<ApiErrorResponse | void>
  renderNote: (note: FullNoteResponseData) => void
  closeNote: () => void

  setRendering: (flag: boolean) => void
}

export const useNoteStore = create<NotesState>((set, get) => ({
  notes: [],
  state: "NONE",
  _fetchPromise: null,
  shownNote: null,
  isFetchingNote: false,
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

  getNoteById(noteId) {
    const note = get().notes.find((n) => n.id === noteId)
    return note || null
  },

  ensureLoaded() {
    const { state, _fetchPromise } = get()
    if (state === "READY") return Promise.resolve()
    if (_fetchPromise) return _fetchPromise

    const promise = (async () => {
      set({ state: "LOADING" })

      const resp = await noteService.listNotes()
      if (resp.success) {
        set({ notes: resp.data.notes, state: "READY" })
      } else {
        set({ state: "ERROR" })
      }
      return resp
    })()

    set({ _fetchPromise: promise.finally(() => set({ _fetchPromise: null })) })
    return promise
  },

  async reload() {
    const { state } = get()
    if (state !== "READY") return

    // Since this function is just a reload function, if something fails
    // we just do nothing... sad day, right?
    set({ state: "LOADING" })
    try {
      const resp = await noteService.listNotes()
      if (resp.success) {
        set({ notes: resp.data.notes })
      }
    } catch (error) {
      console.error(error)
    } finally {
      set({ state: "READY" })
    }
  },

  openNote: async (noteId) => {
    const { shownNote, ensureLoaded } = get()

    if (shownNote?.id === noteId) return

    set({ shownNote: null, isFetchingNote: true, isRendering: false })

    const loadResp = await ensureLoaded()
    if (loadResp && !loadResp.success) {
      set({ isFetchingNote: false })
      return loadResp
    }

    // Find the base metadata from our sidebar list
    const baseNote = get().notes.find((n) => n.id === noteId)
    if (!baseNote) {
      set({ isFetchingNote: false })
      return {
        success: false,
        statusCode: 404,
        errors: { root: ["notFound"] }
      }
    }

    if (baseNote.note_type === "REFERENCE") {
      set({
        shownNote: baseNote as FullNoteResponseData,
        isFetchingNote: false
      })
      return
    }

    const resp = await noteService.fetchNote(noteId)
    if (!resp.success) {
      set({ isFetchingNote: false })
      return resp
    }

    const isTextBased = ["MARKDOWN", "FLOWCHART"].includes(resp.data.note_type)
    set({
      shownNote: resp.data,
      isFetchingNote: false,
      isRendering: !isTextBased
    })
  },

  renderNote(note) {
    const isTextBased = ["MARKDOWN", "FLOWCHART"].includes(note.note_type)

    set({
      shownNote: note,
      isFetchingNote: false,
      isRendering: !isTextBased
    })
  },

  closeNote: () => set({ shownNote: null }),

  setRendering: (flag) => set({ isRendering: flag })
}))
