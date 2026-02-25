
import type { BuildMetadataEntryOptions } from '@/types/admin/buildMetadataEntry'

export type { BuildMetadataEntryOptions } from '@/types/admin/buildMetadataEntry'

/**
PATTERN: ...
 */
export function buildMetadataEntry(options: BuildMetadataEntryOptions): Record<string, unknown> {
  const { renderingUpdates, existingMetadata } = options

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
