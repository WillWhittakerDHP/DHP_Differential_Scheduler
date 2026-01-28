/**
 * useMetadataEditorEntity Composable
 * 
 * LEARNING: Extracts entity construction logic for metadata editor (global vs instance mode)
 * WHY: Centralizes sentinel UUID handling and blockShapeRef inclusion for metadata editor
 * PATTERN: Handles both global mode (sentinel UUIDs) and instance override mode (actual entity)
 * 
 * ARCHITECTURAL DECISION: Separates metadata editor entity logic from component
 * - Handles sentinel UUID construction for global mode
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
} from '@/utils/entities/entityTypeMapping'
import { getMetadataEntityId } from '@/utils/entities/entityTypeMapping'

/**
 * Get entity for metadata editor based on mode (global vs instanceOverride)
 * 
 * LEARNING: Handles sentinel UUIDs for global mode and actual entities for instance mode
 * WHY: Global mode should show/edit global config, not instance-specific config
 * PATTERN: Override entityId to use sentinel UUID when mode is 'global'
 * 
 * @param entityKey - Entity type key
 * @param entity - Actual entity object (used in instanceOverride mode)
 * @param mode - Editor mode ('global' or 'instanceOverride')
 * @param blockShapeRef - Optional BlockShape ID for BlockShape-specific instance metadata
 * @returns Computed ref to entity for metadata lookup
 */
export function useMetadataEditorEntity<
  GlobalEntityTypeKey extends GlobalEntityKey
>(
  entityKey: GlobalEntityTypeKey,
  entity: GlobalEntity<GlobalEntityTypeKey> | null | undefined,
  mode: 'global' | 'instanceOverride',
  blockShapeRef?: string | null
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  return computed(() => {
    // LEARNING: Compute entityId based on mode
    // WHY: Global mode uses sentinel UUIDs, instance mode uses actual entity ID
    // PATTERN: Check mode first, then determine entityId
    let entityId: string | null = null

    if (mode === 'global') {
      // When mode is 'global', always use sentinel UUID
      if (entityKey === 'blockShape') {
        entityId = BLOCK_SHAPE_GLOBAL_CONFIG_ID
      } else if (entityKey === 'partShape') {
        entityId = PART_SHAPE_GLOBAL_CONFIG_ID
      } else if (entityKey === 'blockInstance') {
        entityId = BLOCK_INSTANCE_GLOBAL_CONFIG_ID
      } else if (entityKey === 'partInstance') {
        entityId = PART_INSTANCE_GLOBAL_CONFIG_ID
      }
    } else {
      // For instanceOverride mode, use the actual entity ID
      if (entity) {
        entityId = getMetadataEntityId(entityKey, entity)
      }
    }

    if (!entityId) {
      return null
    }

    // LEARNING: Create entity for metadata lookup that uses sentinel UUID in global mode
    // WHY: useEntityMetadata needs entity with id and shape references
    // PATTERN: Build minimal entity object with id, entityKey, and optional blockShapeRef
    if (mode === 'global' && entityId) {
      // LEARNING: Include blockShapeRef in entity for BlockShape-specific instance metadata
      // WHY: getMetadata() extracts blockShapeRef from entity to look up BlockShape-specific metadata
      // PATTERN: Include blockShapeRef when provided, even in global mode
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
    }

    // For instanceOverride mode, return the actual entity
    return entity ?? null
  })
}
