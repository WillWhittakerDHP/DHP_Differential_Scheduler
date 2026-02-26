import type { Ref } from 'vue'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldMetadataConfig } from '@/types/admin/fieldMetadataUpdate'

export type { FieldMetadataConfig } from '@/types/admin/fieldMetadataUpdate'

export interface UseFieldMetadataUpdateReturn {
  updateFieldMetadata: (updates: Partial<FieldMetadataEntry>) => void
}

export function useFieldMetadataUpdate(
  fieldVisibilityConfig: Ref<FieldMetadataConfig>,
  field: string
): UseFieldMetadataUpdateReturn {
  const updateFieldMetadata = (updates: Partial<FieldMetadataEntry>): void => {
    const raw = fieldVisibilityConfig.value.fieldMetadata
    const currentMetadata = raw !== undefined && raw !== null ? raw : {}
    const existingEntry = currentMetadata[field]
    
    // PATTERN: If field doesn't exist, only use the provided updates (no defaults)
    if (!existingEntry) {
      if (Object.keys(updates).length === 0) {
        return
      }
      
      const newEntry: Partial<FieldMetadataEntry> = { ...updates }
      
      // PATTERN: Only set required properties if visibility is provided
      if (newEntry.visibility === 'expandedPanel' && !newEntry.panel) {
        newEntry.panel = 'parts' // Required when visibility is expandedPanel
      } else if (newEntry.visibility && newEntry.visibility !== 'expandedPanel' && newEntry.panel) {
        newEntry.panel = 'none' // Must be none for non-panel visibility
      }
      
      if (newEntry.visibility && newEntry.visibility !== 'expandedDirect' && newEntry.layout) {
        newEntry.layout = 'inline' // Layout only applies to expandedDirect
      }
      
      if (!newEntry.visibility) {
        return // Can't create entry without visibility
      }
      
      fieldVisibilityConfig.value = {
        fieldMetadata: {
          ...currentMetadata,
          [field]: newEntry as FieldMetadataEntry
        }
      }
      return
    }
    
    // PATTERN: Spread existing entry, then spread updates
    const updatedEntry: FieldMetadataEntry = {
      ...existingEntry,
      ...updates
    }
    
    // PATTERN: Only validate if visibility is being changed
    if (updates.visibility !== undefined) {
      if (updatedEntry.visibility === 'expandedPanel' && !updatedEntry.panel) {
        updatedEntry.panel = 'parts' // Required when visibility is expandedPanel
      } else if (updatedEntry.visibility !== 'expandedPanel' && updatedEntry.panel && updatedEntry.panel !== 'none') {
        updatedEntry.panel = 'none' // Must be none for non-panel visibility
      }
      
      if (updatedEntry.visibility !== 'expandedDirect' && updatedEntry.layout && updatedEntry.layout !== 'inline') {
        updatedEntry.layout = 'inline' // Layout only applies to expandedDirect
      }
    }
    
    fieldVisibilityConfig.value = {
      fieldMetadata: {
        ...currentMetadata,
        [field]: updatedEntry
      }
    }
  }

  return {
    updateFieldMetadata
  }
}
