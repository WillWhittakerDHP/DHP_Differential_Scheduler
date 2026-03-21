/**
 * WHY: Reusable status button toggle composable
PATTERN: Pure configuration-bas...
 */
import { ref, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import { useGlobal } from '../useGlobal'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'
import { createLogger } from '@/utils/logger'
import type { UseStatusButtonToggleOptions, UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'

const logger = createLogger('useStatusButtonToggle')

/**
 * WHY: Reusable status button toggle composable
PATTERN: Pure composable that h...
 */
export function useStatusButtonToggle<GE extends GlobalEntityKey>(
  options: UseStatusButtonToggleOptions<GE>
): UseStatusButtonToggleReturn<GE> {
  const { entityKey, entityId, onToggle } = options

  const { getGlobalEntityById } = useGlobal()

  const entityIdRef = computed(() => {
    if (typeof entityId === 'string') {
      return entityId
    }
    return entityId.value
  })

  const entityRef = computed<GlobalEntity<GE> | undefined>(() =>
    getGlobalEntityById(entityKey, entityIdRef.value)
  )
  
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
            dynamicId: currentEntity.id
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
          dynamicId: currentEntity.id
        }
      ]
      
      if (entityKey === 'blockShape' && newValue === true) {
        const shapeEntity = currentEntity as GlobalEntity<'blockShape'>
        if (fieldKey === 'isStateControl') {
          const currentCanHaveParts = 'canHaveParts' in shapeEntity && shapeEntity.canHaveParts === true
          if (currentCanHaveParts) {
            updatePayload.push({
              admin: { key: 'canHaveParts', value: false },
              dynamicId: shapeEntity.id
            })
          }
        } else if (fieldKey === 'canHaveParts') {
          const currentIsStateControl = 'isStateControl' in shapeEntity && shapeEntity.isStateControl === true
          if (currentIsStateControl) {
            updatePayload.push({
              admin: { key: 'isStateControl', value: false },
              dynamicId: shapeEntity.id
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
      logger.warn('Failed to toggle status button', { error, entityKey, entityId, fieldKey })
    } finally {
      // PATTERN: Use finally block to ensure cleanup happens even if update fails
      pendingToggles.value.delete(toggleKey)
    }
  }
  
  return {
    toggleStatusButton
  }
}
