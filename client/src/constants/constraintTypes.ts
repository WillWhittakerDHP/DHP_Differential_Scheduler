/**
 * Constraint Type Constants
 * 
 * LEARNING: Re-exports shared constraint constants for client-side use
 * WHY: Maintains backward compatibility with existing client imports while using shared source
 * PATTERN: Re-export from shared constants
 * 
 * Phase: Constraint DRY Refactor
 * - Now imports from @shared/constants/constraintConstants
 * - Maintains same export interface for existing client code
 */

export {
  RANGE_CONSTRAINT_TYPES,
  TIME_BASIS_TYPES,
  type TimeBasisType
} from '@shared/constants/constraintConstants'
