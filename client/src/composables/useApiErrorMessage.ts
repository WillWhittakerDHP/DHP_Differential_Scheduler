import { isAxiosLikeError, messageFromAxiosLikeError } from '@/utils/api/axiosErrorMessage'

export function getApiErrorMessage(error: unknown, fallbackMessage?: string): string {
  const resolvedFallback =
    fallbackMessage !== undefined && fallbackMessage !== null ? fallbackMessage : 'An error occurred'

  if (isAxiosLikeError(error)) {
    return messageFromAxiosLikeError(error, resolvedFallback)
  }

  if (error instanceof Error) {
    return error.message
  }

  return resolvedFallback
}
