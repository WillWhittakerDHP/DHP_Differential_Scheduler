/**
 * Field Categorization Composable
 * 
 * LEARNING: Extracts field categorization logic from components
 * WHY: Components should be thin UI wrappers - categorization logic belongs in composables
 * PATTERN: Composable that provides field type checking and categorization methods
 * 
 * This composable handles:
 * - Field type determination (boolean, number, relationship)
 * - Field filtering by type
 * - Field exclusion logic (name/active, additional omitted fields)
 */

import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { PrimitiveModeEnum, PrimitiveTypeEnum } from '@/types/entity/formDataEnums'

/**
 * Field Categorization Composable Options
 */
export interface UseFieldCategorizationOptions {
  entityKey: GlobalEntityKey
  /**
   * LEARNING: Fields to exclude from categorization
   * WHY: Allows parent components to hide specific fields (e.g., name/active when rendered separately)
   * PATTERN: Array of field keys to exclude
   */
  excludedFields?: Ref<string[]> | string[]
  /**
   * LEARNING: Function to check if field context is ready
   * WHY: Only categorize fields that have ready contexts (for filtering)
   * PATTERN: Optional function that returns boolean for field readiness check
   */
  isFieldReady?: (fieldKey: string) => boolean
}

/**
 * Field Categorization Composable Return Type
 */
export interface UseFieldCategorizationReturn {
  /**
   * LEARNING: All field keys from formFieldConfig
   * WHY: Base list of all fields available for categorization
   * PATTERN: Computed property that gets keys from admin config
   */
  allFieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  
  /**
   * LEARNING: Get field config for a specific field
   * WHY: Used internally for type checking
   * PATTERN: Helper function that accesses admin config
   */
  getFieldConfig: (fieldKey: string) => ReturnType<typeof useAdminConfig>['getFormFieldConfig'] extends (...args: any[]) => { value: infer T } ? T : never
  
  /**
   * LEARNING: Check if field is boolean type
   * WHY: Boolean fields should render in row 2 (composable, constituable, etc.)
   * PATTERN: Check primitiveInput.primitiveMode for Checkbox or Toggle
   */
  isBooleanField: (fieldKey: string) => boolean
  
  /**
   * LEARNING: Check if field is number type
   * WHY: Number fields should render in row 3
   * PATTERN: Check primitiveInput.primitiveMode for Number or primitiveType for Number
   */
  isNumberField: (fieldKey: string) => boolean
  
  /**
   * LEARNING: Check if field is relationship type
   * WHY: Relationship fields should render in expandable panels
   * PATTERN: Check for relationshipSelect or typeSelect config (excluding nested)
   */
  isRelationshipField: (fieldKey: string) => boolean
  
