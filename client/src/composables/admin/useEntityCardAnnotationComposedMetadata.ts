import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useAdmin } from '@/composables/admin/useAdmin'
import { listSortedUserTypeBlockInstances } from '@/utils/admin/userTypeBlockInstances'

export interface UseEntityCardAnnotationComposedMetadataParams {
  entityKey: MaybeRefOrGetter<GlobalEntityKey>
  parentBlockShapeIsStateControl: MaybeRefOrGetter<boolean>
  baseComposedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  admin: ReturnType<typeof useAdmin>
}

/**
 * WHY: Keeps EntityCard.vue script under vue-architecture line limits.
 * Annotation cards hide primitive `text` when user-type block instances exist (unless parent is state control).
 */
export function useEntityCardAnnotationComposedMetadata(
  params: UseEntityCardAnnotationComposedMetadataParams
): ComputedRef<Record<string, FieldMetadataEntry>> {
  const { entityKey, parentBlockShapeIsStateControl, baseComposedFieldMetadata, admin } = params

  return computed(() => {
    const base = baseComposedFieldMetadata.value
    if (toValue(entityKey) !== 'annotationInstance') {
      return base
    }
    if (toValue(parentBlockShapeIsStateControl)) {
      return base
    }
    if (listSortedUserTypeBlockInstances(admin).length === 0) {
      return base
    }
    const textEntry = base.text
    if (!textEntry) {
      return base
    }
    return {
      ...base,
      text: { ...textEntry, visibility: FIELD_VISIBILITY.HIDDEN },
    }
  })
}
