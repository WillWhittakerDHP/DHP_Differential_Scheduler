/**
 * Constraint Type Constants
 * 
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
