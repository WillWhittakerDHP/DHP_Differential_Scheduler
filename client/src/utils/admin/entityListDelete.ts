/**
 * Pure delete-handler factory: confirms and calls remove with error handling.
 * WHY: Moved from composables (utils-in-disguise) — no Vue reactivity; single source for list delete logic.
 */
import type { GlobalEntityId } from '@/types/entities'
import type { AppLogger } from '@/utils/logger'

export interface EntityListDeleteOptions {
  remove: (id: GlobalEntityId) => Promise<unknown>
  confirmMessage: string
  errorMessage: string
  logger: AppLogger
  notifyError: (message: string) => void
}

/**
 * Returns an async delete handler that confirms, calls remove, and handles errors.
 */
export function entityListDelete(options: EntityListDeleteOptions): (id: GlobalEntityId) => Promise<void> {
  const { remove, confirmMessage, errorMessage, logger, notifyError } = options

  return async function handleDelete(id: GlobalEntityId): Promise<void> {
    if (!confirm(confirmMessage)) return
    try {
      await remove(id)
    } catch (error) {
      logger.error(errorMessage, { error })
      notifyError(errorMessage)
    }
  }
}
