/**
 * LEARNING: Entity Card Store Sync Composable
 * WHY: Extracts store entity synchronization logic from EntityCard component
 * PATTERN: Composable that handles form sync when store entity updates
 * 
 * This composable handles:
 * - Syncing form values when store entity updates
 * - Detecting entity ID changes vs field value changes
 * - Resetting form on entity change, updating individual fields on value change
 */

import { computed, watch, type Ref, type ComputedRef } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityCardStoreSyncOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  
  entityId: Ref<string> | ComputedRef<string>
  
  form: FormContext
  
  isNew: boolean
  
  /**
   * Function to get store entity
   * WHY: Allows parent to control how store entity is retrieved
   * PATTERN: Function that returns store entity or undefined
   */
  getStoreEntity: () => GlobalEntity<GE> | undefined
  
  initialEntity: GlobalEntity<GE>
}

export interface UseEntityCardStoreSyncReturn<GE extends GlobalEntityKey> {
  storeEntity: ComputedRef<GlobalEntity<GE> | undefined>
}

/**
 * LEARNING: Entity Card Store Sync Composable
 * WHY: Handles form synchronization when store entity updates
 * PATTERN: Watch store entity and sync form values appropriately
 */
export function useEntityCardStoreSync<GE extends GlobalEntityKey>(
  options: UseEntityCardStoreSyncOptions<GE>
): UseEntityCardStoreSyncReturn<GE> {
  const {
    entityId,
    form,
    isNew,
    getStoreEntity,
    initialEntity
  } = options

  /**
   * LEARNING: Get entity from store with relationships attached
   * WHY: Store entity has relationships attached via adminTransformer, props.entity might not
   * PATTERN: Use store entity (with relationships) as source of truth for form initialization
   */
  const storeEntity = computed(() => {
    if (isNew) {
      return undefined
    }
    return getStoreEntity()
  })

  /**
   * LEARNING: Sync form values when store entity updates
   * WHY: If store entity updates (e.g., relationships load), form should reflect that
   * PATTERN: Use resetForm for entity changes, setFieldValue for individual field updates
   * NOTE: Only sync for existing entities (not new ones), and only if form wasn't provided by parent
   * LEARNING: Track entity ID to detect actual entity changes vs reference changes
   * WHY: Entity object reference might change (e.g., modal open/close, store refetch)
   *      but we only want to reset form when entity ID changes or entity is actually updated
   *      Prevents resetting form when modal opens/closes or store refetches with same data
   * PATTERN: Compare entity IDs, not object references, to avoid unnecessary resets
   */
  if (!isNew) {
    let lastEntityId = String(entityId.value)
    
    watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
      if (!newStoreEntity) {
        return
      }
      
      const newEntityId = String(newStoreEntity.id)
      const entityIdChanged = newEntityId !== lastEntityId
      const isInitialLoad = oldStoreEntity === undefined
      // PATTERN: Check if oldStoreEntity was undefined and newStoreEntity is different from initialEntity
      const storeEntityJustLoaded = oldStoreEntity === undefined && newStoreEntity !== initialEntity
      
      // 2. Initial load (oldStoreEntity is falsy)
      //      This uses Vee-Validate's built-in form-level API instead of field-level watches
      // PATTERN: Reset on entity ID change/initial load, use setFieldValue for individual field updates
      const shouldReset = entityIdChanged || isInitialLoad || storeEntityJustLoaded

      if (shouldReset) {
        // PATTERN: Use resetForm for entity changes, setFieldValue for individual field updates
        lastEntityId = newEntityId
        
        // PATTERN: Call resetForm with values to update all fields
        form.resetForm({
          values: {
            ...newStoreEntity,
          }
        })
      } else if (oldStoreEntity) {
        //      This is more efficient than resetting the entire form and uses Vee-Validate's built-in API
        // PATTERN: Compare old vs new to find changed fields, then use setFieldValue for each
        const formFieldKeys = form.values ? Object.keys(form.values) : []
        const changedFields = Object.keys(newStoreEntity).filter(key => {
          if (!formFieldKeys.includes(key)) {
            return false
          }
          const oldValue = (oldStoreEntity as unknown as Record<string, unknown>)[key]
          const newValue = (newStoreEntity as unknown as Record<string, unknown>)[key]
          return JSON.stringify(oldValue) !== JSON.stringify(newValue)
        })
        
        if (changedFields.length > 0 && form) {
          //      This is the correct Vee-Validate method for programmatic field updates
          // PATTERN: Use form-level API instead of field-level watches, filter to form fields only
          const formInstance = form as ReturnType<typeof useForm>
          changedFields.forEach(fieldKey => {
            formInstance.setFieldValue(fieldKey, (newStoreEntity as unknown as Record<string, unknown>)[fieldKey])
          })
        }
      }
    }, { immediate: true, deep: true }) // Run immediately and watch deeply for value changes
  }

  return {
    storeEntity: storeEntity as ComputedRef<GlobalEntity<GE> | undefined>
  }
}
