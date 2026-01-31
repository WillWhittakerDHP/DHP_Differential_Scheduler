import type { ComponentStrategy, DistributionStrategy } from '../types/component';

/**
 * WHY: Component Constants

Centralized constants for entity component system
 */
export const COMPONENT_RELATIONSHIP_KEY = 'instanceComponents' as const;

/**
 * Component strategy constants
 * 
 * LEARNING: Component strategies define how properties are mathematically combined
 * WHY: Different properties need different combination methods (sum for numbers, merge for arrays, etc.)
 * PATTERN: Strategy constants for property component
 */
export const COMPONENT_STRATEGIES: Record<string, ComponentStrategy> = {
  SUM: 'sum',
  MERGE: 'merge',
  FIRST: 'first',
  EVERY: 'every',
  CUSTOM: 'custom',
} as const;

/**
 * Distribution strategy constants
 * 
 * LEARNING: Distribution strategies define how changes to parents are distributed to components
 * WHY: Users need control over how parent changes propagate to components
 * PATTERN: Strategy constants for change distribution
 */
export const DISTRIBUTION_STRATEGIES: Record<string, DistributionStrategy> = {
  PROPORTIONAL: 'proportional',
  EQUAL: 'equal',
  MANUAL: 'manual',
} as const;
