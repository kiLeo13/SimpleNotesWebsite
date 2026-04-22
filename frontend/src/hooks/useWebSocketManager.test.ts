import type { GatewayMessage } from "@/models/events/GatewayEvent"
import type { FullNoteResponseData, NoteResponseData } from "@/types/api/notes"
import type { UserResponseData } from "@/types/api/users"
import { beforeEach, describe, expect, it } from "vitest"

import { handleNoteEvents } from "./useWebSocketManager"
import { serverEvents } from "@/models/events/GatewayEvent"
import { useNoteStore } from "@/stores/useNotesStore"
import { useSessionStore } from "@/stores/useSessionStore"

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

describe("handleNoteEvents", () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      state: "READY",
      _fetchPromise: null,
      shownNote: null,
      isFetchingNote: false,
      isRendering: false
    })
    useSessionStore.setState({
      user: makeUser(0)
    })
  })

  it("ignores private create events for users without hidden-note access", () => {
    handleNoteEvents(
      makeMessage(serverEvents.NoteCreated.type, makeNote({ visibility: "PRIVATE" }))
    )

    expect(useNoteStore.getState().notes).toEqual([])
  })

  it("removes an open note when a private update arrives for a user without hidden-note access", () => {
    useNoteStore.setState({
      notes: [makeNote()],
      shownNote: makeFullNote()
    })

    handleNoteEvents(
      makeMessage(serverEvents.NoteUpdated.type, makeNote({ visibility: "PRIVATE" }))
    )

    expect(useNoteStore.getState().notes).toEqual([])
    expect(useNoteStore.getState().shownNote).toBeNull()
  })

  it("keeps private notes for users with hidden-note access", () => {
    useSessionStore.setState({
      user: makeUser(1 << 4)
    })

    handleNoteEvents(
      makeMessage(serverEvents.NoteCreated.type, makeNote({ visibility: "PRIVATE" }))
    )

    expect(useNoteStore.getState().notes).toHaveLength(1)
    expect(useNoteStore.getState().notes[0]?.visibility).toBe("PRIVATE")
  })
})

function makeMessage(
  type: GatewayMessage["type"],
  data: NoteResponseData
): GatewayMessage {
  return { type, data } as GatewayMessage
}

function makeUser(permissions: number): UserResponseData {
  return {
    id: 7,
    username: "tester",
    permissions,
    presence: "ONLINE",
    isVerified: true,
    suspended: false,
    createdAt: "2026-04-21T10:00:00.000Z",
    updatedAt: "2026-04-21T10:00:00.000Z"
  }
}

function makeNote(
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
