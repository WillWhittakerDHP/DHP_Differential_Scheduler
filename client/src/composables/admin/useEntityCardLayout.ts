/**
 * WHY: Entity Card Layout Composable

WHY: Moves field selection and layout log...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldsByLayout } from '@/types/forms/layoutFieldCategorization'
import type { UseEntityCardLayoutOptions, UseEntityCardLayoutReturn } from '@/types/admin/entityCardLayout'
import { asEmptyArray } from '@/utils/safeDefaults'

export type { UseEntityCardLayoutOptions, UseEntityCardLayoutReturn } from '@/types/admin/entityCardLayout'

export function useEntityCardLayout(
  options: UseEntityCardLayoutOptions
): UseEntityCardLayoutReturn {
  const {
    formContentRef
  } = options
  
  const fields = computed<FieldsByLayout<GlobalFieldKey<GlobalEntityKey>>>(() => {
    if (!formContentRef.value) {
      return { inline: [], stacked: [], hidden: [] }
    }
    return {
      inline: asEmptyArray(formContentRef.value.readyInlineFields?.value),
      stacked: asEmptyArray(formContentRef.value.readyStackedFields?.value),
      hidden: []
    }
  })
  
  const getFieldContext = (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ): FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined => {
    if (!formContentRef.value) return undefined
    return formContentRef.value.getFieldContext?.(fieldKey)
  }
  
  const shouldRenderFields = computed(() => {
    const fieldData = fields.value
    return fieldData.inline.length > 0 || fieldData.stacked.length > 0
  })
  
  return {
    fields,
    getFieldContext,
    shouldRenderFields
  }
}

