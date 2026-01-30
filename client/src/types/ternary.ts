/**
 * Ternary Boolean Type and Utilities
 * 
 * LEARNING: Three-valued logic type for properties that need override behavior
 * WHY: Enables "minimize-time-on-site" feature where parts can be excluded from 
 *      onSite calculation while preserving duration
 * PATTERN: Standard three-valued logic operations (aggregation, coercion, comparison)
 */

/**
 * Ternary Boolean Type
 * LEARNING: Three possible states: 'true', 'false', 'override'
 * WHY: Allows parts to be marked as override, which contributes to totalDuration 
 *      but NOT to specific calculations like onSite/clientPresent
 */
export type TernaryBoolean = 'true' | 'false' | 'override'
