/**
 * WHY: Field Location Composable

LEARNING: Vue composable wrapper for FieldLoc...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import {
  getFieldLocation,
  groupFieldsByLocation,
  type FieldLocation,
  type FieldLocationContext,
} from '@/utils/forms/fieldLocationDispatcher'
import type { UseFieldLocationOptions, UseFieldLocationReturn } from '@/types/admin/fieldLocation'

export type { UseFieldLocationOptions, UseFieldLocationReturn } from '@/types/admin/fieldLocation'

/**
 * WHY: Field Location Composable

WHY: Components need reactive location checks...
 */
export function useFieldLocation<GE extends GlobalEntityKey>(
  options: UseFieldLocationOptions<GE>
): UseFieldLocationReturn<GE> {
  const { fieldKeys, fieldMetadata, isExpanded } = options

  const context = computed<FieldLocationContext>(() => ({
    isExpanded: isExpanded.value
  }))

  const getFieldLocationForField = (fieldKey: GlobalFieldKey<GE>): FieldLocation => {
    const metadata = fieldMetadata.value[String(fieldKey)]
    return getFieldLocation(fieldKey, metadata, context.value)
  }

  const fieldsByLocation = computed(() => {
    return groupFieldsByLocation(
      fieldKeys.value,
      fieldMetadata.value,
      context.value
    )
  })

  const titleRowFields = computed(() => {
    return fieldsByLocation.value.titleRow
  })

  return {
    getFieldLocation: getFieldLocationForField,
    fieldsByLocation,
    titleRowFields
  }
}
