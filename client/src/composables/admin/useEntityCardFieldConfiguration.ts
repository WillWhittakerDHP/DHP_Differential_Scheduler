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
  const { entityKey, fieldKeys, composedFieldMetadata, isExpanded, filteredMetadata } = params

  const finalFieldKeys = computed(() => {
    let keys: GlobalFieldKey<GE>[]
    if (filteredMetadata && Object.keys(filteredMetadata).length > 0) {
      keys = Object.keys(filteredMetadata) as GlobalFieldKey<GE>[]
    } else {
      keys = fieldKeys.value
    }
    if (entityKey === 'eventShape') {
      return keys.filter((k) => String(k) !== 'anchorEdge')
    }
    return keys
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
