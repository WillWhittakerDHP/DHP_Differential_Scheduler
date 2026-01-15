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
      return admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
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
   * LEARNING: Extract select config from metadata.inputConfig - NO FALLBACKS
   * WHY: inputConfig stores select behavior (relationshipSelect or typeSelect) for select/multiselect/reference fields
   * PATTERN: Read inputConfig from metadata entry, fail explicitly if missing
   */
  const selectConfig = computed((): RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey> => {
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
    
    if (!meta.inputConfig) {
      throw new Error(
        `[useSelectConfig] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields (renderAs: select/multiselect/reference) must have inputConfig configured.`
      )
    }
    
    // LEARNING: inputConfig should match RelationshipFieldType or VirtualFieldType structure
    // WHY: Backend stores select config as JSONB matching the frontend type structure
    // PATTERN: Cast inputConfig to select config type (backend validates structure)
    return meta.inputConfig as RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey>
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
   * LEARNING: Determine if select is multiple from config - NO DEFAULTS
   * WHY: Config determines selectMode (single, multiple, required, nested)
   * PATTERN: Read selectMode from config, fail if missing
   */
  const isMultiple = computed(() => {
    const config = selectConfig.value
    
    // LEARNING: NO DEFAULTS - selectMode must be explicitly configured
    // WHY: selectMode determines select behavior - missing is a configuration error
    // PATTERN: Fail explicitly when selectMode is missing
    if (!config.selectMode) {
      throw new Error(
        `[useSelectConfig] Missing selectMode in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields must have selectMode configured in inputConfig.`
      )
    }
    
    // Check selectMode using enum values - Multiple or Nested means multi-select
    return config.selectMode === RelationshipSelectModeEnum.Multiple || config.selectMode === RelationshipSelectModeEnum.Nested
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
   * LEARNING: Determine optionEntityKey from config - NO FALLBACKS
   * WHY: Config determines which entity type to fetch options from
   * PATTERN: Read candidateChildKey or targetKey from config, fail if missing
   */
  const optionEntityKey = computed(() => {
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - optionEntityKey must be explicitly configured
    // WHY: Select fields must specify which entity type to fetch options from
    // PATTERN: Fail explicitly when required config properties are missing
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
   * LEARNING: Determine optionLabelKey for entity name access - NO DEFAULTS
   * WHY: Label key should be explicitly configured in inputConfig
   * PATTERN: Read from config, fail if missing (except special case for annotations)
   */
  const optionLabelKey = computed(() => {
    const config = selectConfig.value
    
    // LEARNING: Special case for annotations - they use 'text' field
    // WHY: Annotation entity has 'text' field, not 'name' field
    // PATTERN: Hardcoded exception for this known case
    if (isDescriptionSelect.value) {
      return 'text'
    }
    
    // LEARNING: NO DEFAULTS - optionLabelKey should be configured in inputConfig
    // WHY: Different entity types might use different label fields
    // PATTERN: Read from config, fail if missing
    if ('optionLabelKey' in config && config.optionLabelKey) {
      return config.optionLabelKey as string
    }
    
    // LEARNING: For now, fail if not configured (no default to 'name')
    // WHY: Ensures explicit configuration - prevents silent fallbacks
    throw new Error(
      `[useSelectConfig] Missing optionLabelKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
      `Select fields must have optionLabelKey configured (e.g., 'name' or 'text').`
    )
  })

  return {
    selectConfig,
    isDescriptionSelect,
    isMultiple,
    chipsProps,
    optionEntityKey,
    optionLabelKey
  }
}

