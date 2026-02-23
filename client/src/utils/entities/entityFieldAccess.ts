import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Entity field access helpers
 *
 *           unless that key is guaranteed to exist on *every* member of the union.
 *      and need to access fields selected by config (like `titleField`, `groupByKey`, etc.).
 *          instead of scattering `as Record<string, unknown>` across the codebase.
 *
 * IMPORTANT:
 * - This is intentionally narrow: it returns `unknown`.
 * - Call sites must decide how to interpret/validate the returned value.
 */

export function getEntityFieldValue(
  entity: GlobalEntity<GlobalEntityKey>,
  fieldKey: string
): unknown {
  if (!Object.prototype.hasOwnProperty.call(entity, fieldKey)) return undefined
  return (entity as Record<string, unknown>)[fieldKey]
}


