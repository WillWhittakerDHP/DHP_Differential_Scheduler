/**
 * Field Visibility Composable
 * 
 * LEARNING: Extracts field visibility logic from DynamicFormFields component
 * WHY: Components should be thin UI wrappers - field filtering belongs in composables
 * PATTERN: Composable that provides field visibility and categorization
 * 
 * This composable handles:
 * - All field keys extraction
 * - Omitted fields calculation
 * - Title field detection
 * - Visible fields filtering
 * - Inline/stacked fields configuration
 */

import { computed, type ComputedRef } from 'vue'
import { useAdminConfig } from '../useAdminConfig'
import { useAdmin } from '../useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
/**
 * Field Visibility Composable Options
 */
export interface UseFieldVisibilityOptions {
  /**
   * Entity type key
   */
  entityKey: GlobalEntityKey
  
  /**
   * Entity ID (for checking entity properties like constituable)
   */
  entityId: ComputedRef<GlobalEntityId>
  
  /**
   * Whether dialog is in modal mode
   */
  modalMode: boolean
  
  /**
   * Additional omitted fields from parent component
   */
  additionalOmittedFields?: GlobalFieldKey<GlobalEntityKey>[]
}

/**
 * Field Visibility Composable Return Type
 */
export interface UseFieldVisibilityReturn {
  /**
   * All field keys from formFieldConfig
   */
  allFieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Omitted fields (should not be shown)
   */
  omittedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Title field key (rendered in card title, not form)
   */
  titleField: ComputedRef<GlobalFieldKey<GlobalEntityKey> | undefined>
  
