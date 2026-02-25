/**
 * PATTERN: Composable for status button fields computation
PATTERN: Composable that...
 */
import { computed } from 'vue'
import { categorizeFieldsBySection } from '@/utils/forms/fieldSectionCategorization'
import { useEntityMetadata } from './useEntityMetadata'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn } from '@/types/admin/statusButtonFields'

export type { UseStatusButtonFieldsOptions, UseStatusButtonFieldsReturn } from '@/types/admin/statusButtonFields'

export function useStatusButtonFields<GE extends GlobalEntityKey>(
  options: UseStatusButtonFieldsOptions<GE>
): UseStatusButtonFieldsReturn<GE> {
  const { entityKey, anyEntityForMetadata } = options

  const { fieldMetadata } = useEntityMetadata(entityKey, anyEntityForMetadata)

  const statusButtonFields = computed(() => {
    const categorized = categorizeFieldsBySection([], {
      fieldMetadata: fieldMetadata.value
    })

    return categorized.statusButtonFields.map((f) => ({
      ...f,
      key: f.key as GlobalFieldKey<GE>,
    }))
  })

  return {
    statusButtonFields
  }
}
