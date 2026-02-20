/**
 * Select Config Composable
 * 
 * LEARNING: Extracts select configuration parsing logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - config parsing belongs in composables
 * PATTERN: Composable that provides select configuration and derived properties
 * 
 * This composable handles:
 * - Field metadata retrieval from /admin-input-metadata
 * - Select config extraction from metadata.inputConfig (direct format)
 * - Select mode determination (single, multiple, nested)
 * - Option entity key determination
 * - Option label key determination
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdmin } from '@/composables/useAdmin'
import { RelationshipSelectModeEnum, RelationshipSelectTypeEnum } from '@/types/entity/formDataEnums'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { SelectOption } from '@/composables/useSelectOptions'
import { useEntityMetadata } from './useEntityMetadata'
import {
  unwrapInputConfig,
  getSelectConfigFromUnwrapped,
  resolveSelectMultiple,
  resolveOptionEntityKey,
} from '@/utils/admin/selectTypeResolver'

const logger = createLogger('useSelectConfig')

export interface UseSelectConfigOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

export interface UseSelectConfigReturn {
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  
  isEnumSelect: ComputedRef<boolean>

  isOptionsSelect: ComputedRef<boolean>

  optionsSelectOptions: ComputedRef<SelectOption[]>
  
  /**
   * Whether this is an AnnotationAssignmentSelect field
   * LEARNING: Annotations are now core entities, use standard relationship select pattern
   */
  isAnnotationAssignmentSelect: ComputedRef<boolean>
  
  isAttendeeSelect: ComputedRef<boolean>
  
  isMultiple: ComputedRef<boolean>
  
  chipsProps: ComputedRef<Record<string, unknown>>
  
  optionEntityKey: ComputedRef<GlobalEntityKey>
  
  optionLabelKey: ComputedRef<string>
}

/**
 * LEARNING: Options select config for metadata-driven enum-like selects
 * WHY: Some fields (e.g., bookingMode, ternaryDefault) use input_config.options instead of relationship/type configs
 * PATTERN: Read options array from metadata.inputConfig when present
 * NOTE: value can be null for fields like ternaryDefault where null means "fail gracefully"
 */
interface OptionsSelectConfig {
  options: Array<{ value: string | null; label: string }>
  selectMode?: RelationshipSelectModeEnum
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
   * LEARNING: Check if metadata is loaded before accessing it
   * WHY: Prevents errors when metadata cache hasn't loaded yet
   * PATTERN: Check isMetadataLoaded before throwing errors
   */
  const isMetadataLoaded = computed(() => admin.isMetadataLoaded.value)
  
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
   * LEARNING: Detect metadata-driven options select configs
   * WHY: bookingMode uses input_config.options instead of relationship/type select config
   * PATTERN: Validate input_config.options structure when present
   */
  const optionsSelectConfig = computed<OptionsSelectConfig | undefined>(() => {
    const meta = fieldMetadataEntry.value
    if (!meta || !meta.inputConfig || typeof meta.inputConfig !== 'object') {
      return undefined
    }
    
    const inputConfig = meta.inputConfig as Record<string, unknown>
    const rawOptions = inputConfig.options
    
    if (!Array.isArray(rawOptions)) {
      return undefined
    }
    
    const normalizedOptions = rawOptions
      .filter((option): option is Record<string, unknown> => typeof option === 'object' && option !== null)
      .map((option) => ({
        value: option.value === null ? null : String(asEmptyString(option.value as string | null | undefined)),
        label: String(asEmptyString(option.label as string | null | undefined))
      }))
    
    const hasInvalidOption = normalizedOptions.some(
      (option) => (option.value !== null && option.value.length === 0) || option.label.length === 0
    )
    
    if (hasInvalidOption) {
      throw new Error(
        `[useSelectConfig] Invalid options format for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Each option must include non-empty "label" property and "value" must be non-empty string or null.`
      )
    }
    
    return {
      options: normalizedOptions,
      selectMode: inputConfig.selectMode as RelationshipSelectModeEnum | undefined
    }
  })

  const isOptionsSelect = computed(() => {
    return Boolean(optionsSelectConfig.value)
  })

  const optionsSelectOptions = computed<SelectOption[]>(() => {
    const config = optionsSelectConfig.value
    if (!config) {
      return []
    }
    
    return config.options.map((option) => ({
      title: option.label,
      // LEARNING: Convert null to '__NULL__' sentinel for ternaryDefault field
      // PATTERN: Use '__NULL__' as sentinel, convert back to null when saving
      value: option.value === null ? '__NULL__' : option.value
    }))
  })

