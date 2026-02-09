/**
 * Shared Router Validation Types
 * 
 * LEARNING: Shared validation result type for consistent validation across all routers
 * WHY: Enables type-safe validation results with clear success/failure states
 * PATTERN: Discriminated union type for validation results
 */

/**
 * Validation result type
 * LEARNING: Structured validation result for consistent error handling
 * WHY: Enables type-safe validation results with clear success/failure states
 * PATTERN: Discriminated union type for validation results
 */
export type ValidationResult = 
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }
