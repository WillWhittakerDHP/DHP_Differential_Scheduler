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
import { useGlobal } from '../useGlobal'
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
  const { globalData } = useGlobal()

  // LEARNING: Get PartShape entity from first PartInstance for fetching field metadata
  // WHY: Need PartShape entity to fetch metadata via unified composable
  // PATTERN: Computed property that extracts PartShape entity from first instance
  const partShapeForBulkEdit = computed(() => {
    const firstInstance = existingPartInstances.value[0]
    if (!firstInstance?.partShapeRef) return null
    return globalData.value?.entities?.partShape?.find(
      ps => String(ps.id) === String(firstInstance.partShapeRef)
    ) as import('@/types/entities').PartShapeEntity | undefined || null
  })

  // LEARNING: Fetch field metadata using unified system
  // WHY: Need to check which fields have bulkEdit: true
  // PATTERN: Use useEntityMetadata with PartShape entity
  const { fieldMetadata: bulkEditFieldMetadata } = useEntityMetadata(
    'partShape',
    partShapeForBulkEdit
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
    console.log('[usePartInstanceBulkEdit] applyPartInstanceBulkEdit called')
    try {
      const instances = existingPartInstances.value
      console.log('[usePartInstanceBulkEdit] instances count:', instances.length)
      
      if (instances.length === 0) {
        console.log('[usePartInstanceBulkEdit] No PartInstances to update')
        showError('No PartInstances to update')
        return
      }
      
      // LEARNING: Build array of { id, ...fields } updates for bulk PATCH
      // WHY: Bulk PATCH endpoint expects array of updates, one per entity
      // PATTERN: Map instances to update objects with id and bulkEditData fields
      // Filter out null values and fields without bulkEdit: true - only include fields that have actual values and are enabled for bulk edit
      console.log('[usePartInstanceBulkEdit] bulkEditData.value:', bulkEditData.value)
      
      // LEARNING: Get PartShape from first PartInstance to check bulkEdit property
      // WHY: Bulk edit uses PartShape.fieldMetadata (per-PartShape, not global)
      // PATTERN: Get first PartInstance, then get its PartShape
      const firstInstance = instances[0]
      if (!firstInstance.partShapeRef) {
        showError('PartInstance missing partShapeRef')
        return
      }
      
      const partShape = globalData.value?.entities?.partShape?.find(
        ps => String(ps.id) === String(firstInstance.partShapeRef)
      ) || null
      
      if (!partShape) {
        showError('PartShape not found')
        return
      }
      
      // Get PartShape field metadata to check bulkEdit property using new system
      // WHY: Already fetched at top level via composable, read from reactive ref
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
          // Must have a value
          if (value === null || value === undefined) {
            return false
          }
          // Must be in the list of bulk edit enabled fields
          if (!bulkEditEnabledFields.includes(fieldKey)) {
            console.warn(`[usePartInstanceBulkEdit] Field ${fieldKey} is not enabled for bulk edit, excluding from update`)
            return false
          }
          // Double-check metadata has bulkEdit: true
          const metadata = fieldMetadata[fieldKey]
          if (metadata?.bulkEdit !== true) {
            console.warn(`[usePartInstanceBulkEdit] Field ${fieldKey} does not have bulkEdit: true, excluding from update`)
            return false
          }
          return true
        })
      )
      console.log('[usePartInstanceBulkEdit] fieldsToUpdate:', fieldsToUpdate)
      console.log('[usePartInstanceBulkEdit] fieldsToUpdate keys:', Object.keys(fieldsToUpdate))
      
      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log('[usePartInstanceBulkEdit] No changes to apply - fieldsToUpdate is empty')
        showError('No changes to apply')
        return
      }
      
      const updates = instances.map(instance => ({
        id: instance.id,
        ...fieldsToUpdate,
      }))
      console.log('[usePartInstanceBulkEdit] updates array:', updates)
      
      // LEARNING: Single bulk PATCH request instead of N individual PUT requests
      // WHY: More efficient (1 request vs N requests), semantically correct (PATCH for partial updates)
      // PATTERN: Use patchBulk mutation for bulk updates
      console.log('[usePartInstanceBulkEdit] Calling patchBulk...')
      await patchBulk(updates)
      console.log('[usePartInstanceBulkEdit] patchBulk completed successfully')
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
    // LEARNING: Use field metadata from new system
    // WHY: Config is fetched via useEntityMetadata composable
    // PATTERN: Read from reactive fieldMetadata computed property
    const fieldMetadata = bulkEditFieldMetadata.value
    
    // Only include fields that have bulkEdit: true in config
    const filteredData: PartInstanceBulkEditData = {}
    Object.entries(data).forEach(([fieldKey, value]) => {
      const metadata = fieldMetadata[fieldKey]
      if (metadata?.bulkEdit === true) {
        // FIX: PartInstanceBulkEditData accepts number | null | undefined
        filteredData[fieldKey] = value as number | null | undefined
      }
    })
    
    // FIX: Ensure type compatibility - PartInstanceBulkEditData allows undefined, but assignment needs explicit type
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