  /**
   * Visible fields (filtered from allFieldKeys)
   */
  visibleFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Inline fields configuration
   */
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * Stacked fields configuration
   */
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

/**
 * Field Visibility Composable
 * 
 * LEARNING: Provides field visibility logic extracted from DynamicFormFields component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for field filtering
 */
export function useFieldVisibility(
  options: UseFieldVisibilityOptions
): UseFieldVisibilityReturn {
  // NOTE: modalMode parameter kept for API compatibility but no longer used for titleField exclusion
  const { entityKey, entityId, modalMode: _modalMode, additionalOmittedFields = [] } = options

  const adminConfig = useAdminConfig()
  const adminComp = useAdmin()

  /**
   * LEARNING: Get form field config for this entity
   * WHY: Contains all configured fields
   * PATTERN: Read from adminConfig
   */
  const formFieldConfig = computed(() => {
    try {
      return adminConfig.getEntityFormFieldConfig(entityKey).value || {}
    } catch (error) {
      return {}
    }
  })

  /**
   * LEARNING: Get instance config for this entity
   * WHY: Contains omitFields, titleField, inlineFields, stackedFields
   * PATTERN: Read from adminConfig
   */
  const instanceConfig = computed(() => {
    try {
      return adminConfig.getInstanceConfig(entityKey).value || {}
    } catch (error) {
      return {}
    }
  })

  /**
   * LEARNING: Get all field keys from formFieldConfig
   * WHY: These are all fields that should be rendered
   * PATTERN: Object.keys gives us all configured fields, with defensive check
   */
  const allFieldKeys = computed(() => {
    try {
      const config = formFieldConfig.value || {}
      const keys = Object.keys(config) as GlobalFieldKey<typeof entityKey>[]
      return keys
    } catch (error) {
      return []
    }
  })

  /**
   * LEARNING: Get omitted fields from instanceConfig
   * WHY: These fields should not be shown in forms
   * PATTERN: Read from instanceConfig.omitFields, with defensive check
   */
  const omittedFields = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    try {
      const configValue = instanceConfig.value
      const config = (configValue && typeof configValue === 'object' && 'omitFields' in configValue) 
        ? configValue as { omitFields?: GlobalFieldKey<GlobalEntityKey>[] }
        : {} as { omitFields?: GlobalFieldKey<GlobalEntityKey>[] }
      const configOmitted = (config.omitFields || []) as GlobalFieldKey<GlobalEntityKey>[]
      // LEARNING: Merge config omitted fields with additional omitted fields
      // WHY: Allows parent components to conditionally hide fields beyond instanceConfig
      // PATTERN: Combine arrays and remove duplicates
      return [...new Set<GlobalFieldKey<GlobalEntityKey>>([...configOmitted, ...additionalOmittedFields])]
    } catch (error) {
      return []
    }
  })

  /**
   * LEARNING: Get titleField from instanceConfig
   * WHY: Title field should be rendered in card title, not in form content
   * PATTERN: Read from instanceConfig.titleField
   */
  const titleField = computed(() => {
    try {
      const config = instanceConfig.value as { titleField?: GlobalFieldKey<GlobalEntityKey> } | undefined
      return config?.titleField as GlobalFieldKey<GlobalEntityKey> | undefined
    } catch (error) {
      return undefined
    }
  })

  /**
   * LEARNING: Filter out omitted fields and titleField (unless in modal mode)
   * WHY: Only show fields that should be editable
   *      Title field is rendered in card title, not in form content (unless modalMode is true)
   * PATTERN: Filter array to exclude omitted fields and conditionally exclude titleField, with defensive check
   * 
   * LEARNING: Conditional field visibility for blockInstance based on blockShape properties
   * WHY: Some fields should only be visible when blockShape has certain properties (composable, constituable, composite)
   * PATTERN: Dynamically exclude fields based on entity properties, not separate code paths
   */
  const visibleFields = computed(() => {
    try {
      const keys = allFieldKeys.value || []
      const omitted = omittedFields.value || []
      
      // LEARNING: Get blockShape properties for conditional field visibility
      // WHY: Some fields should only be visible when blockShape has certain properties
      // PATTERN: Check entityKey and get entity to check properties
      let isConstituable = true // Default to true for non-blockShape/blockInstance entities
      let isComposable = false
      let isComposite = false
      
      if (entityKey === 'blockShape' && entityId.value) {
        const blockShape = adminComp.getEntity('blockShape', entityId.value)
        if (blockShape) {
          isConstituable = blockShape.constituable === true
        }
      } else if (entityKey === 'blockInstance' && entityId.value) {
        const blockInstance = adminComp.getEntity('blockInstance', entityId.value)
        if (blockInstance) {
          isComposite = blockInstance.composite === true
          const blockShapeRef = blockInstance.blockShapeRef
          if (blockShapeRef) {
            const blockShape = adminComp.getEntity('blockShape', blockShapeRef)
            if (blockShape) {
              isConstituable = blockShape.constituable === true
              isComposable = blockShape.composable === true
            }
          }
        }
      }
      
      const visible = keys.filter(
        fieldKey => {
          const fieldKeyStr = String(fieldKey)
          // Exclude omitted fields
          if (omitted.includes(fieldKeyStr as GlobalFieldKey<GlobalEntityKey>)) {
            return false
          }
          // LEARNING: titleField (name) is NOT excluded from visibleFields
          // WHY: Name field should always be included in visibleFields and categorized as header field
          //      Display mode (static vs editable) is controlled by component's expanded state and hideTitleField prop
          // PATTERN: Keep name field in visibleFields, let EntityCard handle display mode
          // NOTE: Removed conditional exclusion - name field should always render, readOnly state controlled by expansion
          
          // LEARNING: Exclude validConstituents for non-constituable blockShapes
          // WHY: Only blockShapes with constituable: true can have validConstituents
          // PATTERN: Check constituable property and exclude field if false
          if (entityKey === 'blockShape' && fieldKeyStr === 'validConstituents' && !isConstituable) {
            return false
          }
          // LEARNING: Conditional field visibility for blockInstance based on blockShape properties
          // WHY: Some fields should only be visible when blockShape has certain properties
          // PATTERN: Dynamically exclude fields based on entity properties
          if (entityKey === 'blockInstance') {
            // Exclude baseSqFt when not constituable
            if (fieldKeyStr === 'baseSqFt' && !isConstituable) {
              return false
            }
            // Exclude instanceComponents/dependentInstanceOptions when not composable or not composite
            if ((fieldKeyStr === 'instanceComponents' || fieldKeyStr === 'dependentInstanceOptions') && (!isComposable || !isComposite)) {
              return false
            }
            // Exclude activeConstituents when not constituable
            if (fieldKeyStr === 'activeConstituents' && !isConstituable) {
              return false
            }
          }
          return true
        }
      )
      return visible
    } catch (error) {
      return []
    }
  })

  /**
   * LEARNING: Get inline fields from instanceConfig
   * WHY: These fields should be displayed in a row
   * PATTERN: Read from instanceConfig.inlineFields
   */
  const inlineFieldsConfig = computed(() => {
    const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    return (config?.inlineFields || []) as GlobalFieldKey<GlobalEntityKey>[]
  })

  /**
   * LEARNING: Get stacked fields from instanceConfig
   * WHY: These fields should be displayed stacked vertically
   * PATTERN: Read from instanceConfig.stackedFields
   */
  const stackedFieldsConfig = computed(() => {
    const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    return (config?.stackedFields || []) as GlobalFieldKey<GlobalEntityKey>[]
  })

  return {
    allFieldKeys,
    omittedFields,
    titleField,
    visibleFields,
    inlineFieldsConfig,
    stackedFieldsConfig
  }
}

