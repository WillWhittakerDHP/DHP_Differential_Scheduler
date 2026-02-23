/**
 * useApiErrorMessage Composable
 * 
 * 
 * ARCHITECTURAL DECISION: Centralizes error message extraction
 * - Handles AxiosError response data extraction
 * - Handles generic Error instances
 * - Provides fallback error messages
 */

export function getApiErrorMessage(error: unknown, fallbackMessage?: string): string {
  const resolvedFallback = fallbackMessage !== undefined && fallbackMessage !== null ? fallbackMessage : 'An error occurred'
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
      // PATTERN: Fall back to 'error' or 'message' fields if 'details' not available
      return data.details || data.error || data.message || resolvedFallback
    } else if (axiosError.message) {
      return axiosError.message
    }
  } else if (error instanceof Error) {
    return error.message
  }

  return resolvedFallback
}
