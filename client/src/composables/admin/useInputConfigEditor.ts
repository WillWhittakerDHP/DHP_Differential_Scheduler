/**
 * LEARNING: Input config editor for metadata fields
 * WHY: Handles parsing and updating inputConfig for select/multiselect/reference fields
 * PATTERN: Composable for managing inputConfig editing in metadata editor
 * 
 * Used by:
 * - AdminPrimitiveMetadataEditor.vue
 */

import type { Ref } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface InputConfigFormData {
  targetMode: string | null
  selectMode: string | null
  targetKey: string | null
  candidateChildKey: string | null
  groupByKey: string | null
  placeholder: string | null
  options: unknown[] | null
}

export interface UseInputConfigEditorOptions {
  getEffectiveFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  updateFieldRendering: (fieldKey: string, updates: Partial<FieldMetadataEntry>) => void
}

export interface UseInputConfigEditorReturn {
  getInputConfigData: (fieldKey: string) => InputConfigFormData
  updateInputConfigField: (fieldKey: string, fieldName: keyof InputConfigFormData, value: unknown) => void
}

/**
 * LEARNING: Manage inputConfig editing for metadata fields
 * WHY: Provides form-friendly structure for editing inputConfig object
 * PATTERN: Parse inputConfig into form fields, update individual fields, reconstruct object
 */
export function useInputConfigEditor(
  options: UseInputConfigEditorOptions
): UseInputConfigEditorReturn {
  const { getEffectiveFieldMetadata, updateFieldRendering } = options

  /**
   * LEARNING: Parse inputConfig into form-friendly structure
   * WHY: Extract individual fields from inputConfig object for form editing
   * PATTERN: Read from inputConfig, provide defaults for missing fields
   */
  function getInputConfigData(fieldKey: string): InputConfigFormData {
    const meta = getEffectiveFieldMetadata(fieldKey)
    const inputConfig = meta?.inputConfig as Record<string, unknown> | null | undefined
    
    if (!inputConfig || typeof inputConfig !== 'object') {
      return {
        targetMode: null,
        selectMode: null,
        targetKey: null,
        candidateChildKey: null,
        groupByKey: null,
        placeholder: null,
        options: null,
      }
    }
    
    // LEARNING: Handle FormFieldConfig structure (new format)
    // WHY: inputConfig may be wrapped in relationshipSelect or typeSelect
    // PATTERN: Check for FormFieldConfig structure first, fall back to direct config
    let config = inputConfig
    if ('relationshipSelect' in inputConfig && inputConfig.relationshipSelect) {
      config = inputConfig.relationshipSelect as Record<string, unknown>
    } else if ('typeSelect' in inputConfig && inputConfig.typeSelect) {
      config = inputConfig.typeSelect as Record<string, unknown>
    }
    
    return {
      targetMode: (config.targetMode as string) || null,
      selectMode: (config.selectMode as string) || null,
      targetKey: (config.targetKey as string) || null,
      candidateChildKey: (config.candidateChildKey as string) || null,
      groupByKey: (config.groupByKey as string) || null,
      placeholder: (config.placeholder as string) || null,
      options: (inputConfig.options as unknown[]) || null, // Options array (for options-based selects)
    }
  }

  /**
   * LEARNING: Construct inputConfig object from form values
   * WHY: Build inputConfig object when form fields change
   * PATTERN: Construct object based on targetMode and field values
   */
  function buildInputConfig(fieldKey: string, formData: InputConfigFormData): Record<string, unknown> | null {
    // Handle options-based selects (like bookingMode)
    if (formData.options !== null) {
      return {
        options: formData.options
      }
    }
    
    // Handle empty/not configured
    if (!formData.targetMode || !formData.selectMode) {
      return null
    }
    
    const baseConfig: Record<string, unknown> = {
      targetMode: formData.targetMode,
      selectMode: formData.selectMode,
    }
    
    if (formData.targetMode === 'relationship') {
      if (formData.targetKey) {
        baseConfig.targetKey = formData.targetKey
      }
      if (formData.candidateChildKey) {
        baseConfig.candidateChildKey = formData.candidateChildKey
      }
      if (formData.groupByKey) {
        baseConfig.groupByKey = formData.groupByKey
      }
      if (formData.placeholder) {
        baseConfig.placeholder = formData.placeholder
      }
      
      // For partsCollection, ensure optionsFieldKey is set
      const renderAs = getEffectiveFieldMetadata(fieldKey)?.renderAs
      if (renderAs === 'partsCollection') {
        baseConfig.optionsFieldKey = 'validParts'
      }
    } else if (formData.targetMode === 'property') {
      if (formData.targetKey) {
        baseConfig.targetKey = formData.targetKey
      }
      if (formData.placeholder) {
        baseConfig.placeholder = formData.placeholder
      }
    }
    
    return baseConfig
  }

  /**
   * LEARNING: Update a specific field in inputConfig
   * WHY: Helper function to update individual inputConfig fields without replacing the entire object
   * PATTERN: Read current inputConfig, update specific field, reconstruct object
   */
  function updateInputConfigField(fieldKey: string, fieldName: keyof InputConfigFormData, value: unknown): void {
    const currentData = getInputConfigData(fieldKey)
    const updatedData = { ...currentData, [fieldName]: value }
    const newConfig = buildInputConfig(fieldKey, updatedData)
    updateFieldRendering(fieldKey, { inputConfig: newConfig })
  }

  return {
    getInputConfigData,
    updateInputConfigField,
  }
}
