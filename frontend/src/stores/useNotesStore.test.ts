import type { ApiResponse } from "@/types/api/api"
import type {
  FullNoteResponseData,
  ListNoteResponseData,
  NoteResponseData
} from "@/types/api/notes"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { noteService } from "@/services/noteService"
import { useNoteStore } from "./useNotesStore"

type MarkdownNote = {
  id: number
  name: string
  tags: string[]
  visibility: "PUBLIC" | "PRIVATE"
  note_type: "MARKDOWN"
  created_by_id: number
  content_size: number
  created_at: string
  updated_at: string
}

type FullMarkdownNote = MarkdownNote & {
  content: string
}

vi.mock("@/services/noteService", () => ({
  noteService: {
    listNotes: vi.fn()
  }
}))

describe("useNoteStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNoteStore.setState({
      notes: [],
      state: "READY",
      _fetchPromise: null,
      shownNote: null,
      isFetchingNote: false,
      isRendering: false
    })
  })

  it("reload clears the open note when it is no longer visible", async () => {
    useNoteStore.setState({
      notes: [makeBaseNote()],
      shownNote: makeFullNote()
    })

    vi.mocked(noteService.listNotes).mockResolvedValue(
      successListResponse([])
    )

    await useNoteStore.getState().reload()

    expect(useNoteStore.getState().notes).toEqual([])
    expect(useNoteStore.getState().shownNote).toBeNull()
  })

  it("reload keeps the open note content while refreshing metadata", async () => {
    useNoteStore.setState({
      notes: [makeBaseNote()],
      shownNote: makeFullNote()
    })

    vi.mocked(noteService.listNotes).mockResolvedValue(
      successListResponse([
        makeBaseNote({
          name: "Renamed note",
          updated_at: "2026-04-22T12:00:00.000Z"
        })
      ])
    )

    await useNoteStore.getState().reload()

    expect(useNoteStore.getState().shownNote).toMatchObject({
      id: 42,
      name: "Renamed note",
      content: "# still here"
    })
  })
})

function successListResponse(
  notes: NoteResponseData[]
): ApiResponse<ListNoteResponseData> {
  return {
    success: true,
    statusCode: 200,
    data: { notes }
  }
}

function makeBaseNote(
  overrides: Partial<MarkdownNote> = {}
): NoteResponseData {
  const note: MarkdownNote = {
    id: 42,
    name: "Architecture",
    tags: ["docs"],
    visibility: "PUBLIC",
    note_type: "MARKDOWN",
    created_by_id: 7,
    content_size: 128,
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z",
    ...overrides
  }
  return note
}

function makeFullNote(
  overrides: Partial<FullMarkdownNote> = {}
): FullNoteResponseData {
  const note: FullMarkdownNote = {
    id: 42,
    name: "Architecture",
    tags: ["docs"],
    visibility: "PUBLIC",
    note_type: "MARKDOWN",
    created_by_id: 7,
    content_size: 128,
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z",
    content: "# still here",
    ...overrides
  }
  return note
}