  /**
   * LEARNING: Extract select config from metadata.inputConfig (direct format)
   * WHY: inputConfig stores select behavior directly, not wrapped
   * PATTERN: Use inputConfig directly, check targetMode to determine type
   */
  const selectConfig = computed((): RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey> | undefined => {
    // PATTERN: Gracefully handle loading state instead of throwing
    if (!isMetadataLoaded.value) {
      return undefined
    }
    
    const meta = fieldMetadataEntry.value
    
    // PATTERN: Return undefined instead of throwing - components can check if selectConfig exists
    if (!meta) {
      return undefined
    }
    
    // PATTERN: Return undefined for enum selects, allowing SelectInputs to use hardcoded options
    if (isEnumSelect.value) {
      return undefined
    }

    // PATTERN: Return undefined and let SelectInputs use optionsSelectOptions
    if (isOptionsSelect.value) {
      return undefined
    }
    
    if (!meta.inputConfig) {
      throw new Error(
        `[useSelectConfig] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Select fields (renderAs: select/multiselect/reference) must have inputConfig configured.`
      )
    }
    
    let inputConfig = meta.inputConfig as Record<string, unknown>
    if (!('targetMode' in inputConfig) && 'relationshipSelect' in inputConfig) {
      const wrapped = inputConfig.relationshipSelect
      if (typeof wrapped === 'object' && wrapped !== null && 'targetMode' in wrapped) {
        logger.warn(
          `Wrapped inputConfig detected (stale relationshipSelect format) for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
            `inputConfig is wrapped in "relationshipSelect" key — fix in admin_metadata.`,
          {
            entityKey: fieldContext.entityKey,
            fieldKey: fieldContext.fieldKey,
            wrappedKeys: Object.keys(inputConfig),
          }
        )
      }
    }
    inputConfig = unwrapInputConfig(
      inputConfig,
      String(fieldContext.entityKey),
      String(fieldContext.fieldKey)
    )
    return getSelectConfigFromUnwrapped(
      inputConfig,
      String(fieldContext.entityKey),
      String(fieldContext.fieldKey)
    ) as RelationshipFieldType<typeof fieldContext.entityKey> | VirtualFieldType<typeof fieldContext.entityKey>
  })

  /**
   * LEARNING: Check if this is an AnnotationAssignmentSelect field
   * WHY: Annotations are now core entities, use standard relationship select pattern
   * PATTERN: Check selectType from metadata inputConfig
   */
  const isAnnotationAssignmentSelect = computed(() => {
    const meta = fieldMetadataEntry.value
    if (!meta || !meta.inputConfig || typeof meta.inputConfig !== 'object') {
      return false
    }
    
    const inputConfig = meta.inputConfig as Record<string, unknown>
    return inputConfig.selectType === RelationshipSelectTypeEnum.AnnotationAssignmentSelect
  })

  /**
   * LEARNING: Check if this is an AttendeeSelect field
   * WHY: Attendee selects need special quick-select UI for major/minor attendees
   * PATTERN: Check selectType from metadata inputConfig
   */
  const isAttendeeSelect = computed(() => {
    const meta = fieldMetadataEntry.value
    if (!meta || !meta.inputConfig || typeof meta.inputConfig !== 'object') {
      return false
    }
    
    const inputConfig = meta.inputConfig as Record<string, unknown>
    return inputConfig.selectType === RelationshipSelectTypeEnum.AttendeeSelect || 
           inputConfig.selectType === 'attendeeSelect'
  })

  /**
   * LEARNING: Determine if select is multiple from config - NO DEFAULTS (except enum selects)
   * WHY: Config determines selectMode (single, multiple, required)
   * PATTERN: Read selectMode from config, fail if missing (except enum selects)
   */
  const isMultiple = computed(() =>
    resolveSelectMultiple(
      isEnumSelect.value,
      optionsSelectConfig.value,
      selectConfig.value,
      String(fieldContext.entityKey),
      String(fieldContext.fieldKey)
    )
  )

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
  const optionEntityKey = computed(() =>
    resolveOptionEntityKey(
      isEnumSelect.value,
      isOptionsSelect.value,
      selectConfig.value,
      String(fieldContext.entityKey),
      String(fieldContext.fieldKey)
    )
  )

  /**
   * LEARNING: Determine optionLabelKey for entity name access - defaults to 'name' for all entity types
   * WHY: Most entities use 'name' as their display field - safe default that matches actual inputConfig structure
   * PATTERN: Default to 'name' for all selects, with special case for annotations ('text')
   * NOTE: inputConfig does not contain optionLabelKey - it's inferred from entity type
   */
  const optionLabelKey = computed(() => {
    // PATTERN: Return 'name' as default for enum selects (not actually used)
    if (isEnumSelect.value) {
      return 'name'
    }

    // PATTERN: Return 'name' as a harmless default (not used)
    if (isOptionsSelect.value) {
      return 'name'
    }
    
    const config = selectConfig.value
    
    // PATTERN: Return 'name' as safe default when config is undefined
    if (!config) {
      return 'name'
    }
    
    // PATTERN: Use 'name' field for annotation instances (transformer maps API 'text' to entity 'name')
    if (isAnnotationAssignmentSelect.value) {
      return 'name' // AnnotationInstance.name contains the text content
    }
    
    // WHY: Most entities (blockShape, partShape, blockInstance, partInstance) use 'name' as their display field
    // PATTERN: Provide sensible default that matches actual entity structure
    return 'name'
  })

  return {
    selectConfig,
    isEnumSelect,
    isOptionsSelect,
    optionsSelectOptions,
    isAnnotationAssignmentSelect,
    isAttendeeSelect,
    isMultiple,
    chipsProps,
    optionEntityKey,
    optionLabelKey
  }
}

