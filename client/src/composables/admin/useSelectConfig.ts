/**
 * Select Config Composable
 * 
 * LEARNING: Extracts select configuration parsing logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - config parsing belongs in composables
 * PATTERN: Composable that provides select configuration and derived properties
 * 
 * This composable handles:
 * - Field config retrieval from adminConfig
 * - Select config extraction (relationshipSelect or typeSelect)
 * - Select mode determination (single, multiple, nested)
 * - Option entity key determination
 * - Option label key determination
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { RelationshipSelectModeEnum, RelationshipSelectTypeEnum } from '@/types/entity/formDataEnums'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { FieldContextType } from '@/composables/useFieldContext'

/**
 * Select Config Composable Options
 */
export interface UseSelectConfigOptions {
  /**
   * Field context containing entityKey and fieldKey
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

/**
 * Select Config Composable Return Type
 */
export interface UseSelectConfigReturn {
  /**
   * Form field config for this field
   */
  fieldConfig: ComputedRef<ReturnType<typeof useAdminConfig>['getFormFieldConfig'] extends (...args: any[]) => { value: infer T } ? T : never>
  
  /**
   * Select config (relationshipSelect or typeSelect)
   */
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  
  /**
   * Whether this is a DescriptionSelect field (annotations)
   */
  isDescriptionSelect: ComputedRef<boolean>
  
  /**
   * Whether select allows multiple selections
   */
  isMultiple: ComputedRef<boolean>
  
  /**
   * Props for chips when multiple is true
   */
  chipsProps: ComputedRef<Record<string, unknown>>
  
  /**
   * Entity key to fetch options from
   */
  optionEntityKey: ComputedRef<GlobalEntityKey>
  
  /**
   * Property key to use for option labels (name or text)
   */
  optionLabelKey: ComputedRef<string>
}

/**
 * Select Config Composable
 * 
 * LEARNING: Provides select configuration logic extracted from SelectInputs component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for select configuration
 */
export function useSelectConfig(
  options: UseSelectConfigOptions
): UseSelectConfigReturn {
  const { fieldContext } = options
  
  const adminConfig = useAdminConfig()

  /**
   * LEARNING: Get form field config for this field
   * WHY: Contains relationshipSelect or typeSelect config
   * PATTERN: Read from adminConfig using entityKey and fieldKey
   */
  const fieldConfig = computed(() => {
    try {
      return adminConfig.getFormFieldConfig(fieldContext.entityKey, fieldContext.fieldKey).value
    } catch (error) {
      return undefined
    }
  })

  /**
   * LEARNING: Extract select config (relationshipSelect or typeSelect)
   * WHY: Determines select behavior (options, filtering, etc.)
   * PATTERN: Check for relationshipSelect first, then typeSelect
   */
  const selectConfig = computed((): RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey> | undefined => {
    const config = fieldConfig.value
    if (!config) {
      return undefined
    }
    return config?.relationshipSelect || config?.typeSelect
  })

  /**
   * LEARNING: Check if this is a DescriptionSelect field
   * WHY: Annotations are part of the annotation system, not core entities
   * PATTERN: Check selectType from config
   */
  const isDescriptionSelect = computed(() => {
    const config = selectConfig.value
    return Boolean(
      config &&
        'selectType' in config &&
        config.selectType === RelationshipSelectTypeEnum.DescriptionSelect
    )
  })

  /**
   * LEARNING: Determine if select is multiple from config
   * WHY: Config determines selectMode (single, multiple, required, nested)
   * PATTERN: Check selectMode in config using enum values
   * NOTE: "Nested" mode also allows multiple selections (like activeConstituents)
   */
  const isMultiple = computed(() => {
    const config = selectConfig.value
    if (!config) return false
    
    // Check selectMode using enum values - Multiple or Nested means multi-select
    const selectMode = config?.selectMode
    return selectMode === RelationshipSelectModeEnum.Multiple || selectMode === RelationshipSelectModeEnum.Nested
  })

  /**
   * LEARNING: Computed props for chips - only add when multiple is true
   * WHY: AppSelect chips prop should only be present when true, not false
   * PATTERN: Use computed to conditionally include props
   */
  const chipsProps = computed(() => {
    if (isMultiple.value) {
      return {
        chips: true,
        'closable-chips': true
      }
    }
    return {}
  })

  /**
   * LEARNING: Determine optionEntityKey from config
   * WHY: Config determines which entity type to fetch options from
   * PATTERN: Read candidateChildKey or selectedChildKey from config
   */
  const optionEntityKey = computed(() => {
    const config = selectConfig.value
    if (!config) return fieldContext.entityKey
    
    // LEARNING: Use `targetMode` as a discriminant to avoid impossible narrowing (never)
    // WHY: `candidateChildKey/selectedChildKey/selectType` exist on BOTH config variants, so checking them
    //      doesn't narrow and can even confuse TS control-flow analysis.
    if (config.targetMode === 'property') {
      return config.targetKey
    }
    return config.candidateChildKey as GlobalEntityKey
    
    return fieldContext.entityKey
  })

  /**
   * LEARNING: Determine optionLabelKey for entity name access
   * WHY: Configurable label key allows flexibility, defaults to 'name' to match React pattern
   * PATTERN: Use 'name' as default, could be configured from config in future
   * SPECIAL CASE: Annotations use 'text' field instead of 'name'
   */
  const optionLabelKey = computed(() => {
    // LEARNING: Annotations use 'text' field for display
    // WHY: Annotation entity has 'text' field, not 'name' field
    // PATTERN: Check if DescriptionSelect and use 'text', otherwise use 'name'
    if (isDescriptionSelect.value) {
      return 'text'
    }
    // Default to 'name' to match React implementation
    // Could be configured from selectConfig in future if needed
    return 'name'
  })

  return {
    fieldConfig,
    selectConfig,
    isDescriptionSelect,
    isMultiple,
    chipsProps,
    optionEntityKey,
    optionLabelKey
  }
}

