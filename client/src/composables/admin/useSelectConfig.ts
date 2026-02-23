/**
 * WHY: Select Config Composable

WHY: Components should be thin UI wrappers - c...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdmin } from '@/composables/admin/useAdmin'
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
   * WHY: /**
Whether this is an AnnotationAssignmentSelect field
LEARNING: Annota...
   */
  isAnnotationAssignmentSelect: ComputedRef<boolean>
  
  isAttendeeSelect: ComputedRef<boolean>
  
  isMultiple: ComputedRef<boolean>
  
  chipsProps: ComputedRef<Record<string, unknown>>
  
  optionEntityKey: ComputedRef<GlobalEntityKey>
  
  optionLabelKey: ComputedRef<string>
}

/**
 * NOTE: value can be null for fields like ternaryDefault where null means "fail gracefully"
 */
interface OptionsSelectConfig {
  options: Array<{ value: string | null; label: string }>
  selectMode?: RelationshipSelectModeEnum
}

/**
 * WHY: Select Config Composable

WHY: Moves business logic out of components in...
 */
export function useSelectConfig(
  options: UseSelectConfigOptions
): UseSelectConfigReturn {
  const { fieldContext } = options
  
  const admin = useAdmin()
  
  /**
   */
  const isMetadataLoaded = computed(() => admin.isMetadataLoaded.value)
  
  /**
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
   * PATTERN: Use useEntityMetadata composable to fetch metadata
   */
  const { fieldMetadata } = useEntityMetadata(
    fieldContext.entityKey,
    entity
  )
  
  /**
   */
  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldContext.fieldKey)]
  })

  /**
   */
  const isEnumSelect = computed(() => {
    return (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') && 
           String(fieldContext.fieldKey) === 'type'
  })

  /**
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
   * WHY: Annotations are now core entities, use standard relationship select pattern
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
   * WHY: /**
WHY: Most entities use 'name' as their display field - safe default ...
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

