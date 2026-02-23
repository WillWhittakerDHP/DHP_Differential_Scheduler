import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { CreateRelationshipPayloadBase } from './relationships'
import type { ComponentConfig as SharedComponentConfig, ComponentStrategy as SharedComponentStrategy } from '@shared/types/componentTypes'

export type ComponentStrategy = SharedComponentStrategy
export type ComponentConfig = SharedComponentConfig

/**
 * Distribution strategy for parent changes
 *
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
 * PATTERN: InstanceComponent (frontend format)
PATTERN: Transform from API format t...
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
