/**
 * useMetadataEditorEntity Composable
 * 
 * LEARNING: Extracts entity construction logic for metadata editor (always global config)
 * WHY: Centralizes sentinel UUID handling and blockShapeRef inclusion for metadata editor
 * PATTERN: Always uses sentinel UUIDs for global configs
 * 
 * ARCHITECTURAL DECISION: Separates metadata editor entity logic from component
 * - Handles sentinel UUID construction for global configs
 * - Handles blockShapeRef inclusion for BlockShape-specific instance metadata
 * - Returns computed entity reference for useEntityMetadata
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  BLOCK_SHAPE_GLOBAL_CONFIG_ID,
  PART_SHAPE_GLOBAL_CONFIG_ID,
  BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
  PART_INSTANCE_GLOBAL_CONFIG_ID,
  EVENT_SHAPE_GLOBAL_CONFIG_ID,
  EVENT_INSTANCE_GLOBAL_CONFIG_ID,
  ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
  ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
} from '@/utils/entities/entityTypeMapping'

/**
 * Get entity for metadata editor (always uses global config sentinel UUIDs)
 * 
 * LEARNING: Always uses sentinel UUIDs for global configs
 * WHY: Metadata editor always edits global configs, not instance-specific configs
 * PATTERN: Determine sentinel UUID based on entityKey
 * 
 * @param entityKey - Entity type key
 * @param entity - Entity object (used to extract blockShapeRef if needed)
 * @param blockShapeRef - Optional BlockShape ID for BlockShape-specific instance metadata
 * @returns Computed ref to entity for metadata lookup
 */
export function useMetadataEditorEntity<
  GlobalEntityTypeKey extends GlobalEntityKey
>(
  entityKey: GlobalEntityTypeKey,
  entity: GlobalEntity<GlobalEntityTypeKey> | null | undefined,
  blockShapeRef?: string | null
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  return computed(() => {
    // LEARNING: Always use sentinel UUID for global config
    // WHY: Metadata editor always edits global configs
    // PATTERN: Determine sentinel UUID based on entityKey
    let entityId: string | null = null

    if (entityKey === 'blockShape') {
      entityId = BLOCK_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'partShape') {
      entityId = PART_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'blockInstance') {
      entityId = BLOCK_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'partInstance') {
      entityId = PART_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'eventShape') {
      entityId = EVENT_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'eventInstance') {
      entityId = EVENT_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'annotationShape') {
      entityId = ANNOTATION_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'annotationInstance') {
      entityId = ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
    }

    if (!entityId) {
      return null
    }

    // LEARNING: Create entity for metadata lookup with sentinel UUID
    // WHY: useEntityMetadata needs entity with id and shape references
    // PATTERN: Build minimal entity object with id, entityKey, and optional blockShapeRef
    const baseEntity = {
      id: entityId,
      entityKey,
      name: '',
    } as GlobalEntity<GlobalEntityTypeKey>

    // For blockInstance with blockShapeRef, include it in the entity
    if (entityKey === 'blockInstance' && blockShapeRef) {
      (baseEntity as GlobalEntity<'blockInstance'>).blockShapeRef = blockShapeRef
    }

    return baseEntity
  })
}
