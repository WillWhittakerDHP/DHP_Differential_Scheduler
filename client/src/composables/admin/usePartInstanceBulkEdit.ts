/**
 * Part Instance Bulk Edit Composable
 * 
 * LEARNING: Extracts bulk edit logic from PartInstancesNestedSection component
 * WHY: Components should be thin UI wrappers - bulk edit logic belongs in composables
 * PATTERN: Composable that provides bulk edit state and operations
 * 
 * This composable handles:
 * - Bulk edit mode state
 * - Bulk edit form data
 * - Toggle bulk edit mode
 * - Apply bulk edit to all PartInstances
 */

import { ref, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useEntityCrud } from '../useEntity'
import { useNotification } from '../useNotification'
import type { GlobalEntity } from '@/types/entities'

/**
 * Part Instance Bulk Edit Data Interface
 */
export interface PartInstanceBulkEditData {
  baseTime?: number
  rateOverBaseTime?: number
  baseFee?: number
  rateOverBaseFee?: number
}

/**
 * Part Instance Bulk Edit Composable Options
 */
export interface UsePartInstanceBulkEditOptions {
  /**
   * Existing PartInstances to apply bulk edit to
   */
  existingPartInstances: ComputedRef<GlobalEntity<'partInstance'>[]>
}

/**
 * Part Instance Bulk Edit Composable Return Type
 */
export interface UsePartInstanceBulkEditReturn {
  /**
   * Bulk edit mode state
   */
  bulkEditMode: ReturnType<typeof ref<boolean>>
  
  /**
   * Bulk edit form data
   */
  bulkEditData: ReturnType<typeof ref<PartInstanceBulkEditData>>
  
  /**
   * Toggle bulk edit mode
   */
  toggleBulkEditMode: () => void
  
  /**
   * Apply bulk edit to all PartInstances
   */
  applyPartInstanceBulkEdit: () => Promise<void>
}

/**
 * Part Instance Bulk Edit Composable
 * 
 * LEARNING: Provides bulk edit functionality extracted from PartInstancesNestedSection component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with state and handlers for bulk edit operations
 */
export function usePartInstanceBulkEdit(
  options: UsePartInstanceBulkEditOptions
): UsePartInstanceBulkEditReturn {
  const { existingPartInstances } = options

  const queryClient = useQueryClient()
  const { update: updatePartInstance } = useEntityCrud('partInstance')
  const { success, error: showError } = useNotification()

  /**
   * LEARNING: Bulk edit mode state for PartInstances
   * WHY: Tracks whether bulk edit mode is enabled for this BlockInstance's PartInstances
   * PATTERN: ref for reactive boolean state
   */
  const bulkEditMode = ref(false)

  /**
   * LEARNING: Bulk edit form data for PartInstances
   * WHY: Stores bulk edit values for number fields
   * PATTERN: ref object with optional number fields
   */
  const bulkEditData = ref<PartInstanceBulkEditData>({})

  /**
   * LEARNING: Toggle bulk edit mode
   * WHY: Enables/disables bulk edit mode for PartInstances
   * PATTERN: Function that toggles boolean ref
   */
  const toggleBulkEditMode = (): void => {
    bulkEditMode.value = !bulkEditMode.value
    if (!bulkEditMode.value) {
      // Clear bulk edit data when exiting bulk edit mode
      bulkEditData.value = {}
    }
  }

  /**
   * LEARNING: Apply bulk edit to all PartInstances for this BlockInstance
   * WHY: Updates all PartInstances with bulk edit values
   * PATTERN: Async function that updates multiple entities
   */
  const applyPartInstanceBulkEdit = async (): Promise<void> => {
    try {
      const instances = existingPartInstances.value
      
      if (instances.length === 0) {
        showError('No PartInstances to update')
        return
      }
      
      if (Object.keys(bulkEditData.value).length === 0) {
        showError('No changes to apply')
        return
      }
      
      // Update all PartInstances with bulk edit values
      const updatePromises = instances.map(instance => 
        updatePartInstance(bulkEditData.value, instance.id)
      )
      
      await Promise.all(updatePromises)
      success(`Updated ${instances.length} PartInstance(s)`)
      
      // Clear bulk edit data
      bulkEditData.value = {}
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['partInstance'] })
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply bulk edit'
      showError(errorMessage)
    }
  }

  return {
    bulkEditMode,
    bulkEditData,
    toggleBulkEditMode,
    applyPartInstanceBulkEdit
  }
}

