import type { Ref } from 'vue'
import type { Logger } from '@/utils/logger'

export interface WithAsyncOperationState {
  busyRef: Ref<boolean>
  errorRef: Ref<string | null>
  successRef?: Ref<string | null>
}

export interface WithAsyncOperationOptions {
  successMessage?: string
  /** Override error message shown to user (default: extracted from thrown error) */
  errorMessage?: string
  errorPrefix?: string
  logger: Logger
  /** Run after catch (e.g. clear data on error) */
  onError?: (err: unknown) => void
}

/**
 * Run an async operation with unified busy/error/success handling.
 * Returns the operation result or null on error.
 */
export async function withAsyncOperation<T>(
  operation: () => Promise<T>,
  state: WithAsyncOperationState,
  options: WithAsyncOperationOptions
): Promise<T | null> {
  const { busyRef, errorRef, successRef } = state
  const { successMessage, errorMessage, errorPrefix, logger, onError } = options

  busyRef.value = true
  errorRef.value = null
  if (successRef) successRef.value = null

  try {
    const result = await operation()
    if (successRef && successMessage) successRef.value = successMessage
    return result
  } catch (err) {
    const fallbackMessage = err instanceof Error ? err.message : String(err)
    logger.error(errorPrefix ?? 'Operation failed', { error: err })
    onError?.(err)
    errorRef.value = errorMessage ?? fallbackMessage
    return null
  } finally {
    busyRef.value = false
  }
}
