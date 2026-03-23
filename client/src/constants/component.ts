import type { ComponentStrategy } from '@shared/types/componentTypes'
import type { DistributionStrategy } from '../types/component'

export const COMPONENT_RELATIONSHIP_KEY = 'instanceComponents' as const;

/**
 * PATTERN: Component strategy constants

PATTERN: Strategy constants for property c...
 */
export const COMPONENT_STRATEGIES: Record<string, ComponentStrategy> = {
  SUM: 'sum',
  MERGE: 'merge',
  FIRST: 'first',
  EVERY: 'every',
  CUSTOM: 'custom',
} as const;

/**
 * PATTERN: Distribution strategy constants

PATTERN: Strategy constants for change ...
 */
export const DISTRIBUTION_STRATEGIES: Record<string, DistributionStrategy> = {
  PROPORTIONAL: 'proportional',
  EQUAL: 'equal',
  MANUAL: 'manual',
} as const;