  /**
   * LEARNING: Boolean fields filtered and ready
   * WHY: Component needs boolean fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  booleanFields: Ref<string[]>
  
  /**
   * LEARNING: Number fields filtered and ready
   * WHY: Component needs number fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  numberFields: Ref<string[]>
  
  /**
   * LEARNING: Relationship fields filtered and ready
   * WHY: Component needs relationship fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  relationshipFields: Ref<string[]>
}

/**
 * Field Categorization Composable
 * 
 * LEARNING: Provides field categorization logic extracted from components
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for field categorization
 */
export function useFieldCategorization(
  options: UseFieldCategorizationOptions
): UseFieldCategorizationReturn {
  const {
    entityKey,
    excludedFields: providedExcludedFields = [],
    isFieldReady
  } = options
  
  const adminConfig = useAdminConfig()
  
  /**
   * LEARNING: Normalize excludedFields to Ref
   * WHY: Options can accept Ref or array, normalize to Ref for consistent usage
   * PATTERN: Check if provided value is Ref, otherwise wrap in computed
   */
  const excludedFields = computed(() => {
    if (providedExcludedFields instanceof Array) {
      return providedExcludedFields
    }
    return providedExcludedFields.value || []
  })
  
  /**
   * LEARNING: Get all field keys from formFieldConfig
   * WHY: Base list of all fields available for categorization
   * PATTERN: Computed property that gets keys from admin config with error handling
   */
  const allFieldKeys = computed(() => {
    try {
      const formFieldConfig = adminConfig.getEntityFormFieldConfig(entityKey).value
      return Object.keys(formFieldConfig || {}) as GlobalFieldKey<typeof entityKey>[]
    } catch (error) {
      return []
    }
  })
  
  /**
   * LEARNING: Get form field config for a specific field
   * WHY: Used internally for type checking
   * PATTERN: Helper function that accesses admin config with error handling
   */
  const getFieldConfig = (fieldKey: string) => {
    try {
      return adminConfig.getFormFieldConfig(entityKey, fieldKey as GlobalFieldKey<typeof entityKey>).value
    } catch (error) {
      return undefined
    }
  }
  
  /**
   * LEARNING: Check if field is boolean type
   * WHY: Boolean fields should render in row 2 (composable, constituable, etc.)
   * PATTERN: Check primitiveInput.primitiveMode for Checkbox or Toggle
   */
  const isBooleanField = (fieldKey: string): boolean => {
    const config = getFieldConfig(fieldKey)
    if (!config?.primitiveInput) return false
    const primitiveMode = config.primitiveInput.primitiveMode
    return primitiveMode === PrimitiveModeEnum.Checkbox || primitiveMode === PrimitiveModeEnum.Toggle
  }
  
  /**
   * LEARNING: Check if field is number type
   * WHY: Number fields should render in row 3
   * PATTERN: Check primitiveInput.primitiveMode for Number or primitiveType for Number
   */
  const isNumberField = (fieldKey: string): boolean => {
    const config = getFieldConfig(fieldKey)
    if (!config?.primitiveInput) return false
    const primitiveMode = config.primitiveInput.primitiveMode
    const primitiveType = config.primitiveInput.primitiveType
    return primitiveMode === PrimitiveModeEnum.Number || primitiveType === PrimitiveTypeEnum.Number
  }
  
  /**
   * LEARNING: Check if field is relationship type
   * WHY: Relationship fields should render in expandable panels
   * PATTERN: Check for relationshipSelect or typeSelect config (excluding nested)
   */
  const isRelationshipField = (fieldKey: string): boolean => {
    const config = getFieldConfig(fieldKey)
    if (!config) return false
    // Check for relationshipSelect or typeSelect
    const hasSelectConfig = !!(config.relationshipSelect || config.typeSelect)
    if (!hasSelectConfig) return false
    // Exclude nested fields (they're handled differently)
    const selectMode = config.relationshipSelect?.selectMode || config.typeSelect?.selectMode
    return selectMode !== 'nested'
  }
  
  /**
   * LEARNING: Helper function to check if field should be excluded
   * WHY: Centralizes exclusion logic (name/active always excluded, plus additional excluded fields)
   * PATTERN: Check field key against exclusion list (case-insensitive)
   */
  const shouldExcludeField = (fieldKey: string): boolean => {
    const fieldKeyLower = String(fieldKey).toLowerCase()
    // Always exclude name/active (rendered separately)
    if (fieldKeyLower === 'name' || fieldKeyLower === 'active') return true
    // Exclude additional omitted fields (case-insensitive check)
    if (excludedFields.value.some(excluded => excluded.toLowerCase() === fieldKeyLower)) return true
    return false
  }
  
  /**
   * LEARNING: Boolean fields filtered and ready
   * WHY: Component needs boolean fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  const booleanFields = computed(() => {
    return allFieldKeys.value
      .filter(fieldKey => {
        const fieldKeyStr = String(fieldKey)
        // Exclude name/active and additional omitted fields
        if (shouldExcludeField(fieldKeyStr)) return false
        // Must be a boolean field
        if (!isBooleanField(fieldKeyStr)) return false
        return true
      })
      .filter(fieldKey => {
        // Filter by readiness if isFieldReady function provided
        if (isFieldReady) {
          return isFieldReady(String(fieldKey))
        }
        return true
      })
  })
  
  /**
   * LEARNING: Number fields filtered and ready
   * WHY: Component needs number fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  const numberFields = computed(() => {
    return allFieldKeys.value
      .filter(fieldKey => {
        const fieldKeyStr = String(fieldKey)
        // Exclude name/active and additional omitted fields
        if (shouldExcludeField(fieldKeyStr)) return false
        // Must be a number field
        if (!isNumberField(fieldKeyStr)) return false
        return true
      })
      .filter(fieldKey => {
        // Filter by readiness if isFieldReady function provided
        if (isFieldReady) {
          return isFieldReady(String(fieldKey))
        }
        return true
      })
  })
  
  /**
   * LEARNING: Relationship fields filtered and ready
   * WHY: Component needs relationship fields for rendering
   * PATTERN: Filter allFieldKeys by type, exclude name/active and excludedFields, filter by readiness
   */
  const relationshipFields = computed(() => {
    return allFieldKeys.value
      .filter(fieldKey => {
        const fieldKeyStr = String(fieldKey)
        // Exclude name/active and additional omitted fields
        if (shouldExcludeField(fieldKeyStr)) return false
        // Must be a relationship field
        if (!isRelationshipField(fieldKeyStr)) return false
        return true
      })
      .filter(fieldKey => {
        // Filter by readiness if isFieldReady function provided
        if (isFieldReady) {
          return isFieldReady(String(fieldKey))
        }
        return true
      })
  })
  
  return {
    allFieldKeys,
    getFieldConfig,
    isBooleanField,
    isNumberField,
    isRelationshipField,
    booleanFields,
    numberFields,
    relationshipFields
  }
}

