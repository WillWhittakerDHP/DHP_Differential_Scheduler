/**
 * Shared factory for nested writable computeds bound to formData
 * WHY: Used by useCapacitySettings and useBufferSettings to avoid duplication
 * PATTERN: Generic get/set computed with ensure-parent pattern; no direct mutation in callers
 */
import { computed, type WritableComputedRef } from 'vue'

export interface CreateNestedComputedOptions<TValue, TParent> {
  getValue: () => TValue | undefined
  getDefault: () => TValue
  getCurrentParent: () => TParent | undefined
  ensureParent: (current: TParent | undefined) => TParent
  updateWithValue: (ensuredParent: TParent, value: TValue) => TParent
  setParent: (parent: TParent) => void
}

/**
 * Creates a writable computed that reads from optional nested state and writes via ensure/update/set.
 * Caller must pass options that close over formData (or pass formData in getCurrentParent/setParent).
 */
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

/**
 * Returns a function that ensures a nested key exists on parent, creating it with createDefault() if missing.
 */
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
