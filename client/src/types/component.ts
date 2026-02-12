import { GlobalEntityId } from './entities';

export type ComponentStrategy = 'sum' | 'merge' | 'first' | 'every' | 'custom';

/**
 * Distribution strategy for parent changes
 * 
 * LEARNING: When editing computed properties on parent, need to distribute changes
 * WHY: User needs control over how changes propagate to components
 * PATTERN: Three strategies: proportional (by current values), equal (split evenly), manual (user specifies)
 */
export type DistributionStrategy = 'proportional' | 'equal' | 'manual';

export interface ComponentConfig {
  enabled: boolean;
  componentRules?: Record<string, ComponentStrategy>;
}

export interface FetchedInstanceComponent {
  id: string;
  parentId: string;
  childId: string;
  orderIndex: number;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * InstanceComponent (frontend format)
 * LEARNING: Frontend uses camelCase for consistency
 * WHY: JavaScript/TypeScript convention is camelCase
 * PATTERN: Transform from API format to frontend format
 */
export interface InstanceComponent {
  id: GlobalEntityId;
  parentId: GlobalEntityId;
  childId: GlobalEntityId;
  orderIndex: number;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  componentId: GlobalEntityId;
  entityId: GlobalEntityId;
  orderIndex: number;
  disabled: boolean;
}

export interface DistributionPreview {
  componentId: GlobalEntityId;
  currentValue: number;
  newValue: number;
  change: number;
}
