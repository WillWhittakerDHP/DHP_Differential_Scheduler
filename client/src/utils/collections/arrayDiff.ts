/**
 * Array diff utility: compute additions and removals between two arrays.
 * WHY: Replaces repeated "toAdd = new.filter(n => !oldSet.has(n)); toRemove = old.filter(o => !newSet.has(o))" patterns.
 */

import type { ArrayDiffResult } from '@/types/collections/arrayDiff'

export type { ArrayDiffResult } from '@/types/collections/arrayDiff'

export function calculateArrayDiff<T>(
  oldValues: T[],
  newValues: T[],
  identity?: (item: T) => string
): ArrayDiffResult<T> {
  const key = identity ?? ((x: T) => String(x))
  const oldSet = new Set(oldValues.map(key))
  const newSet = new Set(newValues.map(key))
  const toAdd = newValues.filter((v) => !oldSet.has(key(v)))
  const toRemove = oldValues.filter((v) => !newSet.has(key(v)))
  return { toAdd, toRemove }
}
