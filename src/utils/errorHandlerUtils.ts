import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiErrorResponse } from '../types/api/api'

import { isAxiosError } from 'axios'

/**
 * Transforms an API error into a standardized `ApiErrorResponse` format.
 *
 * This helper ensures that all API errors follow a consistent shape for UI components
 * (especially React Hook Form) to easily consume.
 *
 * ---
 * ### Behavior
 * - **Structured field errors:**  
 *   When the API returns validation errors for specific fields, they are preserved
 *   as a `Record<string, string[]>` under the `errors` property.
 *
 *   **Example input:**
 *   ```json
 *   {
 *     "errors": {
 *       "email": ["This field is required"],
 *       "password": [
 *         "Value must be at least 8 characters long",
 *         "Value must contain at least one number"
 *       ]
 *     }
 *   }
 *   ```
 *   **Returned:**
 *   ```ts
 *   {
 *     success: false,
 *     errors: {
 *       email: ["This field is required"],
 *       password: [
 *         "Value must be at least 8 characters long",
 *         "Value must contain at least one number"
 *       ]
 *     }
 *   }
 *   ```
 *
 * - **General error messages:**  
 *   When the API returns only a message (no field-specific errors), it is normalized
 *   into a `root` field so that it can be used as a drop-in value for form-level errors.
 *
 *   **Example input:**
 *   ```json
 *   {"message": "Resource not found"}
 *   ```
 *   **Returned:**
 *   ```ts
 *   {
 *     success: false,
 *     errors: {
 *       root: ["Resource not found"]
 *     }
 *   }
 *   ```
 *
 * - **Unexpected or unknown errors:**  
 *   If the error doesn’t match either of the above formats, a fallback message is returned:
 *   ```ts
 *   {
 *     success: false,
 *     errors: { root: ["An unknown error occurred. Please try again."] }
 *   }
 *   ```
 *
 * ---
 * @param error - The error caught from a try/catch block, possibly from an Axios request.
 * @returns A normalized `ApiErrorResponse` object suitable for form error handling.
 */
export function handleApiError(error: unknown): ApiErrorResponse {
  if (isAxiosError(error) && error.response) {
    const errorData = error.response.data
    const status = error.status || -1

    // Case 1: The API returned structured validation errors
    // Example: { "errors": { "email": ["This field is required."] } }
    if (errorData?.errors) {
      return {
        success: false,
        statusCode: status,
        errors: errorData.errors
      }
    }

    // Case 2: The API returned a simple message
    // Example: { "message": "Invalid credentials" }
    // We must normalize this into the format our forms (React Hook Form) expect
    if (errorData?.message) {
      return {
        success: false,
        statusCode: status,
        errors: { root: [errorData.message] }
      }
    }
  }

  console.error('An unexpected error occurred:', error)
  return {
    success: false,
    statusCode: -1,
    errors: { root: ['An unknown error occurred. Please try again.'] },
  }
}

/**
 * Displays server-side validation errors in a React Hook Form.
 *
 * This helper takes a normalized error object (where each field maps to an array of messages)
 * and calls `setError` for each entry, including the optional `root` form-level error.
 *
 * @example
 * ```ts
 * if (!response.success) {
 *   displayFormErrors(response.errors, setError)
 *   return
 * }
 * ```
 *
 * @param errors A record where keys are field names (or "root") and values are message arrays.
 * @param setError The `setError` function from React Hook Form.
 */
export function displayFormsErrors<T extends FieldValues>(
  errors: Record<string, string[]>,
  setError: UseFormSetError<T>
): void {
  for (const [field, messages] of Object.entries(errors)) {
    const fieldName = field === "root" ? "root" : (field as Path<T>)
    setError(fieldName, {
      type: "server",
      message: messages.join(", ")
    })
  }
}