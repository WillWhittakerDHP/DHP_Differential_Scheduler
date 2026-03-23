/**
 * Annotation instance: hide primitive `text` when user-type block instances exist (field location dispatcher).
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import { listSortedUserTypeBlockInstances } from '@/utils/admin/userTypeBlockInstances'
import type { useAdmin } from '@/composables/admin/useAdmin'

export function useEntityCardAnnotationComposedMetadata(params: {
  entityKey: ComputedRef<GlobalEntityKey>
  parentBlockShapeIsStateControl: ComputedRef<boolean>
  baseComposedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  admin: ReturnType<typeof useAdmin>
}): ComputedRef<Record<string, FieldMetadataEntry>> {
  const { entityKey, parentBlockShapeIsStateControl, baseComposedFieldMetadata, admin } = params

  return computed(() => {
    const base = baseComposedFieldMetadata.value
    if (entityKey.value !== 'annotationInstance') {
      return base
    }
    if (parentBlockShapeIsStateControl.value) {
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
