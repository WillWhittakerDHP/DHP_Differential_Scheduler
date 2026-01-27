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
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'

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
  
  // Convert entityId to computed ref
  const entityIdRef = computed(() => {
    if (typeof entityId === 'string') {
      return entityId
    }
    return entityId.value
  })
  
  // Read entity reactively from store using entityId
  const entityRef = computed(() => {
    // If entity is provided, use it (for backward compatibility)
    if (entity) {
      if ('value' in entity) {
        return entity.value
      }
      return entity
    }
    // Otherwise, read from store reactively
    return getGlobalEntityById(entityKey, entityIdRef.value)
  })
  
  // Use primitive mutation for efficient single-field updates
  const { mutateAsync } = usePrimitiveMutation(entityKey)
  
  // Track pending toggles to prevent duplicate rapid calls
  const pendingToggles = ref(new Set<string>())
  
  const toggleStatusButton = async (
    fieldKey: GlobalFieldKey<GE>,
    event?: Event
  ): Promise<void> => {
    const currentEntity = entityRef.value
    if (!currentEntity) {
      return
    }
    
    // Create unique key for this toggle operation
    const toggleKey = `${currentEntity.id}-${String(fieldKey)}`
    
    // LEARNING: Prevent duplicate calls
    // WHY: Rapid clicks can cause race conditions and duplicate API calls
    // PATTERN: Return early if toggle is already in progress
    if (pendingToggles.value.has(toggleKey)) {
      return
    }
    
    // Mark toggle as pending
    pendingToggles.value.add(toggleKey)
    
    // LEARNING: Stop event propagation to prevent triggering other click handlers
    // WHY: Prevents clicks from propagating to parent elements (expansion panels, delete buttons, etc.)
    // PATTERN: Explicitly stop propagation in handler as backup to @click.stop.prevent
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    
    try {
      // LEARNING: Handle nullable boolean fields
      // WHY: Some booleans are intentionally nullable in the DB (e.g., requiresUnitNumber)
      //      In the admin UI, we still want the status chip to be toggleable even when null
      // PATTERN: Treat null/undefined as false, but guard against non-boolean unexpected types
      const currentRaw = currentEntity[fieldKey]
      const isBooleanish = currentRaw === true || currentRaw === false || 
                          currentRaw === null || currentRaw === undefined
      
      if (!isBooleanish) {
        pendingToggles.value.delete(toggleKey)
        return
      }
      
      const currentValue = currentRaw === true
      const newValue = !currentValue
      
      // LEARNING: Use primitive mutation for single-field updates
      // WHY: More efficient than full PUT, uses PATCH with {key, value} format
      // PATTERN: usePrimitiveMutation for field-level updates
      await mutateAsync({
        admin: { key: String(fieldKey), value: newValue },
        dynamicId: String(currentEntity.id)
      })
      
      // LEARNING: Invalidate metadata cache after status button toggle
      // WHY: Status button color comes from metadata - UI needs to reflect metadata changes
      // PATTERN: Invalidate metadata cache so status button color updates immediately
      queryClient.invalidateQueries({ queryKey: ['adminMetadata'] })
      
      // LEARNING: Notify parent of successful toggle
      // WHY: Allows parent to track status button changes for save state management
      // PATTERN: Call optional callback after successful mutation
      onToggle?.(String(fieldKey))
    } catch (error) {
      // Error is silently handled - mutation will rollback optimistically
    } finally {
      // LEARNING: Clear pending toggle after operation completes (success or failure)
      // WHY: Ensures the toggle can be triggered again after the operation finishes
      // PATTERN: Use finally block to ensure cleanup happens even if update fails
      pendingToggles.value.delete(toggleKey)
    }
  }
  
  return {
    toggleStatusButton
  }
}
