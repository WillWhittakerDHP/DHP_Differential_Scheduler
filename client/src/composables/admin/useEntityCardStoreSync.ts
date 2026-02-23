/**
 * WHY: Entity Card Store Sync Composable
PATTERN: Composable that handles form ...
 */
import { computed, watch, type Ref, type ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityCardStoreSyncOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  
  entityId: Ref<string> | ComputedRef<string>
  
  form: FormContext
  
  isNew: boolean
  
  /**
   * Function to get store entity
   */
  getStoreEntity: () => GlobalEntity<GE> | undefined
  
  initialEntity: GlobalEntity<GE>
}

export interface UseEntityCardStoreSyncReturn<GE extends GlobalEntityKey> {
  storeEntity: ComputedRef<GlobalEntity<GE> | undefined>
}

/**
 * LEARNING: Entity Card Store Sync Composable
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
   * PATTERN: Use store entity (with relationships) as source of truth for form initialization
   */
  const storeEntity = computed(() => {
    if (isNew) {
      return undefined
    }
    return getStoreEntity()
  })

  /**
   * NOTE: Only sync for existing entities (not new ones), and only if form wasn't provided by parent
   *      but we only want to reset form when entity ID changes or entity is actually updated
   *      Prevents resetting form when modal opens/closes or store refetches with same data
   */
  if (!isNew) {
    let lastEntityId = String(entityId.value)
    
    watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
      if (!newStoreEntity) {
        return
      }
      
      const newEntityId = newStoreEntity.id
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
        const entityKeys = Object.keys(newStoreEntity) as (keyof GlobalEntity<GE>)[]
        const changedFields = entityKeys.filter((key): key is keyof GlobalEntity<GE> => {
          if (!formFieldKeys.includes(String(key))) {
            return false
          }
          const oldValue = oldStoreEntity[key]
          const newValue = newStoreEntity[key]
          return JSON.stringify(oldValue) !== JSON.stringify(newValue)
        })
        
        if (changedFields.length > 0 && form) {
          // PATTERN: Use form-level API instead of field-level watches, filter to form fields only
          changedFields.forEach(fieldKey => {
            form.setFieldValue(String(fieldKey), newStoreEntity[fieldKey])
          })
        }
      }
    }, { immediate: true, deep: true }) // Run immediately and watch deeply for value changes
  }

  return {
    storeEntity: storeEntity as ComputedRef<GlobalEntity<GE> | undefined>
  }
}
