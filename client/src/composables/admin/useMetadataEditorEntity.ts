
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  buildMetadataEditorStubEntity,
  sentinelEntityIdForMetadataEditor,
} from '@/utils/admin/metadataEditorSentinelEntity'

export function useMetadataEditorEntity<
  GlobalEntityTypeKey extends GlobalEntityKey
>(
  entityKey: GlobalEntityTypeKey,
  _entity: GlobalEntity<GlobalEntityTypeKey> | null | undefined,
  blockShapeRef?: string | null
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  return computed((): GlobalEntity<GlobalEntityTypeKey> | null => {
    const entityId = sentinelEntityIdForMetadataEditor(entityKey)
    if (!entityId) {
      return null
    }
    return buildMetadataEditorStubEntity(entityKey, entityId, blockShapeRef)
  })
}
