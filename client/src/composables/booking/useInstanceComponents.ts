/**
 * WHY: Service Components Composable

WHY: Components should be thin UI wrapper...
 */
import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '../useGlobal'
import { useComponentEntity } from '../useComponentEntity'
import { extractInstanceComponents, isServiceComposable } from '@/utils/instanceComponentUtils'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem } from '@/components/booking/types/selectionCardTypes'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'

export interface UseInstanceComponentsOptions {
  service: ComputedRef<BookingBlockInstance | null>
  
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

export interface UseInstanceComponentsReturn {
  isComposable: ComputedRef<boolean>
  
  instanceComponents: ComputedRef<ComponentItem[]>
  
  componentCount: ComputedRef<number>
}

/**
 * WHY: Service Components Composable

WHY: Moves business logic out of componen...
 */
export function useInstanceComponents(
  options: UseInstanceComponentsOptions
): UseInstanceComponentsReturn {
  const { service } = options
  
  const { getGlobalEntityById, getGlobalData } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  const getGlobalEntityByIdOrNull = (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ): GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null => {
    return getGlobalEntityById(entityKey, id) ?? null
  }

  /**
LEARNING: Only composable blocks can have option components (instanc...
   */
  const isComposable = computed(() => {
    const blockInstance = service.value
    if (!blockInstance) return false
    
    const globalData = getGlobalData()
    if (!globalData) return false
    
    return isServiceComposable({
      serviceId: blockInstance.id,
      getGlobalEntityById: getGlobalEntityByIdOrNull
    })
  })

  /**
   */
  const instanceComponents = computed(() => {
    const blockInstance = service.value
    if (!isComposable.value || !blockInstance) return []
    
    const instanceComponentsRelationships = componentEntity.getComponents(toGlobalEntityId(blockInstance.id))
    if (!instanceComponentsRelationships || instanceComponentsRelationships.length === 0) {
      return []
    }
    
    const globalData = getGlobalData()
    if (!globalData) return []

    return extractInstanceComponents({
      serviceId: blockInstance.id,
      instanceComponentsRelationships,
      getGlobalEntityById: getGlobalEntityByIdOrNull
    })
  })

  /**
   */
  const componentCount = computed(() => instanceComponents.value.length)

  return {
    isComposable,
    instanceComponents,
    componentCount
  }
}

