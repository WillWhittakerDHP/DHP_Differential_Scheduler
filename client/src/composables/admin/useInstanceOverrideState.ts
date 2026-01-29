/**
 * LEARNING: Instance override state management for metadata editor
 * WHY: Encapsulates pending override/deletion tracking and toggle logic
 * PATTERN: Composable for managing instance-specific metadata override state
 * 
 * Used by:
 * - AdminPrimitiveMetadataEditor.vue
 */

import { ref, reactive, type Ref } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface UseInstanceOverrideStateOptions {
  mode: 'global' | 'instanceOverride'
  fieldMetadata: Ref<Record<string, FieldMetadataEntry>>
}

export interface UseInstanceOverrideStateReturn {
  pendingOverrides: Ref<Set<string>>
  pendingDeletes: Ref<Set<string>>
  pendingChanges: Record<string, Partial<FieldMetadataEntry>>
  hasOverride: (fieldKey: string) => boolean
  toggleOverride: (fieldKey: string, enabled: boolean) => void
  clearPendingState: () => void
}

/**
 * LEARNING: Manage instance override state for metadata editor
 * WHY: Tracks which fields have pending overrides, deletions, and changes
 * PATTERN: Reactive state with helper functions for override management
 */
export function useInstanceOverrideState(
  options: UseInstanceOverrideStateOptions
): UseInstanceOverrideStateReturn {
  const { mode, fieldMetadata } = options

  // Track pending overrides (fields that will have instance-specific config)
  const pendingOverrides = ref<Set<string>>(new Set())
  
  // Track pending deletes (fields that will delete instance override)
  const pendingDeletes = ref<Set<string>>(new Set())
  
  // Track pending changes (updates to field metadata)
  const pendingChanges = reactive<Record<string, Partial<FieldMetadataEntry>>>({})

  /**
   * LEARNING: Check if field has an override (instanceOverride mode only)
   * WHY: Determines if field should show override UI and allow editing
   * PATTERN: Check pending state first, then check database metadata
   */
  function hasOverride(fieldKey: string): boolean {
    if (mode !== 'instanceOverride') return true // Global mode always has "override"
    if (pendingDeletes.value.has(fieldKey)) return false
    if (pendingOverrides.value.has(fieldKey)) return true
    // Check if override exists in database (would be in metadata if it exists)
    return !!fieldMetadata.value[fieldKey]
  }

  /**
   * LEARNING: Toggle override (instanceOverride mode only)
   * WHY: Enables/disables instance-specific override for a field
   * PATTERN: Update pending state and initialize pending changes when enabling
   */
  function toggleOverride(fieldKey: string, enabled: boolean): void {
    if (mode !== 'instanceOverride') return
    
    if (enabled) {
      pendingDeletes.value.delete(fieldKey)
      pendingOverrides.value.add(fieldKey)
      // Initialize pending change with current effective metadata
      const currentMeta = fieldMetadata.value[fieldKey]
      if (currentMeta) {
        pendingChanges[fieldKey] = {
          visibility: currentMeta.visibility,
          layout: currentMeta.layout,
          displayOrder: currentMeta.displayOrder,
          renderAs: currentMeta.renderAs,
          statusButtonColor: currentMeta.statusButtonColor,
          panel: currentMeta.panel,
          bulkEdit: currentMeta.bulkEdit,
        }
      }
    } else {
      pendingOverrides.value.delete(fieldKey)
      delete pendingChanges[fieldKey]
      pendingDeletes.value.add(fieldKey)
    }
  }

  /**
   * LEARNING: Clear all pending state
   * WHY: Reset state after successful save or cancel
   * PATTERN: Clear all reactive state
   */
  function clearPendingState(): void {
    Object.keys(pendingChanges).forEach(key => delete pendingChanges[key])
    pendingOverrides.value.clear()
    pendingDeletes.value.clear()
  }

  return {
    pendingOverrides,
    pendingDeletes,
    pendingChanges,
    hasOverride,
    toggleOverride,
    clearPendingState,
  }
}
