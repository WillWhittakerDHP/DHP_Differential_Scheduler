/**
 * WHY: Keeps EntityCard.vue script under vue-architecture line limits.
 * PATTERN: Title-row shape names + EntityCardPrimaryTitleRowModel records live here; SFC wires props/refs.
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntity } from '@/types/entities'
import type { EntityCardPrimaryTitleRowModel } from '@/components/admin/generic/EntityCardPrimaryTitleRow.vue'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdmin } from '@/composables/admin/useAdmin'
import {
  annotationInstanceShapeDisplayTitle,
  eventInstanceShapeDisplayTitle,
  expansionFallbackTitleForCard,
  fieldTreatsAsStaticTitleForCard,
} from '@/utils/admin/entityCardPrimaryTitleShapeNames'

type AdminStore = ReturnType<typeof useAdmin>

interface UseEntityCardPrimaryTitleModelsParams {
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

  const annotationInstanceShapeTitle = computed((): string =>
    annotationInstanceShapeDisplayTitle(entityKey.value, entity.value, (id) =>
      admin.getEntity('annotationShape', id)
    )
  )

  const eventInstanceShapeTitle = computed((): string =>
    eventInstanceShapeDisplayTitle(entityKey.value, entity.value, (id) => admin.getEntity('eventShape', id))
  )

  const expansionFallbackTitle = computed(() =>
    expansionFallbackTitleForCard(entityKey.value, annotationInstanceShapeTitle.value, entityName.value)
  )

  const fieldTreatsAsStaticTitle = (fieldKey: string): boolean =>
    fieldTreatsAsStaticTitleForCard(fieldKey, entityKey.value, composedFieldMetadata.value)

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
