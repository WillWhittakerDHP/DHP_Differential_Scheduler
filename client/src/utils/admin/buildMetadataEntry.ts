/**
 * LEARNING: Shared utility for building metadata entries
 * WHY: Eliminates duplication between primitive and relationship metadata mutations
 * PATTERN: Generic function that handles both fieldKey and relationshipKey cases
 */

import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface BuildMetadataEntryOptions {
  key: string
  renderingUpdates: Partial<FieldMetadataEntry>
  existingMetadata: FieldMetadataEntry
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

  const canonicalFields = {
    dataType: existingMetadata.dataType,
    label: existingMetadata.label,
    isRequired: existingMetadata.isRequired,
  }

  // LEARNING: inputConfig is stored in direct format (not wrapped)
  // PATTERN: Return inputConfig as-is, no wrapping needed
  const getInputConfig = (): Record<string, unknown> | null => {
    return renderingUpdates.inputConfig !== undefined 
      ? renderingUpdates.inputConfig 
      : existingMetadata.inputConfig ?? null
  }

  // PATTERN: Validate panel value based on visibility to ensure data integrity
  const visibility = renderingUpdates.visibility ?? existingMetadata.visibility
  let panel = renderingUpdates.panel ?? existingMetadata.panel
  
  if (visibility === 'titleRow' || visibility === 'expandedDirect' || visibility === 'staticAsTitle') {
    panel = 'none'
  } else if (visibility === 'expandedPanel') {
    if (!panel || panel === 'none') {
      panel = 'parts'
    }
  }

  const entry: Record<string, unknown> = {
    dataType: canonicalFields.dataType,
    label: canonicalFields.label,
    isRequired: canonicalFields.isRequired,
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
