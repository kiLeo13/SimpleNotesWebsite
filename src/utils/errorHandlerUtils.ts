import type { ApiErrorResponse } from '../types/api'

import { isAxiosError } from 'axios'

/**
 * Transforms an error from an API call into a standardized ApiErrorResponse format.
 * 
 * @param error - The error caught from a try/catch block.
 * @returns An `ApiErrorResponse` object.
 */
export function handleApiError(error: unknown): ApiErrorResponse {
  if (isAxiosError(error) && error.response) {
    const errorData = error.response.data

    // Case 1: The API returned structured validation errors
    // Example: { "errors": { "email": ["This field is required."] } }
    if (errorData?.errors) {
      return {
        success: false,
        errors: errorData.errors
      }
    }

    // Case 2: The API returned a simple message
    // Example: { "message": "Invalid credentials" }
    // We must normalize this into the format our forms (React Hook Form) expect
    if (errorData?.message) {
      return {
        success: false,
        errors: { root: [errorData.message] }
      }
    }
  }

  console.error('An unexpected error occurred:', error)
  return {
    success: false,
    errors: { root: ['An unknown error occurred. Please try again.'] },
  }
}