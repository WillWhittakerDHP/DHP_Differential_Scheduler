/**
 * LEARNING: Metadata field update logic with validation
 * WHY: Encapsulates field rendering update logic with renderAs computation and validation
 * PATTERN: Composable for updating field metadata with automatic renderAs computation
 * 
 * Used by:
 * - AdminPrimitiveMetadataEditor.vue
 */

import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface UseMetadataFieldUpdatesOptions {
  getEffectiveFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  hasOverride: (fieldKey: string) => boolean
  toggleOverride: (fieldKey: string, enabled: boolean) => void
  mode: 'global' | 'instanceOverride'
  pendingChanges: Record<string, Partial<FieldMetadataEntry>>
}

export interface UseMetadataFieldUpdatesReturn {
  computeRenderAs: (
    dataType: string | undefined,
    inputConfig: Record<string, unknown> | null | undefined,
    fieldKey: string
  ) => FieldMetadataEntry['renderAs']
  updateFieldRendering: (fieldKey: string, updates: Partial<FieldMetadataEntry>) => void
}

/**
 * LEARNING: Manage field metadata updates with validation
 * WHY: Handles field rendering updates with automatic renderAs computation and validation
 * PATTERN: Update function that computes renderAs and validates panel/layout based on visibility
 */
export function useMetadataFieldUpdates(
  options: UseMetadataFieldUpdatesOptions
): UseMetadataFieldUpdatesReturn {
  const { getEffectiveFieldMetadata, hasOverride, toggleOverride, mode, pendingChanges } = options

  /**
   * LEARNING: Auto-compute renderAs based on dataType and inputConfig
   * WHY: renderAs should be automatically determined, not manually configured
   * PATTERN: Compute renderAs from field characteristics
   */
  function computeRenderAs(
    dataType: string | undefined,
    inputConfig: Record<string, unknown> | null | undefined,
    fieldKey: string
  ): FieldMetadataEntry['renderAs'] {
    // Special cases first
    if (fieldKey === 'icon') {
      return 'iconSelect'
    }
    
    // If inputConfig exists, determine select type from config
    if (inputConfig) {
      const selectType = inputConfig.selectType as string | undefined
      if (selectType === 'partsCollectionSelect') {
        return 'partsCollection'
      }
      const selectMode = inputConfig.selectMode as string | undefined
      if (selectMode === 'multiple') {
        return 'multiselect'
      }
      // Default to reference for relationship selects
      if (inputConfig.targetMode === 'relationship') {
        return 'reference'
      }
      // Default to select for other selects
      return 'select'
    }
    
    // Base renderAs on dataType
    if (dataType === 'boolean') {
      return 'statusButton'
    }
    if (dataType === 'number') {
      return 'number'
    }
    if (dataType === 'array') {
      return 'reference'
    }
    
    // Default to text for string and other types
    return 'text'
  }

  /**
   * LEARNING: Update field rendering configuration
   * WHY: Handles field updates with automatic renderAs computation and validation
   * PATTERN: Enable override if needed, compute renderAs, validate panel/layout, update pending changes
   */
  function updateFieldRendering(fieldKey: string, updates: Partial<FieldMetadataEntry>): void {
    if (mode === 'instanceOverride' && !hasOverride(fieldKey)) {
      // Enable override first
      toggleOverride(fieldKey, true)
    }
    
    // LEARNING: Auto-compute renderAs when dataType or inputConfig changes
    // WHY: renderAs should always be computed, not manually set
    // PATTERN: Compute renderAs if dataType or inputConfig is being updated
    const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
    const newDataType = updates.dataType ?? effectiveMeta?.dataType
    const newInputConfig = updates.inputConfig !== undefined ? updates.inputConfig : effectiveMeta?.inputConfig
    
    // Auto-compute renderAs if dataType or inputConfig changed
    if (updates.dataType !== undefined || updates.inputConfig !== undefined) {
      updates.renderAs = computeRenderAs(newDataType, newInputConfig, fieldKey)
    }
    
    // LEARNING: Validate panel based on visibility
    // WHY: Panel must be 'none' for titleRow and expandedDirect, required for expandedPanel
    // PATTERN: Normalize panel value when visibility changes
    if (updates.visibility !== undefined) {
      const newVisibility = updates.visibility
      if (newVisibility === 'titleRow' || newVisibility === 'expandedDirect' || newVisibility === 'staticAsTitle') {
        // Panel must be 'none' for these visibility types
        updates.panel = 'none'
      } else if (newVisibility === 'expandedPanel') {
        // Panel must be set for expandedPanel (default to 'parts' if not set)
        const currentPanel = updates.panel ?? effectiveMeta?.panel
        if (!currentPanel || currentPanel === 'none') {
          updates.panel = 'parts'
        }
      }
    }
    
    pendingChanges[fieldKey] = { ...pendingChanges[fieldKey], ...updates }
  }

  return {
    computeRenderAs,
    updateFieldRendering,
  }
}
