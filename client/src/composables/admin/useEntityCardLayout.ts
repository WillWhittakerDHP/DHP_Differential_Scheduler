/**
 * Entity Card Layout Composable
 * 
 * LEARNING: Extracts layout logic for unified field rendering from EntityFormContent component
 * WHY: Moves field selection and layout logic out of component into reusable composable
 * PATTERN: Composable that determines which fields to render using unified layout mechanism
 * 
 * LEARNING: Updated to use unified layout (no entity-type-specific code)
 * WHY: All entities now use same layout mechanism (inline/stacked fields)
 * PATTERN: Single unified layout for all entity types
 * 
 * This composable handles:
 * - Field extraction from EntityFormContent using unified layout
 * - Field context retrieval for fields
 * - Layout determination for inline/stacked fields
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
 * Entity Card Layout Composable
 * 
 * LEARNING: Provides unified layout logic for EntityCard component
 * WHY: Extracts field selection and layout logic from component to composable
 * PATTERN: Composable that determines which fields to render using unified layout mechanism
 */
export function useEntityCardLayout(
  options: UseEntityCardLayoutOptions
): UseEntityCardLayoutReturn {
  const {
    formContentRef
  } = options
  
  /**
   * LEARNING: Fields from EntityFormContent using unified layout
   * WHY: All entities use same layout mechanism (inline/stacked fields)
   * PATTERN: Access fields from EntityFormContent ref when available
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
   * LEARNING: Helper function to get field context from EntityFormContent
   * WHY: Need to render fields using FieldRenderer
   * PATTERN: Access getFieldContext method from EntityFormContent ref
   */
  const getFieldContext = (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ): FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined => {
    if (!formContentRef.value) return undefined
    return formContentRef.value.getFieldContext?.(fieldKey)
  }
  
  /**
   * LEARNING: Whether fields should be rendered
   * WHY: Only render when fields are available and not empty
   * PATTERN: Computed property that checks fields structure
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

