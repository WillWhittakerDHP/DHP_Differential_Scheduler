/**
 * Instance Bulk Edit Composable
 * 
 * LEARNING: Extracts bulk edit logic from InstancesTab component
 * WHY: Components should be thin UI wrappers - bulk edit logic belongs in composables
 * PATTERN: Composable that provides bulk edit state and operations
 * 
 * This composable handles:
 * - Bulk edit mode state per BlockShape
 * - Bulk edit form data per BlockShape
 * - Bulk edit computed values for v-model binding
 * - Apply bulk edit operations
 */

import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
import { useEntityCrud } from '../useEntity'
import { useNotification } from '../useNotification'
import type { GlobalEntity } from '@/types/entities'

/**
 * Instance Bulk Edit Composable Options
 */
export interface UseInstanceBulkEditOptions {
  /**
   * BlockInstances grouped by BlockShape
   */
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}

/**
 * Instance Bulk Edit Composable Return Type
 */
export interface UseInstanceBulkEditReturn {
  /**
   * Bulk edit mode state per BlockShape tab
   */
  bulkEditMode: Ref<Map<string, boolean>>
  
  /**
   * Bulk edit form data per BlockShape tab
   */
  bulkEditData: Ref<Map<string, { baseSqFt?: number }>>
  
  /**
   * Helper function to get bulk edit baseSqFt computed for a specific BlockShape
   */
  getBulkEditBaseSqFt: (blockShapeId: string) => ComputedRef<number | undefined>
  
  /**
   * Helper function to get bulk edit data for a BlockShape
   */
  getBulkEditData: (blockShapeId: string) => { baseSqFt?: number }
  
  /**
   * Toggle bulk edit mode for a BlockShape tab
   */
  toggleBulkEditMode: (blockShapeId: string) => void
  
  /**
   * Apply bulk edit to all BlockInstances in a BlockShape tab
   */
  applyBulkEdit: (blockShapeId: string) => Promise<void>
}

/**
 * Instance Bulk Edit Composable
 * 
 * LEARNING: Provides bulk edit logic extracted from InstancesTab component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with state management and operations for bulk editing
 */
