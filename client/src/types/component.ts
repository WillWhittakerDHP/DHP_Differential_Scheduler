import { GlobalEntityId } from './entities';

/**
 * WHY: Component Types

Type definitions for entity component system

NOTE: Renamed from ActiveComponent → InstanceComponent → InstanceComponent for domain clarity (2026-01-07)
 */
export type ComponentStrategy = 'sum' | 'merge' | 'first' | 'every' | 'custom';

/**
 * Distribution strategy for parent changes
 * 
 * LEARNING: When editing computed properties on parent, need to distribute changes
 * WHY: User needs control over how changes propagate to components
 * PATTERN: Three strategies: proportional (by current values), equal (split evenly), manual (user specifies)
 */
export type DistributionStrategy = 'proportional' | 'equal' | 'manual';

/**
 * Component configuration (matches backend config)
 */
export interface ComponentConfig {
  enabled: boolean;
  componentRules?: Record<string, ComponentStrategy>;
}

/**
 * Fetched InstanceComponent (matches API response)
 * LEARNING: API returns snake_case format
 * WHY: Backend uses snake_case, frontend uses camelCase
 * PATTERN: Transform from FetchedInstanceComponent to InstanceComponent
 */
export interface FetchedInstanceComponent {
  id: string;
  parent_id: string;
  child_id: string;
  order_index: number;
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

/**
 * Component with entity reference
 */
export interface Component {
  componentId: GlobalEntityId;
  entityId: GlobalEntityId;
  orderIndex: number;
  disabled: boolean;
}

/**
 * Distribution preview for parent changes
 */
export interface DistributionPreview {
  componentId: GlobalEntityId;
  currentValue: number;
  newValue: number;
  change: number;
}
