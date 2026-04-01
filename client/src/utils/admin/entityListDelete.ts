/**
 * Pure delete-handler factory: confirms and calls remove with error handling.
 * WHY: Moved from composables (utils-in-disguise) — no Vue reactivity; single source for list delete logic.
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { getApiErrorMessage } from '@/composables/useApiErrorMessage'
import type { AppLogger } from '@/utils/logger'

interface EntityListDeleteOptions {
  remove: (id: GlobalEntityId) => Promise<unknown>
  confirmMessage: string
  errorMessage: string
  logger: AppLogger
  notifyError: (message: string) => void
  /**
   * When set, skips browser `confirm` and `remove` — caller opens dependency delete UI (e.g. wizard).
   */
  contractDelete?: (id: GlobalEntityId) => void | Promise<void>
}

/**
 * Returns an async delete handler that confirms, calls remove, and handles errors.
 */
export function entityListDelete(options: EntityListDeleteOptions): (id: GlobalEntityId) => Promise<void> {
  const { remove, confirmMessage, errorMessage, logger, notifyError, contractDelete } = options

  return async function handleDelete(id: GlobalEntityId): Promise<void> {
    if (contractDelete != null) {
      try {
        await contractDelete(id)
      } catch (error) {
        logger.error(errorMessage, { error })
        notifyError(getApiErrorMessage(error, errorMessage))
      }
      return
    }
    if (!confirm(confirmMessage)) return
    try {
      await remove(id)
    } catch (error) {
      logger.error(errorMessage, { error })
      notifyError(getApiErrorMessage(error, errorMessage))
    }
  }
}
