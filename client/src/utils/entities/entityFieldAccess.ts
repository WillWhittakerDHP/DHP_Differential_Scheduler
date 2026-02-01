import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Entity field access helpers
 *
 * LEARNING: TypeScript cannot safely index a union type (A | B | C) with a "dynamic key"
 *           unless that key is guaranteed to exist on *every* member of the union.
 * WHY: Many admin/booking utilities work with `GlobalEntity<GlobalEntityKey>` (a union),
 *      and need to access fields selected by config (like `titleField`, `groupByKey`, etc.).
 * PATTERN: Centralize the *one* unavoidable "dynamic index" cast behind a tiny helper,
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
  return entity[fieldKey as keyof typeof entity]
}


