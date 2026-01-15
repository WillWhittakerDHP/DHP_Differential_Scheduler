/**
 * Field Metadata Helper
 * 
 * LEARNING: Provides on-demand field metadata lookup without attaching configs to entities
 * WHY: Simplifies the system by deriving field metadata directly from form configs when needed
 * PATTERN: Helper function that reads from adminConfig and returns minimal metadata
 * 
 * COMPARISON: React attaches display configs to entities. Vue uses on-demand lookup.
 */

import { useAdminConfig } from './useAdminConfig'
import { RelationshipSelectModeEnum, PrimitiveModeEnum, PrimitiveTypeEnum } from '../types/entity/formDataEnums'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldConfig } from '../configs/field/display/fullFieldDisplayConfig'

/**
 * Display field keys that we extract from display configs
 * LEARNING: Single source of truth for which fields are extracted
 * WHY: Makes it clear what fields we're using and easier to maintain
 * PATTERN: Const array defines extractable fields
 */
const DISPLAY_FIELD_KEYS = ['label', 'placeholder', 'helpText', 'required', 'disabled', 'readOnly'] as const

// LEARNING: Cache field metadata results to avoid recomputing for the same entityKey/fieldKey
// WHY: Metadata is derived from configs which don't change, so we can safely cache results
// PATTERN: Use Map to cache metadata by entityKey:fieldKey combination
const metadataCache = new Map<string, FieldMetadata>()

// Helper to create cache key
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

/**
 * Field metadata type - minimal properties actually used by components
 */
export type FieldMetadata = {
  label: string
  placeholder: string
  fieldType: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' | 'multiselect' | 'required' | 'nested' | 'hidden'
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  helpText?: string
}

/**
 * Get field metadata for a specific field
 * 
 * LEARNING: Derives field metadata from formFieldConfig and displayFieldConfig
 * WHY: Provides on-demand metadata lookup without attaching configs to entities
 * PATTERN: Read configs → derive fieldType → extract display properties → return metadata
 * 
 * @param entityKey - Entity type key
 * @param fieldKey - Field key
 * @param adminConfigInstance - Optional admin config instance (if called from template, pass pre-initialized instance)
 * @returns FieldMetadata with label, placeholder, fieldType, and other properties
 */
