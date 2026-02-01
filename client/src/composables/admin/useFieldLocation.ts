/**
 * Field Location Composable
 * 
 * LEARNING: Vue composable wrapper for FieldLocationDispatcher
 * WHY: Provides reactive location determination for use in components
 * PATTERN: Composable that wraps pure dispatcher function with Vue reactivity
 * 
 * This composable provides:
 * - Reactive field location determination
 * - Helper functions for checking field locations
 * - Grouped fields by location for easy rendering
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
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
   * WHY: Components need to check where individual fields should render
   * PATTERN: Function that returns location type with reason
   */
  getFieldLocation: (fieldKey: GlobalFieldKey<GE>) => FieldLocation
  
  /**
   * Fields grouped by location
   * WHY: Components can iterate over fields by location for rendering
   * PATTERN: Computed property that groups all fields by their location
   */
  fieldsByLocation: ComputedRef<{
    titleRow: GlobalFieldKey<GE>[]
    directInline: GlobalFieldKey<GE>[]
    directStacked: GlobalFieldKey<GE>[]
    subPanels: {
      parts: GlobalFieldKey<GE>[]
      relationships: GlobalFieldKey<GE>[]
      annotations: GlobalFieldKey<GE>[]
      events: GlobalFieldKey<GE>[]
    }
    hidden: GlobalFieldKey<GE>[]
  }>
  
  /**
   * LEARNING: Title row fields for declarative rendering
   * WHY: Components render fields based on their metadata properties directly
   * PATTERN: Return all title row fields - no filtering or categorization
   * NOTE: Component reads metadata directly to determine rendering behavior
   */
  titleRowFields: ComputedRef<GlobalFieldKey<GE>[]>
}

/**
 * Field Location Composable
 * 
 * LEARNING: Provides reactive field location determination
 * WHY: Components need reactive location checks that update when metadata or expansion state changes
 * PATTERN: Composable that wraps pure dispatcher function with Vue reactivity
 */
export function useFieldLocation<GE extends GlobalEntityKey>(
  options: UseFieldLocationOptions<GE>
): UseFieldLocationReturn<GE> {
  const { fieldKeys, fieldMetadata, isExpanded } = options

  /**
   * LEARNING: Create context computed property
   * WHY: Context is reactive and needs to update when isExpanded changes
   * PATTERN: Computed property that creates context object
   */
  const context = computed<FieldLocationContext>(() => ({
    isExpanded: isExpanded.value
  }))

  /**
   * LEARNING: Get location for a specific field
   * WHY: Components need to check where individual fields should render
   * PATTERN: Function that uses dispatcher with current metadata and context
   */
  const getFieldLocationForField = (fieldKey: GlobalFieldKey<GE>): FieldLocation => {
    const metadata = fieldMetadata.value[String(fieldKey)]
    return getFieldLocation(fieldKey, metadata, context.value)
  }

  /**
   * LEARNING: Group all fields by location
   * WHY: Components can iterate over fields by location for rendering
   * PATTERN: Computed property that groups fields using dispatcher
   */
  const fieldsByLocation = computed(() => {
    return groupFieldsByLocation(
      fieldKeys.value,
      fieldMetadata.value,
      context.value
    )
  })

  /**
   * LEARNING: Title row fields for declarative rendering
   * WHY: Components render fields based on their metadata properties directly - no filtering
   * PATTERN: Return all title row fields - component reads metadata to determine rendering
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
