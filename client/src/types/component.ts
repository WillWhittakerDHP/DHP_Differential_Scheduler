import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { CreateRelationshipPayloadBase } from './relationships'
import type { ComponentConfig as SharedComponentConfig, ComponentStrategy as SharedComponentStrategy } from '@shared/types/componentTypes'

export type ComponentStrategy = SharedComponentStrategy
export type ComponentConfig = SharedComponentConfig

/**
 * Distribution strategy for parent changes
 *
 * LEARNING: When editing computed properties on parent, need to distribute changes
 * WHY: User needs control over how changes propagate to components
 * PATTERN: Three strategies: proportional (by current values), equal (split evenly), manual (user specifies)
 */
export type DistributionStrategy = 'proportional' | 'equal' | 'manual'

export interface FetchedInstanceComponent {
  id: string
  parentId: string
  childId: string
  orderIndex: number
  disabled: boolean
  createdAt: string
  updatedAt: string
}

/**
 * InstanceComponent (frontend format)
 * LEARNING: Frontend uses camelCase for consistency
 * WHY: JavaScript/TypeScript convention is camelCase
 * PATTERN: Transform from API format to frontend format
 * P2 type-similarity: extends CreateRelationshipPayloadBase (parentId, childId).
 */
export interface InstanceComponent extends CreateRelationshipPayloadBase {
  id: GlobalEntityId
  orderIndex: number
  disabled: boolean
  createdAt: Date
  updatedAt: Date
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
