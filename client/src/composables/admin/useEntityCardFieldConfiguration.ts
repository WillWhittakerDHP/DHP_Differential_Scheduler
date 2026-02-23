/**
 * WHY: Entity Card Field Configuration Composable

WHY: Reduces component compl...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useFieldLocation } from './useFieldLocation'

export interface UseEntityCardFieldConfigurationParams {
  entityKey: GlobalEntityKey
  
  fieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  
  isExpanded: ComputedRef<boolean>
  
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardFieldConfigurationReturn {
  finalFieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  fieldLocation: ReturnType<typeof useFieldLocation>
  
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export function useEntityCardFieldConfiguration(
  params: UseEntityCardFieldConfigurationParams
): UseEntityCardFieldConfigurationReturn {
  const { fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params

  // PATTERN: Override fieldKeys if filtered metadata is provided
  const finalFieldKeys = computed(() => {
    if (filteredMetadata && Object.keys(filteredMetadata).length > 0) {
      return Object.keys(filteredMetadata) as GlobalFieldKey<GlobalEntityKey>[]
    }
    return fieldKeys.value
  })

  /**
   * PATTERN: Composable that determines field locations from metadata + context
   */
  const fieldLocation = useFieldLocation({
    fieldKeys: finalFieldKeys,
    fieldMetadata: composedFieldMetadata,
    isExpanded: isExpanded
  })

  // PATTERN: Extract from fieldLocation.fieldsByLocation after fieldLocation is computed
  const inlineFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directInline)
  const stackedFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directStacked)

  return {
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig
  }
}
