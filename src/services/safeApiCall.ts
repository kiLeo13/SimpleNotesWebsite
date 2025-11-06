import type { ApiResponse } from '../types/api/api'

import { z } from 'zod'
import { ZodError } from 'zod'
import { handleApiError } from '../utils/errorHandlerUtils'

/**
 * A wrapper for API calls that handles success, errors, and Zod validation.
 * 
 * @param apiCall - The async function that makes the API request (e.g., () => apiClient.post(...)).
 * @param schema - The Zod schema to validate and parse the response data.
 * @returns A promise that resolves to an `ApiResponse<T>`.
 */
export async function safeApiCall<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiCall: () => Promise<any>,
  schema?: z.ZodType<T>
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall()
    const parsedData = schema ? schema.parse(response.data) : response.data
    return {
      success: true,
      data: parsedData,
    }
  } catch (error) {
    // Handle Zod validation errors separately, as they are a client-side issue
    if (error instanceof ZodError) {
      console.error('Zod validation failed:', z.treeifyError(error))
      return {
        success: false,
        errors: { root: ['Failed to understand the server response.'] },
      }
    }
    return handleApiError(error)
  }
}