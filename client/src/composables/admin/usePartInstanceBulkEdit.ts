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

import { ref, computed, type ComputedRef } from 'vue'
import { useEntityCrud } from '../useEntity'
import { useNotification } from '../useNotification'
import type { GlobalEntity } from '@/types/entities'
import { useEntityMetadata } from './useEntityMetadata'

/**
 * Part Instance Bulk Edit Data Interface
 * LEARNING: Dynamic interface that supports any field with bulkEdit: true
 * WHY: Fields enabled for bulk edit are config-driven, not hardcoded
 * PATTERN: Index signature allows any field key with number | null values
 * FIX: Changed from hardcoded 4 fields to dynamic interface to match config-driven approach
 */
export interface PartInstanceBulkEditData {
  [fieldKey: string]: number | null | undefined
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
  
  /**
   * Handle bulk edit modal visibility update
   */
  handleBulkEditModalUpdate: (value: boolean) => void
  
  /**
   * Handle bulk edit modal confirm event
   */
  handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void
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

  const { patchBulk } = useEntityCrud('partInstance')
  const { success, error: showError } = useNotification()

  // LEARNING: Get first PartInstance for metadata fetching
  // WHY: Use PartInstance metadata (which inherits from PartShape) to match what modal uses
  // PATTERN: Use PartInstance entity instead of PartShape for consistency with modal
  const firstPartInstanceForMetadata = computed(() => {
    return existingPartInstances.value[0] || null
  })

  // LEARNING: Fetch field metadata using unified system
  // WHY: Need to check which fields have bulkEdit: true
  // PATTERN: Use useEntityMetadata with PartInstance entity (matches modal)
  const { fieldMetadata: bulkEditFieldMetadata } = useEntityMetadata(
    'partInstance',
    firstPartInstanceForMetadata
  )

  /**
   * LEARNING: Bulk edit mode state for PartInstances
   * WHY: Tracks whether bulk edit mode is enabled for this BlockInstance's PartInstances
   * PATTERN: ref for reactive boolean state
   */
  const bulkEditMode = ref(false)

  /**
   * LEARNING: Bulk edit form data for PartInstances
   * WHY: Stores bulk edit values for fields with bulkEdit: true
   * PATTERN: ref object with dynamic field keys
   * FIX: Initialize as empty object since fields are now config-driven, not hardcoded
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
      bulkEditData.value = {
        baseTime: null,
        rateOverBaseTime: null,
        baseFee: null,
        rateOverBaseFee: null
      }
    }
  }

  /**
   * LEARNING: Apply bulk edit to all PartInstances for this BlockInstance
   * WHY: Updates all PartInstances with bulk edit values using bulk PATCH endpoint
   * PATTERN: Single bulk PATCH request instead of N individual PUT requests
   */
  const applyPartInstanceBulkEdit = async (): Promise<void> => {
    try {
      const instances = existingPartInstances.value
      
      if (instances.length === 0) {
        showError('No PartInstances to update')
        return
      }
      
      // LEARNING: Use PartInstance metadata already fetched at top level
      // WHY: bulkEditFieldMetadata uses PartInstance which inherits from PartShape
      // PATTERN: Read from reactive ref, no need to look up PartShape separately
      const fieldMetadata = bulkEditFieldMetadata.value
      
      // LEARNING: Get list of fields that are enabled for bulk edit
      // WHY: Double-check that we only include fields with bulkEdit: true
      // PATTERN: Read from new metadata system to get authoritative list of bulk edit enabled fields
      const bulkEditEnabledFields = Object.keys(fieldMetadata).filter(fieldKey => {
        const metadata = fieldMetadata[fieldKey]
        return metadata?.bulkEdit === true
      })
      
      // Filter to only include fields that:
      // 1. Have non-null/undefined values
      // 2. Are in the bulkEditEnabledFields list (have bulkEdit: true in config)
      const fieldsToUpdate = Object.fromEntries(
        Object.entries(bulkEditData.value).filter(([fieldKey, value]) => {
          if (value === null || value === undefined) {
            return false
          }
          if (!bulkEditEnabledFields.includes(fieldKey)) {
            return false
          }
          const metadata = fieldMetadata[fieldKey]
          if (metadata?.bulkEdit !== true) {
            return false
          }
          return true
        })
      )
      
      if (Object.keys(fieldsToUpdate).length === 0) {
        showError('No changes to apply')
        return
      }
      
      const updates = instances.map(instance => ({
        id: instance.id,
        ...fieldsToUpdate,
      }))
      
      // LEARNING: Single bulk PATCH request instead of N individual PUT requests
      // WHY: More efficient (1 request vs N requests), semantically correct (PATCH for partial updates)
      // PATTERN: Use patchBulk mutation for bulk updates
      await patchBulk(updates)
      success(`Updated ${instances.length} PartInstance(s)`)
      
      // Clear bulk edit data (reset to empty object since fields are now config-driven)
      bulkEditData.value = {}
    } catch (err) {
      console.error('[usePartInstanceBulkEdit] Error in applyPartInstanceBulkEdit:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply bulk edit'
      showError(errorMessage)
    }
  }

  /**
   * LEARNING: Handle bulk edit modal visibility update
   * WHY: Updates bulkEditMode ref when modal opens/closes
   * PATTERN: Access ref directly to ensure it's not unwrapped
   */
  const handleBulkEditModalUpdate = (value: boolean): void => {
    bulkEditMode.value = value
  }

  /**
   * LEARNING: Handle bulk edit modal confirm event
   * WHY: Updates bulk edit data and applies changes to all PartInstances
   * PATTERN: Method handler for modal @confirm event, properly accesses composable refs
   * FIX: Filter data to only include fields with bulkEdit: true from config to prevent non-bulk-edit fields from being cleared
   */
  const handleBulkEditConfirm = (data: PartInstanceBulkEditData): void => {
    // LEARNING: Trust the data from modal since it's already filtered by PartInstance metadata
    // WHY: Modal already filters based on PartInstance metadata with bulkEdit: true
    // PATTERN: Use data directly, but validate against metadata as safety check
    const fieldMetadata = bulkEditFieldMetadata.value
    
    // Only include fields that have bulkEdit: true in config (safety check)
    const filteredData: PartInstanceBulkEditData = {}
    Object.entries(data).forEach(([fieldKey, value]) => {
      const metadata = fieldMetadata[fieldKey]
      if (metadata?.bulkEdit === true) {
        filteredData[fieldKey] = value as number | null | undefined
      }
    })
    
    if (Object.keys(filteredData).length === 0) {
      showError('No valid fields to update')
      return
    }
    
    bulkEditData.value = filteredData as PartInstanceBulkEditData
    applyPartInstanceBulkEdit()
  }

  return {
    bulkEditMode,
    bulkEditData,
    toggleBulkEditMode,
    applyPartInstanceBulkEdit,
    handleBulkEditModalUpdate,
    handleBulkEditConfirm
  }
}

