import type { ApiResponse } from "../types/api/api"
import {
  FullNoteResponseSchema,
  ListNoteResponseSchema,

  NoteResponseSchema,

  type FullNoteResponseData,
  type ListNoteResponseData,
  type NoteRequestPayload,
  type NoteResponseData,
  type UpdateNoteRequestPayload
} from "../types/api/notes"

import apiClient from "./apiClient"

import { VoidSchema } from "../types/api/api"
import { safeApiCall } from "./safeApiCall"

export const NOTE_EXTENSIONS = ["txt", "md", "pdf", "png", "jpg", "jpeg", "jfif", "webp", "gif", "mp4", "mp3"]

// Its actually 30 MiB, just leaving some margin for the JSON payload,
// headers, encoding overhead and... we are also not risking it anyways XD
export const NOTE_MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MiB

/**
 * This service function does not perform any validation on the file's
 * extension, size, or other properties.
 * It is the responsibility of higher-level layers to handle these checks,
 * or to rely on API-level validation.
 */
export const noteService = {

  /**
   * Uploads a note to be created using a `multipart/form-data` request.
   * The `file` extension must be one of the {@link NOTE_EXTENSIONS}.
   * 
   * @param payload The JSON payload containing note metadata.
   * @param file The note file to be uploaded.
   * @returns A full note response body on success.
   */
  createNote: async (payload: NoteRequestPayload, file: File): Promise<ApiResponse<FullNoteResponseData>> => {
    const form = new FormData()
    form.append('json_payload', JSON.stringify(payload))
    form.append('content', file, file.name)

    return safeApiCall(() => apiClient.postForm('/notes', form))
  },

  updateNote: async (id: number, payload: UpdateNoteRequestPayload): Promise<ApiResponse<NoteResponseData>> => {
    return safeApiCall(
      () => apiClient.patch(`/notes/${id}`, payload),
      NoteResponseSchema
    )
  },

  fetchNote: async (id: number): Promise<ApiResponse<FullNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.get(`/notes/${id}`),
      FullNoteResponseSchema
    )
  },

  listNotes: async (): Promise<ApiResponse<ListNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.get('/notes'),
      ListNoteResponseSchema
    )
  },

  deleteNote: async (id: number): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.delete(`/notes/${id}`),
      VoidSchema
    )
  }
}