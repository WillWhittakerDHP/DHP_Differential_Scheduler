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
