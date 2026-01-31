/**
 * Ternary Boolean Utilities
 * 
 * LEARNING: Pure utility functions for three-valued logic operations
 * WHY: Provides context-agnostic operations for ternary boolean values
 * PATTERN: Standard three-valued logic operations (aggregation, coercion, comparison)
 * 
 * These utilities work for both partInstance and blockInstance ternary properties
 * without hardcoding property names.
 */

import type { TernaryBoolean } from '@/types/ternary'

/**
 * Aggregate multiple ternary values
 * LEARNING: Combines multiple ternary values using OR logic with override precedence
 * WHY: When aggregating partInstances by partShape, if ANY has 'override', result is 'override'
 * PATTERN: Override takes precedence, then OR logic for 'true' values
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
  
  // If ANY value is 'override', return 'override'
  if (values.some(v => v === 'override')) {
    return 'override'
  }
  
  // Otherwise, if ANY value is 'true', return 'true'
  if (values.some(v => v === 'true')) {
    return 'true'
  }
  
  // Otherwise, all are 'false'
  return 'false'
}

/**
 * Coerce ternary value to boolean for calculations
 * LEARNING: Converts ternary value to boolean based on mode
 * WHY: Different calculations need different coercion rules
 * PATTERN: 'strict' mode excludes override, 'inclusive' mode includes override
 * 
 * @param value - Ternary boolean value to coerce
 * @param mode - Coercion mode
 *   - 'strict': only 'true' → true (for onSite, clientPresent, moveable calculations)
 *   - 'inclusive': 'true' or 'override' → true (for totalDuration or future use cases)
 * @returns Boolean value for calculation purposes
 */
export function toBoolean(value: TernaryBoolean, mode: 'strict' | 'inclusive' = 'strict'): boolean {
  if (mode === 'strict') {
    return value === 'true'
  }
  
  // 'inclusive' mode
  return value === 'true' || value === 'override'
}

/**
 * Compare ternary value to specific state
 * LEARNING: Checks if value equals a specific ternary state
 * WHY: Used for differential checks and other state comparisons
 * PATTERN: Direct equality check
 * 
 * @param value - Ternary boolean value to check
 * @param state - State to compare against
 * @returns True if value equals state
 */
export function equals(value: TernaryBoolean, state: TernaryBoolean): boolean {
  return value === state
}
