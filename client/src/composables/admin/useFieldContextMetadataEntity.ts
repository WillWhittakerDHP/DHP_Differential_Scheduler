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
import type { FieldContextType } from '@/composables/useFieldContext'
import { useAdmin } from '@/composables/useAdmin'

/**
 * Get entity for metadata lookup from field context
 * 
 * LEARNING: Handles both temporary and existing entities
 * WHY: New entities (IDs starting with 'new-') don't exist in store yet, so we construct from form values
 * PATTERN: Check if entityId is temporary, if so use form values, otherwise use store lookup
 * 
 * @param fieldContext - Field context containing entityKey, entityId, and formInstance
 * @returns Computed ref to entity or null
 */
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
    const isTemporaryEntity = entityIdStr.startsWith('new-')

    // LEARNING: For temporary entities, construct entity object from form values
    // WHY: New entities don't exist in store yet, but form has the values we need for metadata lookup
    // PATTERN: Build minimal entity object with id, entityKey, and shape references needed for metadata
    if (isTemporaryEntity) {
      const formValues = fieldContext.formInstance?.values || {}

      // LEARNING: Construct minimal entity object for metadata lookup
      // WHY: useEntityMetadata needs entity with id and shape references (e.g., blockShapeRef for blockInstance)
      // PATTERN: Include id, entityKey, and shape references from form values
      const entity: Record<string, unknown> = {
        id: fieldContext.entityId,
        entityKey: fieldContext.entityKey,
      }

      // LEARNING: Include blockShapeRef for blockInstance entities
      // WHY: BlockInstance metadata can be BlockShape-specific, so blockShapeRef is needed for correct metadata lookup
      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.entityKey === 'blockInstance' && formValues.blockShapeRef) {
        entity.blockShapeRef = formValues.blockShapeRef
      }

      // LEARNING: Include partShapeRef for partInstance entities
      // WHY: PartInstance metadata may be PartShape-specific, so partShapeRef is needed
      // PATTERN: Copy shape reference fields from form values if they exist
      if (fieldContext.entityKey === 'partInstance' && formValues.partShapeRef) {
        entity.partShapeRef = formValues.partShapeRef
      }

      // LEARNING: Type assertion for minimal entity object
      // WHY: We only need id, entityKey, and shape references for metadata lookup, not full entity
      // PATTERN: Assert as GlobalEntity type - useEntityMetadata accepts partial entities
      return entity as GlobalEntity<GlobalEntityTypeKey>
    }

    // LEARNING: For existing entities, use store lookup
    // WHY: Existing entities are in the store, so we can look them up directly
    // PATTERN: Try store lookup, return null if not found
    try {
      const entity = admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
      return entity ?? null
    } catch {
      return null
    }
  })
}
