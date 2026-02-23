/**
 * Ternary Boolean Utilities
 * 
 * 
 * These utilities work for both partInstance and blockInstance ternary properties
 * without hardcoding property names.
 */

import type { TernaryBoolean } from '@/types/ternary'

/**
 * Aggregate multiple ternary values
 * 
 * Logic:
 * - If ANY value is 'override', return 'override'
 * - Otherwise, if ANY value is 'true', return 'true'
 * - Otherwise, return 'false'
 * 
 * @param values - Array of ternary boolean values to aggregate
 * @returns Aggregated ternary boolean value
 */
export function aggregate(values: TernaryBoolean[]): TernaryBoolean {
  if (values.length === 0) {
    return 'false'
  }
  
  if (values.some(v => v === 'override')) {
    return 'override'
  }
  
  if (values.some(v => v === 'true')) {
    return 'true'
  }
  
  return 'false'
}

/**
 * Coerce ternary value to boolean for calculations
 * 
 * @param value - Ternary boolean value to coerce
 * @param mode - Coercion mode
 *   - 'strict': only 'true' → true (for onSite, clientPresent, moveable calculations)
 *   - 'inclusive': 'true' or 'override' → true (for totalDuration or future use cases)
 * @returns Boolean value for calculation purposes
 */
export function toBoolean(value: TernaryBoolean, mode?: 'strict' | 'inclusive'): boolean {
  const resolvedMode = mode !== undefined ? mode : 'strict'
  if (resolvedMode === 'strict') {
    return value === 'true'
  }
  
  return value === 'true' || value === 'override'
}

/**
 * WHY: Compare ternary value to specific state
LEARNING: Checks if value equals...
 */
export function equals(value: TernaryBoolean, state: TernaryBoolean): boolean {
  return value === state
}
