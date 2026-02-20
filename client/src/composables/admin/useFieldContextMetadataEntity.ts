/**
 * useFieldContextMetadataEntity Composable
 * 
 * LEARNING: Extracts entity lookup logic for metadata fetching from field context
 * WHY: Eliminates duplication of entity lookup logic across BooleanInput, PrimitiveInputs, and FieldRenderer
 * PATTERN: Handles both temporary entities (new-* IDs) and existing entities from admin store
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
import type { FieldContextType } from '@/composables/fieldContext/types'
import { useAdmin } from '@/composables/useAdmin'

export function useFieldContextMetadataEntity<
  GlobalEntityTypeKey extends GlobalEntityKey,
  GlobalFieldTypeKey extends GlobalFieldKey<GlobalEntityTypeKey>
>(
  fieldContext: FieldContextType<GlobalEntityTypeKey, GlobalFieldTypeKey>
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  const admin = useAdmin()

  return computed(() => {
    if (!fieldContext.entityKey || !fieldContext.entityId) {
      return null
    }

    const entityIdStr = String(fieldContext.entityId)
    const isTemporaryEntity = entityIdStr.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)

    // PATTERN: Build minimal entity object with id, entityKey, and shape references needed for metadata
    if (isTemporaryEntity) {
      const rawValues = fieldContext.formInstance?.values
      const formValues = rawValues !== undefined && rawValues !== null ? rawValues : {}

      // PATTERN: Include id, entityKey, and shape references from form values
      const entity: Record<string, unknown> = {
        id: fieldContext.entityId,
        entityKey: fieldContext.entityKey,
      }

      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.entityKey === 'blockInstance' && formValues.blockShapeRef) {
        entity.blockShapeRef = formValues.blockShapeRef
      }

      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.entityKey === 'partInstance' && formValues.partShapeRef) {
        entity.partShapeRef = formValues.partShapeRef
      }

      // PATTERN: Assert as GlobalEntity type - useEntityMetadata accepts partial entities
      return entity as GlobalEntity<GlobalEntityTypeKey>
    }

    // PATTERN: Try store lookup, return null if not found
    try {
      const entity = admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
      return entity ?? null
    } catch {
      return null
    }
  })
}
