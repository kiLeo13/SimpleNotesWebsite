import type { ApiErrorResponse, ApiResponse } from "@/types/api/api"
import type { FullNoteResponseData, NoteResponseData } from "@/types/api/notes"

import { renderMermaidToSvg } from "./mermaid"
import { getReferenceDownloadName, getReferenceNoteUrl } from "./noteFiles"

type FetchNoteContent = (
  noteId: string
) => Promise<ApiResponse<FullNoteResponseData>>

type DownloadNoteFailure =
  | {
      success: false
      reason: "api"
      error: ApiErrorResponse
    }
  | {
      success: false
      reason: "unexpected"
      error: Error
    }

type DownloadNoteSuccess = {
  success: true
  fileName: string
}

export type DownloadNoteResult = DownloadNoteSuccess | DownloadNoteFailure

const MARKDOWN_MIME = "text/markdown;charset=utf-8"
const SVG_MIME = "image/svg+xml;charset=utf-8"
const INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*]/g

export async function downloadNoteToDevice(
  note: NoteResponseData,
  fetchNoteContent: FetchNoteContent
): Promise<DownloadNoteResult> {
  try {
    if (note.note_type === "REFERENCE") {
      const response = await fetch(getReferenceNoteUrl(note.content))
      if (!response.ok) {
        throw new Error(`Failed to download reference note: ${response.status}`)
      }

      const fileName = sanitizeFileName(
        getReferenceDownloadName(note.name, note.content)
      )
      triggerFileDownload(await response.blob(), fileName)

      return {
        success: true,
        fileName
      }
    }

    const response = await fetchNoteContent(note.id)
    if (!response.success) {
      return {
        success: false,
        reason: "api",
        error: response
      }
    }

    if (note.note_type === "FLOWCHART") {
      const svg = await renderMermaidToSvg(response.data.content)
      const fileName = ensureFileExtension(note.name, "svg")

      triggerFileDownload(new Blob([svg], { type: SVG_MIME }), fileName)

      return { success: true, fileName }
    }

    const fileName = ensureFileExtension(note.name, "md")
    triggerFileDownload(
      new Blob([response.data.content], { type: MARKDOWN_MIME }),
      fileName
    )

    return { success: true, fileName }
  } catch (error) {
    return {
      success: false,
      reason: "unexpected",
      error: toError(error)
    }
  }
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.setAttribute("readonly", "true")
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"

  document.body.appendChild(textArea)
  textArea.select()

  const copied = document.execCommand("copy")
  textArea.remove()

  if (!copied) {
    throw new Error("Failed to copy text to clipboard.")
  }
}

function triggerFileDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = objectUrl
  link.download = fileName
  link.rel = "noopener"

  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

function ensureFileExtension(fileName: string, extension: string): string {
  const sanitized = sanitizeFileName(fileName)
  const normalizedExtension = `.${extension.toLowerCase()}`

  if (sanitized.toLowerCase().endsWith(normalizedExtension)) {
    return sanitized
  }

  return `${sanitized}${normalizedExtension}`
}

function sanitizeFileName(fileName: string): string {
  const sanitized = Array.from(
    fileName.trim().replace(INVALID_FILE_NAME_CHARS, "_"),
    (char) => (char.charCodeAt(0) < 32 ? "_" : char)
  ).join("")

  return sanitized.length > 0 ? sanitized : "note"
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error("Unexpected download error.")
}
