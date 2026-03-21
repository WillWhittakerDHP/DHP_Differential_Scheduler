/**
 * WHY: useCascadeInstances Composable

WHY: Generic composable for resolving bo...
 */
import { computed } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseCascadeInstancesOptions, UseCascadeInstancesReturn } from '@/types/booking/cascadeInstances'

export type { UseCascadeInstancesOptions, UseCascadeInstancesReturn } from '@/types/booking/cascadeInstances'

export function useCascadeInstances(
  options: UseCascadeInstancesOptions
): UseCascadeInstancesReturn {
  const { parentInstance, bookingData, targetBlockShapeName } = options
  
  /**
   * PATTERN: Use activeBlockIds directly - already resolved by transformer
   */
  const cascadeInstanceIds = computed((): string[] => {
    const parent = parentInstance.value
    if (!parent) return []
    
    const raw = parent.activeBlockIds
    return raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
  })
  
  const cascadeInstances = computed((): BookingBlockInstance[] => {
    const data = bookingData.value
    if (!data) return []
    
    const ids = new Set(cascadeInstanceIds.value)
    if (ids.size === 0) return []
    
    let instances = data.blockInstances.filter(
      instance => ids.has(instance.id)
    )
    
    if (targetBlockShapeName) {
      const targetShape = data.blockShapes.find(
        shape => shape.name === targetBlockShapeName
      )
      
      if (targetShape) {
        instances = instances.filter(
          instance => instance.blockShapeRef === targetShape.id
        )
      }
    }
    
    return instances.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  })
  
  const hasCascades = computed((): boolean => {
    return cascadeInstances.value.length > 0
  })
  
  return {
    cascadeInstanceIds,
    cascadeInstances,
    hasCascades
  }
}

