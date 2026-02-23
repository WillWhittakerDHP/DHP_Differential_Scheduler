/**
 * WHY: Entity Card Layout Composable

WHY: Moves field selection and layout log...
 */
import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import { asEmptyArray } from '@/utils/safeDefaults'

export interface FieldsByLayout {
  inline: Array<GlobalFieldKey<GlobalEntityKey>>
  stacked: Array<GlobalFieldKey<GlobalEntityKey>>
}

export interface UseEntityCardLayoutOptions {
  entityKey: GlobalEntityKey
  
  formContentRef: Ref<{
    readyInlineFields?: Ref<Array<GlobalFieldKey<GlobalEntityKey>>>
    readyStackedFields?: Ref<Array<GlobalFieldKey<GlobalEntityKey>>>
    getFieldContext?: (
      fieldKey: GlobalFieldKey<GlobalEntityKey>
    ) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  } | null>
}

export interface UseEntityCardLayoutReturn {
  fields: Ref<FieldsByLayout>
  
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  
  shouldRenderFields: Ref<boolean>
}

/**
 * WHY: Entity Card Layout Composable

WHY: Extracts field selection and layout ...
 */
export function useEntityCardLayout(
  options: UseEntityCardLayoutOptions
): UseEntityCardLayoutReturn {
  const {
    formContentRef
  } = options
  
  /**
   */
  const fields = computed<FieldsByLayout>(() => {
    if (!formContentRef.value) {
      return { inline: [], stacked: [] }
    }
    
    return {
      inline: asEmptyArray(formContentRef.value.readyInlineFields?.value),
      stacked: asEmptyArray(formContentRef.value.readyStackedFields?.value)
    }
  })
  
  /**
   */
  const getFieldContext = (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined => {
    if (!formContentRef.value) return undefined
    return formContentRef.value.getFieldContext?.(fieldKey)
  }
  
  /**
   */
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

