/**
 * WHY: Flatten getApiErrorMessage nesting (function-complexity audit).
 */

type AxiosLikeError = {
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

function firstNonEmptyMessage(data: NonNullable<AxiosLikeError['response']>['data']): string | undefined {
  if (!data) return undefined
  return data.details || data.error || data.message
}

export function messageFromAxiosLikeError(error: AxiosLikeError, fallback: string): string {
  if (error.response?.data) {
    return firstNonEmptyMessage(error.response.data) ?? fallback
  }
  if (error.message) {
    return error.message
  }
  return fallback
}

export function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
}
