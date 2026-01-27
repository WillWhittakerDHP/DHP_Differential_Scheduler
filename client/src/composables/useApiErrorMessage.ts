/**
 * useApiErrorMessage Composable
 * 
 * LEARNING: Extracts API error message parsing logic from components
 * WHY: Eliminates duplication of AxiosError handling across MetadataEditModal, useEntityCardActions, and usePrimitiveMutation
 * PATTERN: Provides reusable helper function for extracting meaningful error messages from API errors
 * 
 * ARCHITECTURAL DECISION: Centralizes error message extraction
 * - Handles AxiosError response data extraction
 * - Handles generic Error instances
 * - Provides fallback error messages
 */

/**
 * Extract meaningful error message from API error
 * 
 * LEARNING: Handles multiple error types (AxiosError, Error, unknown)
 * WHY: API errors can come in different formats - AxiosError has response.data, generic Error has message
 * PATTERN: Check error type and extract message from appropriate location
 * 
 * @param error - Error object (AxiosError, Error, or unknown)
 * @param fallbackMessage - Default message if error doesn't contain extractable message
 * @returns User-friendly error message string
 */
export function getApiErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred'): string {
  // LEARNING: Extract meaningful error message from AxiosError
  // WHY: AxiosError contains response data with server error messages
  // PATTERN: Check for AxiosError and extract response message if available
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as {
      isAxiosError: boolean
      response?: {
        data?: {
          message?: string
          error?: string
          details?: string
        }
      }
      message?: string
    }

    if (axiosError.response?.data) {
      const data = axiosError.response.data
      // LEARNING: Prefer 'details' field (contains user-friendly message like "name 'X' already exists")
      // WHY: Server returns helpful error messages in 'details' field for validation errors
      // PATTERN: Fall back to 'error' or 'message' fields if 'details' not available
      return data.details || data.error || data.message || fallbackMessage
    } else if (axiosError.message) {
      return axiosError.message
    }
  } else if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
