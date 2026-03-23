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
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdmin } from '@/composables/admin/useAdmin'
import { createLogger } from '@/utils/logger'
import {
  buildTemporaryMetadataEntityStub,
  isTemporaryMetadataEntityId,
} from '@/utils/admin/fieldContextMetadataEntity'

const logger = createLogger('useFieldContextMetadataEntity')

export function useFieldContextMetadataEntity<
  GlobalEntityTypeKey extends GlobalEntityKey,
  GlobalFieldTypeKey extends GlobalFieldKey<GlobalEntityTypeKey>
>(
  fieldContext: FieldContextTypeGrouped<GlobalEntityTypeKey, GlobalFieldTypeKey>
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  const admin = useAdmin()

  return computed((): GlobalEntity<GlobalEntityTypeKey> | null => {
    if (!fieldContext.state.entityKey || !fieldContext.state.entityId) {
      return null
    }

    const entityIdStr = String(fieldContext.state.entityId)
    if (isTemporaryMetadataEntityId(entityIdStr)) {
      const rawValues = fieldContext.state.formInstance?.values
      const formValues = rawValues !== undefined && rawValues !== null ? rawValues : {}
      return buildTemporaryMetadataEntityStub(
        fieldContext.state.entityKey,
        fieldContext.state.entityId,
        formValues as Record<string, unknown>
      )
    }

    try {
      const entity = admin.getEntity(fieldContext.state.entityKey, fieldContext.state.entityId)
      return entity ?? null
    } catch (err) {
      logger.warn('getEntity failed for metadata', {
        entityKey: fieldContext.state.entityKey,
        entityId: fieldContext.state.entityId,
        error: err,
      })
      return null
    }
  })
}
