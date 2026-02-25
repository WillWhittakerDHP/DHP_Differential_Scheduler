/**
 * PATTERN: Updating field metadata with automatic renderAs computation.
 */
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { determinePanelFromFieldKey } from '@/utils/forms/fieldLocationDispatcher'

export interface MetadataFieldUpdatesOptions {
  getEffectiveFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  pendingChanges: Record<string, Partial<FieldMetadataEntry>>
}

export interface MetadataFieldUpdatesReturn {
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
  const { getEffectiveFieldMetadata, pendingChanges } = options

  function computeRenderAs(
    dataType: string | undefined,
    inputConfig: Record<string, unknown> | null | undefined,
    fieldKey: string
  ): FieldMetadataEntry['renderAs'] {
    if (fieldKey === 'icon') {
      return 'iconSelect'
    }

    if (inputConfig) {
      const selectType = inputConfig.selectType as string | undefined
      if (selectType === 'partsCollectionSelect') {
        return 'relationshipCollection'
      }
      const selectMode = inputConfig.selectMode as string | undefined
      if (selectMode === 'multiple') {
        return 'multiselect'
      }
      if (inputConfig.targetMode === 'relationship') {
        return 'reference'
      }
      return 'select'
    }

    if (dataType === 'boolean' || dataType === 'ternary') {
      return 'statusButton'
    }
    if (dataType === 'number') {
      return 'number'
    }
    if (dataType === 'array') {
      return 'reference'
    }

    return 'text'
  }

  function updateFieldRendering(fieldKey: string, updates: Partial<FieldMetadataEntry>): void {
    const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
    const newDataType = effectiveMeta?.dataType
    const newInputConfig = updates.inputConfig !== undefined ? updates.inputConfig : effectiveMeta?.inputConfig

    if (updates.inputConfig !== undefined) {
      updates.renderAs = computeRenderAs(newDataType, newInputConfig, fieldKey)
    }

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
