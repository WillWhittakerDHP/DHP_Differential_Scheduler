/**
 * WHY: Admin lists must match persisted `orderIndex`; raw `entities[]` from globalData is not guaranteed ordered.
 * PATTERN: Numeric compare + stable id tie-break for duplicate/missing indices.
 */
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export function sortEntitiesByOrderIndex<GE extends GlobalEntityKey>(
  entities: GlobalEntity<GE>[]
): GlobalEntity<GE>[] {
  return [...entities].sort((a, b) => {
    const ao = Number(a.orderIndex ?? 0)
    const bo = Number(b.orderIndex ?? 0)
    if (ao !== bo) return ao - bo
    return String(a.id).localeCompare(String(b.id))
  })
}
