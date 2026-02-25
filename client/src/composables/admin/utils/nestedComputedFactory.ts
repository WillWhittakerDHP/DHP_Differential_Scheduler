/**
PATTERN: ...
 */
import { computed, type WritableComputedRef } from 'vue'
import type { CreateNestedComputedOptions } from '@/types/admin/nestedComputedFactory'

export type { CreateNestedComputedOptions } from '@/types/admin/nestedComputedFactory'

export function createNestedComputed<TValue, TParent>(
  options: CreateNestedComputedOptions<TValue, TParent>
): WritableComputedRef<TValue> {
  return computed({
    get: () => {
      const value = options.getValue()
      return value !== undefined ? value : options.getDefault()
    },
    set: (value: TValue) => {
      const currentParent = options.getCurrentParent()
      const ensuredParent = options.ensureParent(currentParent)
      const updatedParent = options.updateWithValue(ensuredParent, value)
      options.setParent(updatedParent)
    }
  })
}

export function createEnsureNested<TParent extends Record<string, unknown>>(
  ensureParent: (current: TParent | undefined) => TParent,
  key: string,
  createDefault: () => unknown,
  ensureAdditional?: (current: TParent) => TParent
): (current: TParent | undefined) => TParent {
  return (current: TParent | undefined): TParent => {
    const parent = ensureParent(current)
    if (!parent[key]) {
      const updated = {
        ...parent,
        [key]: createDefault()
      } as TParent
      return ensureAdditional ? ensureAdditional(updated) : updated
    }
    return ensureAdditional ? ensureAdditional(parent) : parent
  }
}
