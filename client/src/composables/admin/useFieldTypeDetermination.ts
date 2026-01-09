/**
 * Field Type Determination Composable
 * 
 * LEARNING: Extracts field type determination logic from InputRenderer component
 * WHY: Components should be thin UI wrappers - type determination logic belongs in composables
 * PATTERN: Composable that determines field type from admin config
 * 
 * This composable handles:
 * - Field config retrieval
 * - Type checking (icon, primitive, nested, annotations, select)
 * - Error handling for config retrieval
 */

import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'

/**
 * Field Type Determination Composable Options
 */
export interface UseFieldTypeDeterminationOptions {
  /**
   * LEARNING: Entity key for field
   * WHY: Needed to retrieve field config
   * PATTERN: GlobalEntityKey type
   */
  entityKey: Ref<GlobalEntityKey> | GlobalEntityKey
  
  /**
   * LEARNING: Field key
   * WHY: Needed to retrieve field config
   * PATTERN: GlobalFieldKey type
   */
  fieldKey: Ref<GlobalFieldKey<GlobalEntityKey>> | GlobalFieldKey<GlobalEntityKey>
}

/**
 * Field Type Determination Composable Return Type
 */
export interface UseFieldTypeDeterminationReturn {
  /**
   * LEARNING: Field config from admin config
   * WHY: Used for type determination
   * PATTERN: Computed property with error handling
   */
  fieldConfig: Ref<ReturnType<typeof useAdminConfig>['getFormFieldConfig'] extends (...args: any[]) => { value: infer T } ? T : never>
  
  /**
   * LEARNING: Whether field is icon type
   * WHY: Icon fields need special IconInput component
   * PATTERN: Computed property that checks if fieldKey is 'icon'
   */
  isIcon: Ref<boolean>
  
  /**
   * LEARNING: Whether field is primitive type
   * WHY: Primitive fields use PrimitiveInputs component
   * PATTERN: Computed property that checks config structure
   */
  isPrimitive: Ref<boolean>
  
  /**
   * LEARNING: Whether field is nested collection type
   * WHY: Nested fields use NestedCollectionField component
   * PATTERN: Computed property that checks selectMode in config
   */
  isNested: Ref<boolean>
  
  /**
   * LEARNING: Whether field is annotations type
   * WHY: Annotations fields use AnnotationsField component
   * PATTERN: Computed property that checks if fieldKey is 'annotations'
   */
  isAnnotations: Ref<boolean>
  
  /**
   * LEARNING: Whether field is select type
   * WHY: Select fields use SelectInputs component
   * PATTERN: Computed property that checks config structure, excluding nested and annotations
   */
  isSelect: Ref<boolean>
}

/**
 * Field Type Determination Composable
 * 
 * LEARNING: Provides field type determination logic extracted from components
 * WHY: Moves type checking logic out of components into reusable composable
 * PATTERN: Composable with computed properties for type checking
 */
export function useFieldTypeDetermination(
  options: UseFieldTypeDeterminationOptions
): UseFieldTypeDeterminationReturn {
  const { entityKey, fieldKey } = options
  
  const adminConfig = useAdminConfig()
  
  /**
   * LEARNING: Normalize entityKey and fieldKey to refs
   * WHY: Options can accept Ref or direct values, normalize to computed for consistent usage
   * PATTERN: Check if provided value is Ref, otherwise wrap in computed
   */
  const entityKeyRef = computed(() => {
    return entityKey instanceof Object && 'value' in entityKey ? entityKey.value : entityKey
  })
  
  const fieldKeyRef = computed(() => {
    return fieldKey instanceof Object && 'value' in fieldKey ? fieldKey.value : fieldKey
  })
  
  /**
   * LEARNING: Get field config from admin config
   * WHY: Used for type determination
   * PATTERN: Computed property with error handling
   */
  const fieldConfig = computed(() => {
    try {
      return adminConfig.getFormFieldConfig(entityKeyRef.value, fieldKeyRef.value as GlobalFieldKey<typeof entityKeyRef.value>).value
    } catch (error) { 
      
      return undefined
    }
  })
  
  /**
   * LEARNING: Whether field is icon type
   * WHY: Icon fields need special IconInput component
   * PATTERN: Computed property that checks if fieldKey is 'icon'
   */
  const isIcon = computed(() => {
    return String(fieldKeyRef.value) === 'icon'
  })
  
  /**
   * LEARNING: Whether field is primitive type
   * WHY: Primitive fields use PrimitiveInputs component
   * PATTERN: Computed property that checks config structure
   * NOTE: Icon fields are also primitive but use IconInput instead
   */
  const isPrimitive = computed(() => {
    // Don't treat icon fields as primitive - they use IconInput
    if (isIcon.value) {
      return false
    }
    const config = fieldConfig.value
    return !!config?.primitiveInput
  })
  
  /**
   * LEARNING: Whether field is nested collection type
   * WHY: Nested fields use NestedCollectionField component
   * PATTERN: Computed property that checks selectMode in config
   */
  const isNested = computed(() => {
    const config = fieldConfig.value
    const selectMode = config?.relationshipSelect?.selectMode || config?.typeSelect?.selectMode
    // RelationshipSelectModeEnum.Nested = "nested" (lowercase)
    return selectMode === RelationshipSelectModeEnum.Nested
  })
  
  /**
   * LEARNING: Whether field is annotations type
   * WHY: Annotations fields use AnnotationsField component
   * PATTERN: Computed property that checks if fieldKey is 'annotations'
   */
  const isAnnotations = computed(() => {
    return String(fieldKeyRef.value) === 'annotations'
  })
  
  /**
   * LEARNING: Whether field is select type
   * WHY: Select fields use SelectInputs component
   * PATTERN: Computed property that checks config structure, excluding nested and annotations
   */
  const isSelect = computed(() => {
    // Exclude annotations field - it uses AnnotationsField component
    if (isAnnotations.value) {
      return false
    }
    const config = fieldConfig.value
    const hasSelectConfig = !!(config?.relationshipSelect || config?.typeSelect)
    // Exclude nested fields - they should use NestedCollectionField
    if (hasSelectConfig && isNested.value) {
      return false
    }
    return hasSelectConfig
  })
  
  return {
    fieldConfig,
    isIcon,
    isPrimitive,
    isNested,
    isAnnotations,
    isSelect
  }
}

