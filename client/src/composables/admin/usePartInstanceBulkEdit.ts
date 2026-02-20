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
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import type { GlobalEntity } from '@/types/entities'
import { useEntityMetadata } from './useEntityMetadata'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePartInstanceBulkEdit')

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

export interface UsePartInstanceBulkEditOptions {
  existingPartInstances: ComputedRef<GlobalEntity<'partInstance'>[]>
}

export interface UsePartInstanceBulkEditReturn {
  bulkEditMode: ReturnType<typeof ref<boolean>>
  
  bulkEditData: ReturnType<typeof ref<PartInstanceBulkEditData>>
  
  toggleBulkEditMode: () => void
  
  applyPartInstanceBulkEdit: () => Promise<void>
  
  handleBulkEditModalUpdate: (value: boolean) => void
  
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

  // PATTERN: Use PartInstance entity instead of PartShape for consistency with modal
  const firstPartInstanceForMetadata = computed(() => {
    return existingPartInstances.value[0] || null
  })

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
      
      // PATTERN: Read from reactive ref, no need to look up PartShape separately
      const fieldMetadata = bulkEditFieldMetadata.value
      
      // PATTERN: Read from new metadata system to get authoritative list of bulk edit enabled fields
      const bulkEditEnabledFields = Object.keys(fieldMetadata).filter(fieldKey => {
        const metadata = fieldMetadata[fieldKey]
        return metadata?.bulkEdit === true
      })
      
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
      
      // PATTERN: Use patchBulk mutation for bulk updates
      await patchBulk(updates)
      success(`Updated ${instances.length} PartInstance(s)`)
      
      // Clear bulk edit data (reset to empty object since fields are now config-driven)
      bulkEditData.value = {}
    } catch (err) {
      logger.error('Error in applyPartInstanceBulkEdit', { err })
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
    // PATTERN: Use data directly, but validate against metadata as safety check
    const fieldMetadata = bulkEditFieldMetadata.value
    
    // WHY: Functional approach avoids mutations, aligns with workspace rules
    // PATTERN: Reduce entries to filtered object instead of mutating
    const filteredData = Object.entries(data).reduce<PartInstanceBulkEditData>((acc, [fieldKey, value]) => {
      const metadata = fieldMetadata[fieldKey]
      if (metadata?.bulkEdit === true) {
        acc[fieldKey] = value as number | null | undefined
      }
      return acc
    }, {})
    
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

