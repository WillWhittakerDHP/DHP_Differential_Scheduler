/**
 * WHY: Entity Card Field Configuration Composable

WHY: Reduces component compl...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type {
  UseEntityCardFieldConfigurationParams,
  UseEntityCardFieldConfigurationReturn,
} from '@/types/admin/entityCardFieldConfiguration'
import { useFieldLocation } from './useFieldLocation'

export function useEntityCardFieldConfiguration<GE extends GlobalEntityKey = GlobalEntityKey>(
  params: UseEntityCardFieldConfigurationParams<GE>
): UseEntityCardFieldConfigurationReturn<GE> {
  const { fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params

  const finalFieldKeys = computed(() => {
    if (filteredMetadata && Object.keys(filteredMetadata).length > 0) {
      return Object.keys(filteredMetadata) as GlobalFieldKey<GE>[]
    }
    return fieldKeys.value
  })

  const fieldLocation = useFieldLocation<GE>({
    fieldKeys: finalFieldKeys,
    fieldMetadata: composedFieldMetadata,
    isExpanded: isExpanded,
  })

  const inlineFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directInline)
  const stackedFieldsConfig = computed(() => fieldLocation.fieldsByLocation.value.directStacked)

  return {
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig,
  }
}
