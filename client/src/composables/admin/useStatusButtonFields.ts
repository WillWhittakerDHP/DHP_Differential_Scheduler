/**
 * Composable for status button fields computation
 * WHY: Extracts status button fields computation logic from ShapesTab
 * PATTERN: Composable that computes status button fields from metadata
 */

import { computed, type ComputedRef } from 'vue'
import { categorizeFieldsBySection, type StatusButtonField } from '@/utils/forms/fieldSectionCategorization'
import { useEntityMetadata } from './useEntityMetadata'
import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

export interface UseStatusButtonFieldsOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  anyEntityForMetadata: ComputedRef<GlobalEntity<GE> | null>
}

export interface UseStatusButtonFieldsReturn<GE extends GlobalEntityKey> {
  statusButtonFields: ComputedRef<Array<Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<GE> }>>
}

/**
 * Composable for computing status button fields
 * WHY: Centralizes status button fields computation logic
 * PATTERN: Returns computed property for status button fields
 */
export function useStatusButtonFields<GE extends GlobalEntityKey>(
  options: UseStatusButtonFieldsOptions<GE>
): UseStatusButtonFieldsReturn<GE> {
  const { entityKey, anyEntityForMetadata } = options

  const { fieldMetadata } = useEntityMetadata(entityKey, anyEntityForMetadata)

  const statusButtonFields = computed(() => {
    const categorized = categorizeFieldsBySection([], undefined, {
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
