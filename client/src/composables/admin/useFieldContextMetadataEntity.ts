/**
 * useFieldContextMetadataEntity Composable
 * 
 * 
 * ARCHITECTURAL DECISION: Centralizes entity construction for metadata lookup
 * - Handles temporary entity construction from form values
 * - Handles existing entity lookup from admin store
 * - Returns null-safe entity reference for useEntityMetadata
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdmin } from '@/composables/admin/useAdmin'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFieldContextMetadataEntity')

export function useFieldContextMetadataEntity<
  GlobalEntityTypeKey extends GlobalEntityKey,
  GlobalFieldTypeKey extends GlobalFieldKey<GlobalEntityTypeKey>
>(
  fieldContext: FieldContextTypeGrouped<GlobalEntityTypeKey, GlobalFieldTypeKey>
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  const admin = useAdmin()

  return computed(() => {
    if (!fieldContext.state.entityKey || !fieldContext.state.entityId) {
      return null
    }

    const entityIdStr = String(fieldContext.state.entityId)
    const isTemporaryEntity = entityIdStr.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)

    // PATTERN: Build minimal entity object with id, entityKey, and shape references needed for metadata
    if (isTemporaryEntity) {
      const rawValues = fieldContext.state.formInstance?.values
      const formValues = rawValues !== undefined && rawValues !== null ? rawValues : {}

      // PATTERN: Include id, entityKey, and shape references from form values
      const entity: Record<string, unknown> = {
        id: fieldContext.state.entityId,
        entityKey: fieldContext.state.entityKey,
      }

      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.state.entityKey === 'blockInstance' && formValues.blockShapeRef) {
        entity.blockShapeRef = formValues.blockShapeRef
      }

      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.state.entityKey === 'partInstance' && formValues.partShapeRef) {
        entity.partShapeRef = formValues.partShapeRef
      }

      // PATTERN: Assert as GlobalEntity type - useEntityMetadata accepts partial entities
      return entity as GlobalEntity<GlobalEntityTypeKey>
    }

    // PATTERN: Try store lookup, return null if not found
    try {
      const entity = admin.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
      return entity ?? null
    } catch (err) {
      logger.warn('getEntity failed for metadata', { entityKey: fieldContext.state.entityKey, entityId: fieldContext.state.entityId, error: err })
      return null
    }
  })
}
