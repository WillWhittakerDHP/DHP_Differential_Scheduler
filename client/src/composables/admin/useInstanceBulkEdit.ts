/**
 * WHY: Instance Bulk Edit Composable

WHY: Components should be thin UI wrapper...
 */
import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import { createLogger } from '@/utils/logger'
import { asEmptyArray, asEmptyObject } from '@/utils/safeDefaults'
import type { UseInstanceBlockInstancesByShapeOptions } from './useInstanceComposableOptions'

const logger = createLogger('useInstanceBulkEdit')

export type UseInstanceBulkEditOptions = UseInstanceBlockInstancesByShapeOptions

export interface UseInstanceBulkEditReturn {
  bulkEditMode: Ref<Map<string, boolean>>
  
  bulkEditData: Ref<Map<string, { baseSqFt?: number }>>
  
  getBulkEditBaseSqFt: (blockShapeId: string) => ComputedRef<number | undefined>
  
  getBulkEditData: (blockShapeId: string) => { baseSqFt?: number }
  
  toggleBulkEditMode: (blockShapeId: string) => void
  
  applyBulkEdit: (blockShapeId: string) => Promise<void>
}

/**
 * WHY: Instance Bulk Edit Composable

WHY: Moves business logic out of componen...
 */
export function useInstanceBulkEdit(
  options: UseInstanceBulkEditOptions
): UseInstanceBulkEditReturn {
  const { blockInstancesByShape } = options
  
  const { patchBulk } = useEntityCrud('blockInstance')
  const { success, error: showError } = useNotification()

  /**
   * LEARNING: Bulk edit mode state per BlockShape tab
   */
  const bulkEditMode = ref<Map<string, boolean>>(new Map())

  /**
   */
  const bulkEditData = ref<Map<string, { baseSqFt?: number }>>(new Map())

  /**
   */
  const bulkEditBaseSqFtComputeds = ref<Map<string, ComputedRef<number | undefined>>>(new Map())

  /**
   * NOTE: This function ONLY returns cached computeds - never creates during render
   *       Computeds are created proactively via watcher with immediate: true, so they exist before template renders
   *       Non-null assertion is safe because watcher runs during setup before template renders
   */
  const getBulkEditBaseSqFt = (blockShapeId: string): ComputedRef<number | undefined> => {
    return bulkEditBaseSqFtComputeds.value.get(blockShapeId)!
  }

  /**
   * NOTE: For template usage, use bulkEditDataMap computed instead
   */
  const getBulkEditData = (blockShapeId: string): { baseSqFt?: number } => {
    if (!bulkEditData.value.has(blockShapeId)) {
      bulkEditData.value.set(blockShapeId, {})
    }
    return bulkEditData.value.get(blockShapeId)!
  }

  /**
   */
  const toggleBulkEditMode = (blockShapeId: string): void => {
    const current = bulkEditMode.value.get(blockShapeId) || false
    bulkEditMode.value.set(blockShapeId, !current)
  }

  /**
   */
  const applyBulkEdit = async (blockShapeId: string): Promise<void> => {
    try {
      const instances = asEmptyArray(blockInstancesByShape.value.get(blockShapeId))
      
      const editData = getBulkEditData(blockShapeId)
      
      if (Object.keys(editData).length === 0) {
        showError('No changes to apply')
        return
      }
      
      // PATTERN: Map instances to update objects with id and editData fields
      const updates = instances.map(instance => ({
        id: instance.id,
        ...editData,
      }))
      
      // PATTERN: Use patchBulk mutation for bulk updates
      await patchBulk(updates)
      success(`Updated ${instances.length} BlockInstance(s)`)
      
      bulkEditData.value.set(blockShapeId, {})
    } catch (err) {
      logger.error('Error in applyBulkEdit', { err })
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply bulk edit'
      showError(errorMessage)
    }
  }

  /**
   */
  watch(blockInstancesByShape, (map) => {
    map.forEach((_instances, blockShapeId) => {
      if (!bulkEditBaseSqFtComputeds.value.has(blockShapeId)) {
        bulkEditBaseSqFtComputeds.value.set(blockShapeId, computed({
          get() {
            if (!bulkEditData.value.has(blockShapeId)) {
              bulkEditData.value.set(blockShapeId, {})
            }
            return bulkEditData.value.get(blockShapeId)!.baseSqFt
          },
          set(newValue: number | undefined) {
            const current = asEmptyObject(bulkEditData.value.get(blockShapeId))
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

