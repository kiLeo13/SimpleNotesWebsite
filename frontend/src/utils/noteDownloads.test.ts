import type { FullNoteResponseData, NoteResponseData } from "@/types/api/notes"

import { beforeEach, describe, expect, it, vi } from "vitest"

import { copyTextToClipboard, downloadNoteToDevice } from "./noteDownloads"
import { renderMermaidToSvg } from "./mermaid"
import { getReferenceNoteUrl } from "./noteFiles"

vi.mock("./mermaid", () => ({
  renderMermaidToSvg: vi.fn()
}))

describe("noteDownloads", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:note")
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: vi.fn()
    })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    vi.stubGlobal("fetch", vi.fn())
  })

  it("downloads markdown notes as .md files", async () => {
    const note = makeBaseNote({ note_type: "MARKDOWN", name: "Sprint plan" })
    const fetchNoteContent = vi.fn(async () => ({
      success: true as const,
      statusCode: 200,
      data: makeFullNote({
        id: note.id,
        note_type: "MARKDOWN",
        name: note.name,
        content: "# Hello"
      })
    }))

    const result = await downloadNoteToDevice(note, fetchNoteContent)

    expect(result).toEqual({ success: true, fileName: "Sprint plan.md" })
    expect(fetchNoteContent).toHaveBeenCalledWith(note.id)

    const createObjectURL = vi.mocked(URL.createObjectURL)
    const blob = createObjectURL.mock.calls[0][0] as Blob

    expect(blob.type).toBe("text/markdown;charset=utf-8")
    await expect(blob.text()).resolves.toBe("# Hello")
  })

  it("downloads reference notes as the original file without fetching full content", async () => {
    const note = makeBaseNote({
      note_type: "REFERENCE",
      name: "Attachment pointer",
      content: "attachments/archive/report.pdf"
    })
    const fetchNoteContent = vi.fn()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["pdf-bytes"], { type: "application/pdf" })
    } as Response)

    const result = await downloadNoteToDevice(note, fetchNoteContent)

    expect(result).toEqual({
      success: true,
      fileName: "Attachment pointer.pdf"
    })
    expect(fetchNoteContent).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith(
      getReferenceNoteUrl("attachments/archive/report.pdf")
    )

    const createObjectURL = vi.mocked(URL.createObjectURL)
    const blob = createObjectURL.mock.calls[0][0] as Blob

    expect(blob.type).toBe("application/pdf")
    await expect(blob.text()).resolves.toBe("pdf-bytes")
  })

  it("downloads flowcharts as SVG files", async () => {
    vi.mocked(renderMermaidToSvg).mockResolvedValue("<svg>diagram</svg>")

    const note = makeBaseNote({ note_type: "FLOWCHART", name: "System map" })
    const fetchNoteContent = vi.fn(async () => ({
      success: true as const,
      statusCode: 200,
      data: makeFullNote({
        id: note.id,
        note_type: "FLOWCHART",
        name: note.name,
        content: "graph TD; A-->B"
      })
    }))

    const result = await downloadNoteToDevice(note, fetchNoteContent)

    expect(result).toEqual({ success: true, fileName: "System map.svg" })
    expect(renderMermaidToSvg).toHaveBeenCalledWith("graph TD; A-->B")

    const createObjectURL = vi.mocked(URL.createObjectURL)
    const blob = createObjectURL.mock.calls[0][0] as Blob

    expect(blob.type).toBe("image/svg+xml;charset=utf-8")
    await expect(blob.text()).resolves.toBe("<svg>diagram</svg>")
  })

  it("copies text through the clipboard API when available", async () => {
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    })

    await copyTextToClipboard("42")

    expect(writeText).toHaveBeenCalledWith("42")
  })
})

function makeBaseNote(
  overrides: Partial<NoteResponseData> & Pick<NoteResponseData, "note_type">
): NoteResponseData {
  const base = {
    id: "7",
    name: "Note",
    tags: [],
    visibility: "PUBLIC" as const,
    department_id: null,
    created_by_id: "1",
    content_size: 12,
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z"
  }

  if (overrides.note_type === "REFERENCE") {
    return {
      ...base,
      ...overrides,
      content: overrides.content ?? "attachments/file.pdf"
    }
  }

  return {
    ...base,
    ...overrides
  }
}

function makeFullNote(
  overrides: Partial<FullNoteResponseData> &
    Pick<FullNoteResponseData, "note_type" | "content">
): FullNoteResponseData {
  return {
    id: "7",
    name: "Note",
    tags: [],
    visibility: "PUBLIC",
    department_id: null,
    created_by_id: "1",
    content_size: 12,
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z",
    ...overrides
  }
}
