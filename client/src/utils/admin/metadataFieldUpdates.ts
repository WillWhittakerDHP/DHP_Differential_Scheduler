/**
 */
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { determinePanelFromFieldKey } from '@/utils/forms/fieldLocationDispatcher'
import { computeRenderAs as computeRenderAsShared } from '@shared/utils/metadataRenderAsUtils'

interface MetadataFieldUpdatesOptions {
  pendingChanges: Record<string, Partial<FieldMetadataEntry>>
}

interface MetadataFieldUpdatesReturn {
  computeRenderAs: (
    dataType: string | undefined,
    inputConfig: Record<string, unknown> | null | undefined,
    fieldKey: string
  ) => FieldMetadataEntry['renderAs']
  updateFieldRendering: (fieldKey: string, updates: Partial<FieldMetadataEntry>) => void
}

export function metadataFieldUpdates(
  options: MetadataFieldUpdatesOptions
): MetadataFieldUpdatesReturn {
  const { pendingChanges } = options

  function computeRenderAs(
    dataType: string | undefined,
    inputConfig: Record<string, unknown> | null | undefined,
    fieldKey: string
  ): FieldMetadataEntry['renderAs'] {
    return computeRenderAsShared(dataType, inputConfig, fieldKey)
  }

  function updateFieldRendering(fieldKey: string, updates: Partial<FieldMetadataEntry>): void {
    if (updates.visibility !== undefined) {
      const newVisibility = updates.visibility
      if (newVisibility === 'titleRow' || newVisibility === 'expandedDirect' || newVisibility === 'staticAsTitle') {
        updates.panel = 'none'
      } else if (newVisibility === 'expandedPanel') {
        const determinedPanel = determinePanelFromFieldKey(fieldKey)
        updates.panel = determinedPanel !== 'none' ? determinedPanel : 'parts'
      }
    }

    pendingChanges[fieldKey] = { ...pendingChanges[fieldKey], ...updates }
  }

  return {
    computeRenderAs,
    updateFieldRendering,
  }
}