export function useInstanceBulkEdit(
  options: UseInstanceBulkEditOptions
): UseInstanceBulkEditReturn {
  const { blockInstancesByShape } = options
  
  const { patchBulk } = useEntityCrud('blockInstance')
  const { success, error: showError } = useNotification()

  /**
   * LEARNING: Bulk edit mode state per BlockShape tab
   * WHY: Tracks which tabs have bulk edit mode enabled
   * PATTERN: Map of BlockShape ID to boolean
   */
  const bulkEditMode = ref<Map<string, boolean>>(new Map())

  /**
   * LEARNING: Bulk edit form data per BlockShape tab
   * WHY: Stores bulk edit values for number fields
   * PATTERN: Map of BlockShape ID to form data object
   */
  const bulkEditData = ref<Map<string, { baseSqFt?: number }>>(new Map())

  /**
   * LEARNING: Cached computed values for bulk edit baseSqFt per BlockShape
   * WHY: Stores computed values to avoid recreating them on each render
   * PATTERN: Map of BlockShape ID to computed value with getter/setter
   */
  const bulkEditBaseSqFtComputeds = ref<Map<string, ComputedRef<number | undefined>>>(new Map())

  /**
   * LEARNING: Helper function to get bulk edit baseSqFt computed for a specific BlockShape
   * WHY: Provides reactive access to baseSqFt with v-model support, uses cached computed
   * PATTERN: Returns cached computed with getter/setter for v-model.number binding
   * NOTE: This function ONLY returns cached computeds - never creates during render
   *       Computeds are created proactively via watcher with immediate: true, so they exist before template renders
   *       Non-null assertion is safe because watcher runs during setup before template renders
   */
  const getBulkEditBaseSqFt = (blockShapeId: string): ComputedRef<number | undefined> => {
    // Only return cached computed - never create during render
    // Watcher with immediate: true creates all computeds during setup, before template renders
    return bulkEditBaseSqFtComputeds.value.get(blockShapeId)!
  }

  /**
   * LEARNING: Helper function to get or create bulk edit data for a BlockShape (for script use only)
   * WHY: Initialize bulk edit form data when needed in script logic
   * PATTERN: Function that ensures entry exists in ref Map
   * NOTE: For template usage, use bulkEditDataMap computed instead
   */
  const getBulkEditData = (blockShapeId: string): { baseSqFt?: number } => {
    if (!bulkEditData.value.has(blockShapeId)) {
      bulkEditData.value.set(blockShapeId, {})
    }
    return bulkEditData.value.get(blockShapeId)!
  }

  /**
   * LEARNING: Toggle bulk edit mode for a BlockShape tab
   * WHY: Enables/disables bulk edit mode for BlockInstances in that tab
   * PATTERN: Function that toggles boolean in Map
   */
  const toggleBulkEditMode = (blockShapeId: string): void => {
    const current = bulkEditMode.value.get(blockShapeId) || false
    bulkEditMode.value.set(blockShapeId, !current)
  }

  /**
   * LEARNING: Apply bulk edit to all BlockInstances in a BlockShape tab
   * WHY: Updates all BlockInstances with bulk edit values using bulk PATCH endpoint
   * PATTERN: Single bulk PATCH request instead of N individual PUT requests
   */
  const applyBulkEdit = async (blockShapeId: string): Promise<void> => {
    try {
      const instances = blockInstancesByShape.value.get(blockShapeId) || []
      
      const editData = getBulkEditData(blockShapeId)
      
      if (Object.keys(editData).length === 0) {
        showError('No changes to apply')
        return
      }
      
      // LEARNING: Build array of { id, ...fields } updates for bulk PATCH
      // WHY: Bulk PATCH endpoint expects array of updates, one per entity
      // PATTERN: Map instances to update objects with id and editData fields
      const updates = instances.map(instance => ({
        id: instance.id,
        ...editData,
      }))
      
      // LEARNING: Single bulk PATCH request instead of N individual PUT requests
      // WHY: More efficient (1 request vs N requests), semantically correct (PATCH for partial updates)
      // PATTERN: Use patchBulk mutation for bulk updates
      await patchBulk(updates)
      success(`Updated ${instances.length} BlockInstance(s)`)
      
      // Clear bulk edit data
      bulkEditData.value.set(blockShapeId, {})
    } catch (err) {
      console.error('[useInstanceBulkEdit] Error in applyBulkEdit:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply bulk edit'
      showError(errorMessage)
    }
  }

  /**
   * LEARNING: Watcher to initialize bulk edit computeds for all BlockShapes
   * WHY: Ensures computeds exist before template tries to access them
   * PATTERN: Watch blockInstancesByShape and create computeds proactively
   */
  watch(blockInstancesByShape, (map) => {
    map.forEach((_instances, blockShapeId) => {
      // Create bulk edit computed if it doesn't exist
      if (!bulkEditBaseSqFtComputeds.value.has(blockShapeId)) {
        bulkEditBaseSqFtComputeds.value.set(blockShapeId, computed({
          get() {
            if (!bulkEditData.value.has(blockShapeId)) {
              bulkEditData.value.set(blockShapeId, {})
            }
            return bulkEditData.value.get(blockShapeId)!.baseSqFt
          },
          set(newValue: number | undefined) {
            const current = bulkEditData.value.get(blockShapeId) || {}
            bulkEditData.value.set(blockShapeId, { ...current, baseSqFt: newValue })
          }
        }))
      }
    })
  }, { immediate: true })

  return {
    bulkEditMode,
    bulkEditData,
    getBulkEditBaseSqFt,
    getBulkEditData,
    toggleBulkEditMode,
    applyBulkEdit
  }
}

