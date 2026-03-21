/**
 * Shared Constraint Utilities
 * 
 * WHY: Eliminates duplication across client and server constraint handling
 * PATTERN: Pure utility functions for constraint manipulation
 */

import type {
  Constraint,
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
} from '@shared/types/availabilityTypes'

/**
 * Filter active constraints
 * WHY: Eliminates duplicate filter operations across codebase
 * PATTERN: Single function that handles all constraint filtering rules
 * 
 * @param constraints - Array of constraints to filter
 * @returns Array of active constraints (enforcement !== 'off' and placement !== 'off' for overlap)
 */
export function filterActiveConstraints(constraints: Constraint[]): Constraint[] {
  return constraints.filter(constraint => {
    if (constraint.enforcement === 'off') return false
    if (constraint.category === 'overlap' && constraint.placement === 'off') return false
    return true
  })
}

/**
 * Group constraints by category
 * WHY: Enables category-specific processing while maintaining type safety
 * PATTERN: Switch statement on category field for discriminated union narrowing
 * 
 * @param constraints - Array of constraints to group
 * @returns Object with separate arrays for each constraint category
 */
export function groupConstraintsByCategory(constraints: Constraint[]): {
  range: RangeConstraint[]
  overlap: OverlapConstraint[]
  capacity: CapacityConstraint[]
} {
  const range: RangeConstraint[] = []
  const overlap: OverlapConstraint[] = []
  const capacity: CapacityConstraint[] = []

  for (const constraint of constraints) {
    switch (constraint.category) {
      case 'range':
        range.push(constraint)
        break
      case 'overlap':
        overlap.push(constraint)
        break
      case 'capacity':
        capacity.push(constraint)
        break
    }
  }
  
  return { range, overlap, capacity }
}

/**
 * Merge violations with existing flexible violations
 * WHY: Single source of truth for violation handling
 * PATTERN: Pure function that merges and formats violations
 * 
 * @param existing - Existing violations array (may be undefined)
 * @param newViolations - New violations to merge
 * @returns Object with hasFlexibleViolations flag and merged violations array
 */
export function mergeViolations(
  existing: string[] | undefined,
  newViolations: string[]
): { hasFlexibleViolations: boolean; flexibleViolations: string[] | undefined } {
  // PATTERN: Always merge violations for debugging overlay, regardless of pass/fail
  // WHY: Even hard failures should record their violation type for visibility
  const allViolations = [...(existing || []), ...newViolations]
  return {
    hasFlexibleViolations: allViolations.length > 0,
    flexibleViolations: allViolations.length > 0 ? allViolations : undefined
  }
}

/**
 * Violation keys that a single constraint can produce (for relaxation matching).
 * WHY: Matches keys from slot constraint checkers (range.leadTime, capacity.daily, etc.)
 * PATTERN: One key per constraint type; overlap uses prefix match in caller.
 */
function getViolationKeysForConstraint(constraint: Constraint): string[] {
  switch (constraint.category) {
    case 'range':
      return [`range.${constraint.type}`]
    case 'capacity':
      return [
        `capacity.${constraint.type}`,
        ...(constraint.maxIncome != null ? [`capacity.income.${constraint.type}`] : []),
      ]
    case 'overlap':
      return [] // Overlap keys are per-event; relax all overlap if any overlap.* in allowedExceptions
    default:
      return []
  }
}

/**
 * Returns a copy of constraints with any constraint whose violation key is in
 * allowedExceptions set to enforcement: 'off'. Used for override-aware reschedule.
 *
 * WHY: Server verifies allowedExceptions against stored override; only then relaxes.
 * PATTERN: Pure function, no mutation; same key shape as slot constraint checkers.
 *
 * @param constraints - Full constraint array (range, overlap, capacity)
 * @param allowedExceptions - Violation keys the override authorizes (e.g. from constraint_override.overridden_violations)
 * @returns New array of constraints with matching ones relaxed
 */
export function relaxConstraintsForExceptions(
  constraints: Constraint[],
  allowedExceptions: string[]
): Constraint[] {
  if (allowedExceptions.length === 0) return constraints
  const allowedSet = new Set(allowedExceptions)
  const hasOverlapException = allowedExceptions.some((k) => k.startsWith('overlap.'))

  return constraints.map((constraint) => {
    if (constraint.category === 'overlap') {
      if (!hasOverlapException) return constraint
      return { ...constraint, enforcement: 'off' as const }
    }
    const keys = getViolationKeysForConstraint(constraint)
    const shouldRelax = keys.some((k) => allowedSet.has(k))
    if (!shouldRelax) return constraint
    return { ...constraint, enforcement: 'off' as const }
  })
}
