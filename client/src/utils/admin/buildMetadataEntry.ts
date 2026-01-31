/**
 * LEARNING: Shared utility for building metadata entries
 * WHY: Eliminates duplication between primitive and relationship metadata mutations
 * PATTERN: Generic function that handles both fieldKey and relationshipKey cases
 */

import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Options for building a metadata entry
 */
export interface BuildMetadataEntryOptions {
  /**
   * Field key (for primitive metadata) or relationship key (for relationship metadata)
   */
  key: string
  /**
   * Rendering updates to apply
   */
  renderingUpdates: Partial<FieldMetadataEntry>
  /**
   * Existing metadata to merge with
   */
  existingMetadata: FieldMetadataEntry
  /**
   * Whether this is for relationship metadata (affects inputConfig wrapping)
   */
  isRelationship?: boolean
}

/**
 * Build a full metadata entry from updates and existing metadata
 * LEARNING: Merges rendering updates with existing canonical fields
 * WHY: Ensures canonical fields are preserved while allowing rendering updates
 * PATTERN: Use existing values as fallback, no defaults
 * NOTE: Returns Record<string, unknown> to allow dynamic key (fieldKey or relationshipKey)
 */
export function buildMetadataEntry(options: BuildMetadataEntryOptions): Record<string, unknown> {
  const { renderingUpdates, existingMetadata, isRelationship = false } = options

  // Use existing canonical fields
  const canonicalFields = {
    dataType: existingMetadata.dataType,
    label: existingMetadata.label,
    isRequired: existingMetadata.isRequired,
  }

  // LEARNING: inputConfig is stored in direct format (not wrapped)
  // WHY: Database stores inputConfig directly, not wrapped in relationshipSelect/typeSelect
  // PATTERN: Return inputConfig as-is, no wrapping needed
  const getInputConfig = (): Record<string, unknown> | null => {
    return renderingUpdates.inputConfig !== undefined 
      ? renderingUpdates.inputConfig 
      : existingMetadata.inputConfig ?? null
  }

  // LEARNING: Normalize panel based on visibility
  // WHY: Panel must be 'none' for titleRow/expandedDirect/staticAsTitle, required for expandedPanel
  // PATTERN: Validate panel value based on visibility to ensure data integrity
  const visibility = renderingUpdates.visibility ?? existingMetadata.visibility
  let panel = renderingUpdates.panel ?? existingMetadata.panel
  
  if (visibility === 'titleRow' || visibility === 'expandedDirect' || visibility === 'staticAsTitle') {
    // Panel must be 'none' for these visibility types
    panel = 'none'
  } else if (visibility === 'expandedPanel') {
    // Panel must be set for expandedPanel (default to 'parts' if not set)
    if (!panel || panel === 'none') {
      panel = 'parts'
    }
  }

  const entry: Record<string, unknown> = {
    // Note: fieldKey/relationshipKey is added by the mutation, not here
    // Canonical fields (from existing metadata)
    dataType: canonicalFields.dataType,
    label: canonicalFields.label,
    isRequired: canonicalFields.isRequired,
    // Rendering fields: use updates if provided, otherwise existing values - NO DEFAULTS
    visibility,
    layout: renderingUpdates.layout ?? existingMetadata.layout,
    displayOrder: renderingUpdates.displayOrder ?? existingMetadata.displayOrder,
    renderAs: renderingUpdates.renderAs ?? existingMetadata.renderAs,
    statusButtonColor: renderingUpdates.statusButtonColor ?? existingMetadata.statusButtonColor,
    panel,
    bulkEdit: renderingUpdates.bulkEdit ?? existingMetadata.bulkEdit,
    inputConfig: getInputConfig(),
  }
  
  return entry
}
