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

/**
 * Default component rules for common properties
 * 
 * LEARNING: Defines which component strategy to use for each property when composing entities
 * WHY: Provides sensible defaults for property component
 * PATTERN: Property-to-strategy mapping for component
 */
export const DEFAULT_COMPONENT_RULES: Record<string, ComponentStrategy> = {
  // Numeric properties - sum
  baseFee: 'sum',
  baseTime: 'sum',
  rateOverBaseFee: 'sum',
  rateOverBaseTime: 'sum',
  baseSqFt: 'sum',
  
  // Array properties - merge
  activeConstituents: 'merge',
  
  // Boolean properties - every (all must be true)
  onSite: 'every',
  clientPresent: 'every',
  moveable: 'every',
  visible: 'every',
  
  // String properties - first (use first particle's value)
  name: 'first',
  description: 'first',
  icon: 'first',
} as const;
