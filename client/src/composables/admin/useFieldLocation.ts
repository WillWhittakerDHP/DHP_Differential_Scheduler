/**
 * WHY: Field Location Composable

LEARNING: Vue composable wrapper for FieldLoc...
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import {
  getFieldLocation,
  groupFieldsByLocation,
  type FieldLocation,
  type FieldLocationContext
} from '@/utils/forms/fieldLocationDispatcher'

export interface UseFieldLocationOptions<GE extends GlobalEntityKey> {
  fieldKeys: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  
  fieldMetadata: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  
  isExpanded: Ref<boolean> | ComputedRef<boolean>
}

export interface UseFieldLocationReturn<GE extends GlobalEntityKey> {
  /**
   * Get location for a specific field
   */
  getFieldLocation: (fieldKey: GlobalFieldKey<GE>) => FieldLocation
  
  /**
   * Fields grouped by location
   */
  fieldsByLocation: ComputedRef<{
    titleRow: GlobalFieldKey<GE>[]
    directInline: GlobalFieldKey<GE>[]
    directStacked: GlobalFieldKey<GE>[]
    subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
    hidden: GlobalFieldKey<GE>[]
  }>
  
  /**
   * NOTE: Component reads metadata directly to determine rendering behavior
   */
  titleRowFields: ComputedRef<GlobalFieldKey<GE>[]>
}

/**
 * WHY: Field Location Composable

WHY: Components need reactive location checks...
 */
export function useFieldLocation<GE extends GlobalEntityKey>(
  options: UseFieldLocationOptions<GE>
): UseFieldLocationReturn<GE> {
  const { fieldKeys, fieldMetadata, isExpanded } = options

  /**
   */
  const context = computed<FieldLocationContext>(() => ({
    isExpanded: isExpanded.value
  }))

  /**
   */
  const getFieldLocationForField = (fieldKey: GlobalFieldKey<GE>): FieldLocation => {
    const metadata = fieldMetadata.value[String(fieldKey)]
    return getFieldLocation(fieldKey, metadata, context.value)
  }

  /**
   */
  const fieldsByLocation = computed(() => {
    return groupFieldsByLocation(
      fieldKeys.value,
      fieldMetadata.value,
      context.value
    )
  })

  /**
   * NOTE: NO filtering or categorization - purely declarative
   */
  const titleRowFields = computed(() => {
    return fieldsByLocation.value.titleRow
  })

  return {
    getFieldLocation: getFieldLocationForField,
    fieldsByLocation,
    titleRowFields
  }
}
