/**
 * WHY: Entity Card Field Configuration Composable

WHY: Reduces component compl...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseEntityCardFieldConfigurationParams, UseEntityCardFieldConfigurationReturn } from '@/types/admin/entityCardFieldConfiguration'
import { useFieldLocation } from './useFieldLocation'

export type { UseEntityCardFieldConfigurationParams, UseEntityCardFieldConfigurationReturn } from '@/types/admin/entityCardFieldConfiguration'

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
