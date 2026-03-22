/**
 * WHY: Keeps EntityCard.vue script under vue-architecture line limits.
 * PATTERN: Title-row shape names + EntityCardPrimaryTitleRowModel records live here; SFC wires props/refs.
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntity } from '@/types/entities'
import type { EntityCardPrimaryTitleRowModel } from '@/components/admin/generic/EntityCardPrimaryTitleRow.vue'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdmin } from '@/composables/admin/useAdmin'
import { toGlobalEntityId } from '@/utils/globalEntity'

type AdminStore = ReturnType<typeof useAdmin>

export interface UseEntityCardPrimaryTitleModelsParams {
  entityKey: ComputedRef<GlobalEntityKey>
  entity: ComputedRef<GlobalEntity<GlobalEntityKey>>
  entityName: ComputedRef<string>
  titleRowFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  isFormReady: ComputedRef<boolean>
  isExpanded: ComputedRef<boolean>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  admin: AdminStore
}

export interface UseEntityCardPrimaryTitleModelsReturn {
  annotationInstanceShapeTitle: ComputedRef<string>
  eventInstanceShapeTitle: ComputedRef<string>
  expansionFallbackTitle: ComputedRef<string>
  fieldTreatsAsStaticTitle: (fieldKey: string) => boolean
  primaryTitleRowExpansion: ComputedRef<EntityCardPrimaryTitleRowModel>
  primaryTitleRowModal: ComputedRef<EntityCardPrimaryTitleRowModel>
}

export function useEntityCardPrimaryTitleModels(
  params: UseEntityCardPrimaryTitleModelsParams
): UseEntityCardPrimaryTitleModelsReturn {
  const {
    entityKey,
    entity,
    entityName,
    titleRowFields,
    isFormReady,
    isExpanded,
    composedFieldMetadata,
    getFieldContext,
    admin,
  } = params

  const annotationInstanceShapeTitle = computed((): string => {
    if (entityKey.value !== 'annotationInstance') return ''
    const ann = entity.value as GlobalEntity<'annotationInstance'>
    if (ann.type == null || String(ann.type) === '') return ''
    const shape = admin.getEntity('annotationShape', toGlobalEntityId(String(ann.type)))
    const n = shape?.name
    return typeof n === 'string' && n.trim() !== '' ? n.trim() : ''
  })

  const eventInstanceShapeTitle = computed((): string => {
    if (entityKey.value !== 'eventInstance') return ''
    const ei = entity.value as GlobalEntity<'eventInstance'>
    if (ei.eventShapeRef == null || String(ei.eventShapeRef) === '') return ''
    const shape = admin.getEntity('eventShape', toGlobalEntityId(String(ei.eventShapeRef)))
    const n = shape?.name
    return typeof n === 'string' && n.trim() !== '' ? n.trim() : ''
  })

  const expansionFallbackTitle = computed(() => {
    if (entityKey.value === 'annotationInstance' && annotationInstanceShapeTitle.value !== '') {
      return annotationInstanceShapeTitle.value
    }
    return entityName.value
  })

  function fieldTreatsAsStaticTitle(fieldKey: string): boolean {
    const vis = composedFieldMetadata.value[String(fieldKey)]?.visibility
    if (vis !== FIELD_VISIBILITY.STATIC_AS_TITLE) return false
    if (entityKey.value === 'annotationInstance' && fieldKey === 'text') {
      return false
    }
    return true
  }

  const primaryTitleRowExpansion = computed((): EntityCardPrimaryTitleRowModel => ({
    titleRowFields: titleRowFields.value,
    isFormReady: isFormReady.value,
    isExpanded: isExpanded.value,
    annotationInstanceShapeTitle: annotationInstanceShapeTitle.value,
    eventInstanceShapeTitle: eventInstanceShapeTitle.value,
    expansionFallbackTitle: expansionFallbackTitle.value,
    composedFieldMetadata: composedFieldMetadata.value,
    fieldTreatsAsStaticTitle,
    getFieldContext,
    readOnlyStaticWhenCollapsed: true,
    fallbackWhenNotReady: true,
  }))

  const primaryTitleRowModal = computed((): EntityCardPrimaryTitleRowModel => ({
    titleRowFields: titleRowFields.value,
    isFormReady: isFormReady.value,
    isExpanded: isExpanded.value,
    annotationInstanceShapeTitle: annotationInstanceShapeTitle.value,
    eventInstanceShapeTitle: eventInstanceShapeTitle.value,
    expansionFallbackTitle: expansionFallbackTitle.value,
    composedFieldMetadata: composedFieldMetadata.value,
    fieldTreatsAsStaticTitle,
    getFieldContext,
    readOnlyStaticWhenCollapsed: false,
    fallbackWhenNotReady: false,
  }))

  return {
    annotationInstanceShapeTitle,
    eventInstanceShapeTitle,
    expansionFallbackTitle,
    fieldTreatsAsStaticTitle,
    primaryTitleRowExpansion,
    primaryTitleRowModal,
  }
}
