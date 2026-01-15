/**
 * LEARNING: Shared field metadata update logic
 * WHY: Field metadata update logic is shared across metadata editing components
 * PATTERN: Extract shared logic into composable
 * 
 * Used by:
 * - MetadataEditModal.vue
 */

import type { Ref } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface FieldMetadataConfig {
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

/**
 * @deprecated Use FieldMetadataConfig instead
 * Kept for backward compatibility during migration
 */
export type FieldVisibilityConfig = FieldMetadataConfig

/**
 * LEARNING: Update field metadata with validation
 * WHY: Ensures panel and layout are set correctly based on visibility
 * PATTERN: Merge updates with existing entry, then validate and normalize
 * NOTE: NO DEFAULTS - if field doesn't exist, only use provided updates
 * 
 * @param fieldVisibilityConfig - Ref to field visibility config object
 * @param field - Field key to update
 * @param updates - Partial updates to apply
 */
export function useFieldMetadataUpdate(
  fieldVisibilityConfig: Ref<FieldVisibilityConfig>,
  field: string
) {
  const updateFieldMetadata = (updates: Partial<FieldMetadataEntry>): void => {
    const currentMetadata = fieldVisibilityConfig.value.fieldMetadata || {}
    const existingEntry = currentMetadata[field]
    
    // LEARNING: NO DEFAULTS - only use existing entry if it exists
    // WHY: fieldMetadata: null means not configured - don't create fake defaults
    // PATTERN: If field doesn't exist, only use the provided updates (no defaults)
    if (!existingEntry) {
      // Field doesn't exist - create entry ONLY from provided updates
      // This means user must explicitly configure each property
      if (Object.keys(updates).length === 0) {
        // No updates provided and field doesn't exist - don't create anything
        return
      }
      
      // Create new entry from updates only (no defaults)
      const newEntry: Partial<FieldMetadataEntry> = { ...updates }
      
      // LEARNING: Validate required properties based on visibility
      // WHY: Some properties are required when visibility is set
      // PATTERN: Only set required properties if visibility is provided
      if (newEntry.visibility === 'expandedPanel' && !newEntry.panel) {
        newEntry.panel = 'parts' // Required when visibility is expandedPanel
      } else if (newEntry.visibility && newEntry.visibility !== 'expandedPanel' && newEntry.panel) {
        newEntry.panel = 'none' // Must be none for non-panel visibility
      }
      
      if (newEntry.visibility && newEntry.visibility !== 'expandedDirect' && newEntry.layout) {
        newEntry.layout = 'inline' // Layout only applies to expandedDirect
      }
      
      // Only create entry if we have at least visibility (minimum required property)
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
    
    // Field exists - merge updates with existing entry
    // LEARNING: Merge updates with existing entry
    // WHY: Preserves existing values when only updating one property
    // PATTERN: Spread existing entry, then spread updates
    const updatedEntry: FieldMetadataEntry = {
      ...existingEntry,
      ...updates
    }
    
    // LEARNING: Validate required properties based on visibility
    // WHY: Some properties are required when visibility is set
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
