/**
 * Normalize single-or-array values to a consistent shape.
 * WHY: Replaces repeated "Array.isArray(x) ? x : [x]" and "Array.isArray(x) ? x[0] : x" patterns.
 */

/**
 * Ensure a value is always an array (single element wrapped if not).
 */
export function normalizeToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * Ensure a value is a single element (first element if array).
 */
export function normalizeToSingle<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value
}
