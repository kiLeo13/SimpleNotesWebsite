import type { ApiResponse } from "../types/api/api"
import {
  FullNoteResponseSchema,
  ListNoteResponseSchema,
  type CreateFileNotePayload,
  type CreateTextNotePayload,
  type FullNoteResponseData,
  type ListNoteResponseData,
  type UpdateNoteRequestPayload
} from "../types/api/notes"

import apiClient from "./apiClient"
import { VoidSchema } from "../types/api/api"
import { safeApiCall } from "./safeApiCall"

export const NOTE_EXTENSIONS = ["txt", "md", "pdf", "png", "jpg", "jpeg", "jfif", "webp", "gif", "mp4", "mp3"]
export const NOTE_MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MiB

export const noteService = {

  /**
   * Uploads a file-based note (e.g., PDF, Image) using a `multipart/form-data` request.
   * * @param payload - Metadata only (name, tags, visibility).
   * @param file - The binary file to be uploaded.
   * @returns A promise resolving to the full note response.
   */
  createFileNote: async (payload: CreateFileNotePayload, file: File): Promise<ApiResponse<FullNoteResponseData>> => {
    const form = new FormData()
    form.append('json_payload', JSON.stringify(payload))
    form.append('content', file, file.name)

    return safeApiCall(() => apiClient.postForm('/notes', form))
  },

  /**
   * Creates a text-based note (e.g., Markdown, Mermaid) using a standard JSON request.
   * * @param payload - Includes metadata, content string, and specific note_type.
   * @returns A promise resolving to the full note response.
   */
  createTextNote: async (payload: CreateTextNotePayload): Promise<ApiResponse<FullNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/notes', payload),
      FullNoteResponseSchema
    )
  },

  /**
   * Updates the metadata of an existing note.
   * * @param id - The ID of the note to update.
   * @param payload - The fields to update (name, tags, visibility).
   * @returns A promise resolving to the updated note data.
   */
  updateNote: async (id: number, payload: UpdateNoteRequestPayload): Promise<ApiResponse<FullNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.patch(`/notes/${id}`, payload),
      FullNoteResponseSchema
    )
  },

  /**
   * Retrieves the complete details of a specific note by its ID.
   * * @param id - The ID of the note to fetch.
   * @returns A promise resolving to the full note data.
   */
  fetchNote: async (id: number): Promise<ApiResponse<FullNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.get(`/notes/${id}`),
      FullNoteResponseSchema
    )
  },

  /**
   * Retrieves a list of all notes available to the current user.
   * * @returns A promise resolving to a list of notes.
   */
  listNotes: async (): Promise<ApiResponse<ListNoteResponseData>> => {
    return safeApiCall(
      () => apiClient.get('/notes'),
      ListNoteResponseSchema
    )
  },

  /**
   * Permanently deletes a note by its ID.
   * * @param id - The ID of the note to delete.
   * @returns A promise resolving to void on success.
   */
  deleteNote: async (id: number): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.delete(`/notes/${id}`),
      VoidSchema
    )
  }
}