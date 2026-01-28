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
  /**
   * Entity type key
   */
  entityKey: GE
  
  /**
   * Entity ID (reactive)
   */
  entityId: Ref<string> | ComputedRef<string>
  
  /**
   * Form instance to sync
   */
  form: FormContext
  
  /**
   * Whether this is a new entity (no sync needed for new entities)
   */
  isNew: boolean
  
  /**
   * Function to get store entity
   * WHY: Allows parent to control how store entity is retrieved
   * PATTERN: Function that returns store entity or undefined
   */
  getStoreEntity: () => GlobalEntity<GE> | undefined
  
  /**
   * Initial entity (from props)
   * WHY: Used to detect when store entity first loads
   */
  initialEntity: GlobalEntity<GE>
}

export interface UseEntityCardStoreSyncReturn<GE extends GlobalEntityKey> {
  /**
   * Computed store entity (with relationships attached)
   */
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
    // Track last entity ID to detect actual changes
    let lastEntityId = String(entityId.value)
    
    watch(storeEntity, (newStoreEntity, oldStoreEntity) => {
      if (!newStoreEntity) {
        return
      }
      
      const newEntityId = String(newStoreEntity.id)
      const entityIdChanged = newEntityId !== lastEntityId
      const isInitialLoad = oldStoreEntity === undefined
      // LEARNING: Detect when store entity first loads (was undefined, now has value)
      // WHY: When store entity loads for the first time, we need to reset form with store entity values
      // PATTERN: Check if oldStoreEntity was undefined and newStoreEntity is different from initialEntity
      const storeEntityJustLoaded = oldStoreEntity === undefined && newStoreEntity !== initialEntity
      
      // LEARNING: Reset form ONLY when:
      // 1. Entity ID changes (different entity)
      // 2. Initial load (oldStoreEntity is falsy)
      // 3. Store entity just loaded (was props.entity, now is store entity)
      // WHY: For same entity with changed values, use form.setFieldValue() for individual fields
      //      This uses Vee-Validate's built-in form-level API instead of field-level watches
      // PATTERN: Reset on entity ID change/initial load, use setFieldValue for individual field updates
      const shouldReset = entityIdChanged || isInitialLoad || storeEntityJustLoaded

      if (shouldReset) {
        // LEARNING: Reset form when entity ID changes or on initial load
        // WHY: resetForm updates all fields and sets initial values for future resets
        // PATTERN: Use resetForm for entity changes, setFieldValue for individual field updates
        lastEntityId = newEntityId
        
        // LEARNING: Use resetForm to update both current values AND initial values (per vee-validate docs)
        // WHY: resetForm updates all fields that are part of the form, even if they were created before
        //      It sets both current values and new initial values for future resets
        // PATTERN: Call resetForm with values to update all fields
        form.resetForm({
          values: {
            ...newStoreEntity,
          }
        })
      } else if (oldStoreEntity) {
        // LEARNING: Store entity changed but same ID - use form.setFieldValue() for individual fields
        // WHY: Vee-Validate automatically syncs useField() instances when setFieldValue() is called
        //      This is more efficient than resetting the entire form and uses Vee-Validate's built-in API
        // PATTERN: Compare old vs new to find changed fields, then use setFieldValue for each
        // NOTE: Only sync fields that exist in the form (check form.values) to avoid calling setFieldValue for non-form fields
        const formFieldKeys = form.values ? Object.keys(form.values) : []
        const changedFields = Object.keys(newStoreEntity).filter(key => {
          // Only check fields that exist in the form
          if (!formFieldKeys.includes(key)) {
            return false
          }
          const oldValue = (oldStoreEntity as unknown as Record<string, unknown>)[key]
          const newValue = (newStoreEntity as unknown as Record<string, unknown>)[key]
          return JSON.stringify(oldValue) !== JSON.stringify(newValue)
        })
        
        if (changedFields.length > 0 && form) {
          // LEARNING: Use Vee-Validate's form.setFieldValue() for each changed field
          // WHY: setFieldValue() automatically syncs the corresponding useField() instance
          //      This is the correct Vee-Validate method for programmatic field updates
          //      Only call setFieldValue for fields that exist in the form (already filtered above)
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
