/**
 * LEARNING: Reusable status button toggle composable
 * WHY: Centralizes status button toggle logic for all entity types
 * PATTERN: Pure configuration-based composable that handles toggle logic consistently
 * 
 * Features:
 * - Prevents duplicate rapid clicks (pending toggle tracking)
 * - Handles nullable booleans (treats null/undefined as false)
 * - Stops event propagation to prevent triggering parent handlers
 * - Uses primitive mutation for efficient single-field updates
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { usePrimitiveMutation } from '../entityCrud/usePrimitiveMutation'
import { useGlobal } from '../useGlobal'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'

export interface UseStatusButtonToggleOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  entityId: string | Ref<string> | ComputedRef<string>
  entity?: Ref<GlobalEntity<GE>> | ComputedRef<GlobalEntity<GE>> | GlobalEntity<GE>
  /**
   * LEARNING: Optional callback when status button is toggled
   * WHY: Allows parent component to track status button changes for save state management
   * PATTERN: Called after successful toggle with the field key that was changed
   */
  onToggle?: (fieldKey: string) => void
}

export interface UseStatusButtonToggleReturn<GE extends GlobalEntityKey> {
  toggleStatusButton: (fieldKey: GlobalFieldKey<GE>, event?: Event) => Promise<void>
}

/**
 * LEARNING: Reusable status button toggle composable
 * WHY: Ensures all status buttons use the same reliable toggle logic
 * PATTERN: Pure composable that handles all toggle concerns
 */
export function useStatusButtonToggle<GE extends GlobalEntityKey>(
  options: UseStatusButtonToggleOptions<GE>
): UseStatusButtonToggleReturn<GE> {
  const { entityKey, entityId, entity, onToggle } = options
  
  const { getGlobalEntityById } = useGlobal()
  
  const entityIdRef = computed(() => {
    if (typeof entityId === 'string') {
      return entityId
    }
    return entityId.value
  })
  
  const entityRef = computed(() => {
    // If entity is provided, use it (for backward compatibility)
    if (entity) {
      if ('value' in entity) {
        return entity.value
      }
      return entity
    }
    return getGlobalEntityById(entityKey, entityIdRef.value)
  })
  
  const { mutateAsync } = usePrimitiveMutation(entityKey)
  
  // PATTERN: Use useQueryClient composable for cache access
  const queryClient = useQueryClient()
  
  const pendingToggles = ref(new Set<string>())
  
  const toggleStatusButton = async (
    fieldKey: GlobalFieldKey<GE>,
    event?: Event
  ): Promise<void> => {
    const currentEntity = entityRef.value
    if (!currentEntity) {
      return
    }
    
    const toggleKey = `${currentEntity.id}-${String(fieldKey)}`
    
    // PATTERN: Return early if toggle is already in progress
    if (pendingToggles.value.has(toggleKey)) {
      return
    }
    
    pendingToggles.value.add(toggleKey)
    
    // PATTERN: Explicitly stop propagation in handler as backup to @click.stop.prevent
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    
    try {
      // PATTERN: Check if field is ternary, otherwise treat as boolean
      const currentRaw = currentEntity[fieldKey]
      
      const isTernary = currentRaw === 'true' || currentRaw === 'false' || currentRaw === 'override'
      
      if (isTernary) {
        // LEARNING: Cycle through ternary states: 'false' → 'true' → 'override' → 'false'
        // WHY: Provides three-state toggle for ternary fields
        // PATTERN: Explicit state cycling
        const currentTernary = currentRaw as TernaryBoolean
        let newTernary: TernaryBoolean
        
        if (currentTernary === 'false') {
          newTernary = 'true'
        } else if (currentTernary === 'true') {
          newTernary = 'override'
        } else {
          newTernary = 'false'
        }
        
        const updatePayload: Array<{ admin: { key: string; value: TernaryBoolean }; dynamicId: string }> = [
          {
            admin: { key: String(fieldKey), value: newTernary },
            dynamicId: String(currentEntity.id)
          }
        ]
        
        for (const payload of updatePayload) {
          await mutateAsync(payload)
        }
        
        queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
        onToggle?.(String(fieldKey))
        return
      }
      
      // PATTERN: Treat null/undefined as false, but guard against non-boolean unexpected types
      const isBooleanish = currentRaw === true || currentRaw === false || 
                          currentRaw === null || currentRaw === undefined
      
      if (!isBooleanish) {
        pendingToggles.value.delete(toggleKey)
        return
      }
      
      const currentValue = currentRaw === true
      const newValue = !currentValue
      
      // PATTERN: Automatically clear the other field when one is set to true
      const updatePayload: Array<{ admin: { key: string; value: boolean }; dynamicId: string }> = [
        {
          admin: { key: String(fieldKey), value: newValue },
          dynamicId: String(currentEntity.id)
        }
      ]
      
      if (entityKey === 'blockShape' && newValue === true) {
        if (fieldKey === 'isStateControl') {
          const currentCanHaveParts = (currentEntity as any).canHaveParts === true
          if (currentCanHaveParts) {
            updatePayload.push({
              admin: { key: 'canHaveParts', value: false },
              dynamicId: String(currentEntity.id)
            })
          }
        } else if (fieldKey === 'canHaveParts') {
          const currentIsStateControl = (currentEntity as any).isStateControl === true
          if (currentIsStateControl) {
            updatePayload.push({
              admin: { key: 'isStateControl', value: false },
              dynamicId: String(currentEntity.id)
            })
          }
        }
      }
      
      // WHY: More efficient than full PUT, uses PATCH with {key, value} format
      // PATTERN: usePrimitiveMutation for field-level updates
      for (const payload of updatePayload) {
        await mutateAsync(payload)
      }
      
      // PATTERN: Invalidate metadata cache so status button color updates immediately
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
      
      // WHY: Allows parent to track status button changes for save state management
      // PATTERN: Call optional callback after successful mutation
      onToggle?.(String(fieldKey))
    } catch (error) {
    } finally {
      // PATTERN: Use finally block to ensure cleanup happens even if update fails
      pendingToggles.value.delete(toggleKey)
    }
  }
  
  return {
    toggleStatusButton
  }
}
