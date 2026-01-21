/**
 * Select Config Composable
 * 
 * LEARNING: Extracts select configuration parsing logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - config parsing belongs in composables
 * PATTERN: Composable that provides select configuration and derived properties
 * 
 * This composable handles:
 * - Field metadata retrieval from /admin-input-metadata
 * - Select config extraction from metadata.inputConfig (relationshipSelect or typeSelect)
 * - Select mode determination (single, multiple, nested)
 * - Option entity key determination
 * - Option label key determination
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdmin } from '@/composables/useAdmin'
import { RelationshipSelectModeEnum, RelationshipSelectTypeEnum } from '@/types/entity/formDataEnums'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { FieldContextType } from '@/composables/useFieldContext'
import { useEntityMetadata } from './useEntityMetadata'

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
   * Select config (relationshipSelect or typeSelect) from metadata.inputConfig
   */
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  
  /**
   * Whether this is an enum select (blockShape.type or partShape.type)
   */
  isEnumSelect: ComputedRef<boolean>
  
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
  
  const admin = useAdmin()
  
  /**
   * LEARNING: Get entity for metadata fetch
   * WHY: useEntityMetadata needs entity to determine entityId
   * PATTERN: Get entity from admin store using entityKey and entityId
   */
  const entity = computed(() => {
    try {
      const entityValue = admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
      return entityValue ?? null
    } catch {
      return null
    }
  })
  
  /**
   * LEARNING: Fetch field metadata from /admin-input-metadata
   * WHY: Metadata is the source of truth for field configuration, including inputConfig
   * PATTERN: Use useEntityMetadata composable to fetch metadata
   */
  const { fieldMetadata } = useEntityMetadata(
    fieldContext.entityKey,
    entity
  )
  
  /**
   * LEARNING: Get field metadata entry for this field
   * WHY: Contains inputConfig with select behavior configuration
   * PATTERN: Read from metadata Record by fieldKey
   */
  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldContext.fieldKey)]
  })

  /**
   * LEARNING: Check if this is an enum select (blockShape.type or partShape.type field)
   * WHY: Enum selects use hardcoded options and don't need inputConfig
   * PATTERN: Special case for known enum fields
   */
  const isEnumSelect = computed(() => {
    return (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') && 
           String(fieldContext.fieldKey) === 'type'
  })

  /**
   * LEARNING: Extract select config from metadata.inputConfig - supports FormFieldConfig structure
   * WHY: inputConfig stores select behavior in FormFieldConfig format (relationshipSelect or typeSelect)
   *      or directly (backward compatibility with old format)
   * PATTERN: Check for FormFieldConfig structure first, fall back to direct config for backward compatibility
   */
  const selectConfig = computed((): RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey> | undefined => {
    const meta = fieldMetadataEntry.value
    
    // LEARNING: NO FALLBACKS - inputConfig is required for select fields
    // WHY: Select fields must have inputConfig configured in metadata
    // PATTERN: Fail explicitly when inputConfig is missing
    if (!meta) {
      throw new Error(
        `[useSelectConfig] Missing FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Field must be configured in /admin-input-metadata.`
      )
    }
    
    // LEARNING: Enum selects don't need inputConfig - they use hardcoded options
    // WHY: blockShape.type is an enum with fixed values, doesn't need relationship/type select config
    // PATTERN: Return undefined for enum selects, allowing SelectInputs to use hardcoded options
    if (isEnumSelect.value) {
      return undefined
    }
    
    if (!meta.inputConfig) {
      throw new Error(
        `[useSelectConfig] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields (renderAs: select/multiselect/reference) must have inputConfig configured.`
      )
    }
    
    // LEARNING: Check for FormFieldConfig structure (new format)
    // WHY: inputConfig should follow FormFieldConfig pattern with relationshipSelect or typeSelect properties
    // PATTERN: Check for new format first, fall back to old format for backward compatibility
    const inputConfig = meta.inputConfig as Record<string, unknown>
    
    // Check if inputConfig has FormFieldConfig structure (new format)
    if ('relationshipSelect' in inputConfig && inputConfig.relationshipSelect) {
      return inputConfig.relationshipSelect as RelationshipFieldType<typeof fieldContext.entityKey>
    }
    
    if ('typeSelect' in inputConfig && inputConfig.typeSelect) {
      return inputConfig.typeSelect as VirtualFieldType<typeof fieldContext.entityKey>
    }
    
    // LEARNING: Backward compatibility - handle old format (direct select config)
    // WHY: Existing data may have select config stored directly, not wrapped in FormFieldConfig structure
    // PATTERN: If new format properties don't exist, treat inputConfig as direct select config
    // Check if inputConfig has targetMode (indicates it's a direct select config)
    if ('targetMode' in inputConfig) {
      return inputConfig as RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey>
    }
    
    // If we get here, inputConfig exists but doesn't match expected format
    throw new Error(
      `[useSelectConfig] Invalid inputConfig format for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
      `Expected FormFieldConfig structure with relationshipSelect or typeSelect property, or direct select config with targetMode.`
    )
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
   * LEARNING: Determine if select is multiple from config - NO DEFAULTS (except enum selects)
   * WHY: Config determines selectMode (single, multiple, required)
   * PATTERN: Read selectMode from config, fail if missing (except enum selects)
   */
  const isMultiple = computed(() => {
    // LEARNING: Enum selects are always single-select
    // WHY: blockShape.type enum select doesn't use config, defaults to single
    // PATTERN: Return false for enum selects
    if (isEnumSelect.value) {
      return false
    }
    
    const config = selectConfig.value
    
    // LEARNING: NO DEFAULTS - selectMode must be explicitly configured
    // WHY: selectMode determines select behavior - missing is a configuration error
    // PATTERN: Fail explicitly when selectMode is missing
    if (!config || !config.selectMode) {
      throw new Error(
        `[useSelectConfig] Missing selectMode in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields must have selectMode configured in inputConfig.`
      )
    }
    
    // Check selectMode using enum values - Multiple means multi-select
    return config.selectMode === RelationshipSelectModeEnum.Multiple
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
   * LEARNING: Determine optionEntityKey from config - NO FALLBACKS (except enum selects)
   * WHY: Config determines which entity type to fetch options from
   * PATTERN: Read candidateChildKey or targetKey from config, fail if missing (except enum selects)
   */
  const optionEntityKey = computed(() => {
    // LEARNING: Enum selects don't use entity-based options
    // WHY: blockShape.type enum select uses hardcoded options, doesn't need entityKey
    // PATTERN: Return blockShape as default for enum selects (not actually used)
    if (isEnumSelect.value) {
      return 'blockShape' as GlobalEntityKey
    }
    
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - optionEntityKey must be explicitly configured
    // WHY: Select fields must specify which entity type to fetch options from
    // PATTERN: Fail explicitly when required config properties are missing
    if (!config) {
      throw new Error(
        `[useSelectConfig] Missing inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields must have inputConfig configured.`
      )
    }
    
    if (config.targetMode === 'property') {
      if (!config.targetKey) {
        throw new Error(
          `[useSelectConfig] Missing targetKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
          `Type select fields (targetMode: property) must have targetKey configured.`
        )
      }
      return config.targetKey
    }
    
    if (!config.candidateChildKey) {
      throw new Error(
        `[useSelectConfig] Missing candidateChildKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Relationship select fields (targetMode: relationship) must have candidateChildKey configured.`
      )
    }
    
    return config.candidateChildKey as GlobalEntityKey
  })

  /**
   * LEARNING: Determine optionLabelKey for entity name access - defaults to 'name' for all entity types
   * WHY: Most entities use 'name' as their display field - safe default that matches actual inputConfig structure
   * PATTERN: Default to 'name' for all selects, with special case for annotations ('text')
   * NOTE: inputConfig does not contain optionLabelKey - it's inferred from entity type
   */
  const optionLabelKey = computed(() => {
    // LEARNING: Enum selects don't use entity-based options, so labelKey doesn't matter
    // WHY: blockShape.type enum select uses hardcoded options with 'title' and 'value' properties
    // PATTERN: Return 'name' as default for enum selects (not actually used)
    if (isEnumSelect.value) {
      return 'name'
    }
    
    const config = selectConfig.value
    
    // LEARNING: Special case for annotations - they use 'text' field
    // WHY: Annotation entity has 'text' field, not 'name' field
    // PATTERN: Hardcoded exception for this known case
    if (isDescriptionSelect.value) {
      return 'text'
    }
    
    // LEARNING: Validate config exists (should already be validated by selectConfig computed)
    // WHY: Ensure we have a valid config before accessing properties
    // PATTERN: Fail explicitly if config is missing
    if (!config) {
      throw new Error(
        `[useSelectConfig] Missing inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields must have inputConfig configured.`
      )
    }
    
    // LEARNING: Default to 'name' for all entity types (relationship and type selects)
    // WHY: Most entities (blockShape, partShape, blockInstance, partInstance) use 'name' as their display field
    // PATTERN: Provide sensible default that matches actual entity structure
    // NOTE: inputConfig does not contain optionLabelKey - it's inferred from the entity type being selected
    return 'name'
  })

  return {
    selectConfig,
    isEnumSelect,
    isDescriptionSelect,
    isMultiple,
    chipsProps,
    optionEntityKey,
    optionLabelKey
  }
}