export function getFieldMetadata<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  entityKey: GE,
  fieldKey: FieldKey,
  adminConfigInstance?: ReturnType<typeof useAdminConfig>
): FieldMetadata {
  const cacheKey = createMetadataCacheKey(String(entityKey), String(fieldKey))
  
  // Return cached metadata if it exists
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)!
  }
  
  // Use provided instance or call composable (only safe during setup)
  const adminConfig = adminConfigInstance || useAdminConfig()
  
  // Get form field config to determine field type
  const formFieldConfig = adminConfig.getFormFieldConfig(entityKey, fieldKey).value
  
  // Get display field config for labels, placeholders, etc.
  const displayFieldConfig = adminConfig.getDisplayFieldConfig(entityKey, fieldKey).value
  
  // Derive fieldType from config
  let fieldType: FieldMetadata['fieldType'] = 'text'
  
  // Check if this is a relationship/type select field
  if (formFieldConfig?.relationshipSelect || formFieldConfig?.typeSelect) {
    const selectConfig = formFieldConfig?.relationshipSelect || formFieldConfig?.typeSelect
    const selectMode = selectConfig?.selectMode
    
    // Map RelationshipSelectModeEnum to fieldType using switch statement for exhaustiveness checking
    // LEARNING: Switch statements provide TypeScript exhaustiveness checking and clearer enum handling
    // WHY: Safer than if-else chains - TypeScript can warn if we miss an enum value
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
        // LEARNING: Single mode maps to standard 'select' field type
        fieldType = 'select'
        break
      
      case RelationshipSelectModeEnum.Hidden:
        // LEARNING: Hidden mode maps to 'hidden' field type (not rendered)
        // WHY: Hidden fields should not be displayed in forms
        fieldType = 'hidden'
        break
      
      default:
        // LEARNING: Default case ensures exhaustiveness - TypeScript will warn if we miss an enum value
        // WHY: Safer than if-else chains which don't provide exhaustiveness checking
        // Fallback to 'select' if selectMode is undefined or unknown
        fieldType = 'select'
        break
    }
  } 
  // Check if this is a primitive field
  else if (formFieldConfig?.primitiveInput) {
    const primitiveConfig = formFieldConfig?.primitiveInput
    const primitiveMode = primitiveConfig?.primitiveMode
    const primitiveType = primitiveConfig?.primitiveType
    
    // Map PrimitiveModeEnum to fieldType using switch statement for exhaustiveness checking
    // LEARNING: Switch statements provide TypeScript exhaustiveness checking and clearer enum handling
    // WHY: Safer than if-else chains - TypeScript can warn if we miss an enum value
    // PATTERN: Switch on enum with fall-through for consolidated mappings
    switch (primitiveMode) {
      case PrimitiveModeEnum.Input:
        // Input mode: determine type from PrimitiveTypeEnum
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
        // LEARNING: Fall-through handles multiple enum values mapping to same result
        // WHY: Cleaner than multiple conditions in if-else
        fieldType = 'boolean'
        break
      
      case PrimitiveModeEnum.TextArea:
      case PrimitiveModeEnum.MultilineText:
        // LEARNING: Both TextArea and MultilineText map to textarea component
        // WHY: Consolidate redundant mappings - both represent multi-line text input
        fieldType = 'textarea'
        break
      
      case PrimitiveModeEnum.Hidden:
        // LEARNING: Hidden mode maps to 'hidden' field type (not rendered)
        // WHY: Hidden fields should not be displayed in forms
        fieldType = 'hidden'
        break
      
      case PrimitiveModeEnum.Select:
      case PrimitiveModeEnum.ModeToggle:
      case PrimitiveModeEnum.TextEditOnExpand:
        // These modes don't map to input components - default remains 'text'
        break
      
      default:
        // LEARNING: Default case ensures exhaustiveness - TypeScript will warn if we miss an enum value
        // WHY: Safer than if-else chains which don't provide exhaustiveness checking
        // Check if primitiveType alone indicates date (fallback)
        if (primitiveType === PrimitiveTypeEnum.Date) {
          fieldType = 'date'
        }
        // Default remains 'text'
        break
    }
  }
  
  // Extract display properties from nested display config structure
  // Handle primitiveDisplay, relationshipDisplay, typeDisplay wrappers
  // LEARNING: Extract properties systematically using DISPLAY_FIELD_KEYS
  // WHY: Single source of truth for which properties we extract, easier to maintain
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

    // Extract from nested structure - check which wrapper exists
    const typedConfig = displayFieldConfig as DisplayFieldConfig<GE, FieldKey>
    const actualDisplayConfig: Record<string, unknown> = (
      typedConfig.primitiveDisplay ||
      typedConfig.relationshipDisplay ||
      typedConfig.typeDisplay ||
      (displayFieldConfig as Record<string, unknown>)
    ) as Record<string, unknown>

    // FIX: Use config-driven field extraction instead of hardcoded field checks
    // LEARNING: Field extraction config maps field keys to their extraction logic
    // WHY: Eliminates hardcoded field === checks, makes extraction extensible
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

      // Type-specific extraction based on field type
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
  
  // Return metadata with defaults
  const metadata: FieldMetadata = {
    label: displayProps.label || String(fieldKey),
    placeholder: displayProps.placeholder || `Enter ${String(fieldKey)}`,
    fieldType,
    required: displayProps.required ?? false,
    disabled: displayProps.disabled ?? false,
    readOnly: displayProps.readOnly ?? false,
    helpText: displayProps.helpText
  }
  
  // Cache metadata for future use
  metadataCache.set(cacheKey, metadata)
  
  return metadata
}

