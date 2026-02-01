/**
 * Field Metadata Helper
 * 
 * LEARNING: Provides on-demand field metadata lookup without attaching configs to entities
 * WHY: Simplifies the system by deriving field metadata directly from form configs when needed
 * PATTERN: Helper function that reads from adminConfig and returns minimal metadata
 * 
 * COMPARISON: React attaches display configs to entities. Vue uses on-demand lookup.
 */

import { useAdminConfig } from '@/composables/useAdminConfig'
import { RelationshipSelectModeEnum, PrimitiveModeEnum, PrimitiveTypeEnum } from '@/types/entity/formDataEnums'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldConfig } from '@/configs/field/display/fullFieldDisplayConfig'

/**
 * Display field keys that we extract from display configs
 * LEARNING: Single source of truth for which fields are extracted
 * WHY: Makes it clear what fields we're using and easier to maintain
 * PATTERN: Const array defines extractable fields
 */
const DISPLAY_FIELD_KEYS = ['label', 'placeholder', 'helpText', 'required', 'disabled', 'readOnly'] as const

const metadataCache = new Map<string, FieldMetadata>()

const createMetadataCacheKey = (entityKey: string, fieldKey: string): string => {
  return `${entityKey}:${fieldKey}`
}

/**
 * Clear the metadata cache
 * LEARNING: Useful for testing to reset cache state between tests
 * WHY: Cache persists across tests, causing stale data issues
 * PATTERN: Export clear function for testing purposes
 */
export function clearMetadataCache(): void {
  metadataCache.clear()
}

export type FieldMetadata = {
  label: string
  placeholder: string
  fieldType: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' | 'multiselect' | 'required' | 'nested' | 'hidden'
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  helpText?: string
}

export function getFieldMetadata<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  entityKey: GE,
  fieldKey: FieldKey,
  adminConfigInstance?: ReturnType<typeof useAdminConfig>
): FieldMetadata {
  const cacheKey = createMetadataCacheKey(String(entityKey), String(fieldKey))
  
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)!
  }
  
  const adminConfig = adminConfigInstance || useAdminConfig()
  
  const formFieldConfig = adminConfig.getFormFieldConfig(entityKey, fieldKey).value
  
  const displayFieldConfig = adminConfig.getDisplayFieldConfig(entityKey, fieldKey).value
  
  let fieldType: FieldMetadata['fieldType'] = 'text'
  
  if (formFieldConfig?.relationshipSelect || formFieldConfig?.typeSelect) {
    const selectConfig = formFieldConfig?.relationshipSelect || formFieldConfig?.typeSelect
    const selectMode = selectConfig?.selectMode
    
    // LEARNING: Switch statements provide TypeScript exhaustiveness checking and clearer enum handling
    switch (selectMode) {
      case RelationshipSelectModeEnum.Multiple:
        fieldType = 'multiselect'
        break
      
      case RelationshipSelectModeEnum.Nested:
        fieldType = 'nested'
        break
      
      case RelationshipSelectModeEnum.Required:
        fieldType = 'required'
        break
      
      case RelationshipSelectModeEnum.Single:
        fieldType = 'select'
        break
      
      case RelationshipSelectModeEnum.Hidden:
        fieldType = 'hidden'
        break
      
      default:
        fieldType = 'select'
        break
    }
  } 
  else if (formFieldConfig?.primitiveInput) {
    const primitiveConfig = formFieldConfig?.primitiveInput
    const primitiveMode = primitiveConfig?.primitiveMode
    const primitiveType = primitiveConfig?.primitiveType
    
    // LEARNING: Switch statements provide TypeScript exhaustiveness checking and clearer enum handling
    // PATTERN: Switch on enum with fall-through for consolidated mappings
    switch (primitiveMode) {
      case PrimitiveModeEnum.Input:
        if (primitiveType === PrimitiveTypeEnum.Date) {
          fieldType = 'date'
        } else if (primitiveType === PrimitiveTypeEnum.Number) {
          fieldType = 'number'
        } else {
          fieldType = 'text'
        }
        break
      
      case PrimitiveModeEnum.Number:
        fieldType = 'number'
        break
      
      case PrimitiveModeEnum.Checkbox:
      case PrimitiveModeEnum.Toggle:
        fieldType = 'boolean'
        break
      
      case PrimitiveModeEnum.TextArea:
      case PrimitiveModeEnum.MultilineText:
        fieldType = 'textarea'
        break
      
      case PrimitiveModeEnum.Hidden:
        fieldType = 'hidden'
        break
      
      case PrimitiveModeEnum.Select:
      case PrimitiveModeEnum.ModeToggle:
      case PrimitiveModeEnum.TextEditOnExpand:
        break
      
      default:
        if (primitiveType === PrimitiveTypeEnum.Date) {
          fieldType = 'date'
        }
        break
    }
  }
  
  // PATTERN: Check all possible wrapper types, extract from whichever exists
  type DisplayProps = {
    label?: string
    placeholder?: string
    helpText?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
  }

  const displayProps: DisplayProps = (() => {
    if (!displayFieldConfig) {
      return {}
    }

    const typedConfig = displayFieldConfig as DisplayFieldConfig<GE, FieldKey>
    const actualDisplayConfig: Record<string, unknown> = (
      typedConfig.primitiveDisplay ||
      typedConfig.relationshipDisplay ||
      typedConfig.typeDisplay ||
      (displayFieldConfig as Record<string, unknown>)
    ) as Record<string, unknown>

    // FIX: Use config-driven field extraction instead of hardcoded field checks
    const fieldExtractors: Record<string, (config: Record<string, unknown>) => unknown> = {
      helpText: (config) => config.helpText ?? config.tooltip,
      required: (config) => (config.meta as Record<string, unknown> | undefined)?.['required'] ?? config.required,
      disabled: (config) => (config.meta as Record<string, unknown> | undefined)?.['disabled'] ?? config.disabled,
      readOnly: (config) => (config.meta as Record<string, unknown> | undefined)?.['readOnly'] ?? config.readOnly,
      label: (config) => config.label,
      placeholder: (config) => config.placeholder,
    }

    return DISPLAY_FIELD_KEYS.reduce<DisplayProps>((acc, key) => {
      const extractor = fieldExtractors[key]
      if (!extractor) {
        return acc
      }

      const v = extractor(actualDisplayConfig)
      if (v == null) {
        return acc
      }

      if (key === 'helpText' || key === 'label' || key === 'placeholder') {
        if (typeof v === 'string') {
          acc[key] = v
        }
      } else if (key === 'required' || key === 'disabled' || key === 'readOnly') {
        if (typeof v === 'boolean') {
          acc[key] = v
        }
      }

      return acc
    }, {})
  })()
  
  const metadata: FieldMetadata = {
    label: displayProps.label || String(fieldKey),
    placeholder: displayProps.placeholder || `Enter ${String(fieldKey)}`,
    fieldType,
    required: displayProps.required ?? false,
    disabled: displayProps.disabled ?? false,
    readOnly: displayProps.readOnly ?? false,
    helpText: displayProps.helpText
  }
  
  metadataCache.set(cacheKey, metadata)
  
  return metadata
}

