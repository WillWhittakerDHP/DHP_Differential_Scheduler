/**
 * Service Components Composable
 * 
 * LEARNING: Extracts component logic from ServiceSelectionStep component
 * WHY: Components should be thin UI wrappers - component logic belongs in composables
 * PATTERN: Composable that provides component extraction and composable detection
 * 
 * This composable handles:
 * - Composable block detection
 * - Active components extraction
 * - Component description filtering
 * - Component icon mapping
 */

import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '../useGlobal'
import { useComponentEntity } from '../useComponentEntity'
import { extractInstanceComponents, isServiceComposable } from '@/utils/instanceComponentUtils'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem } from '@/components/booking/types/selectionCardTypes'
import type { GlobalEntity } from '@/types/entities'

/**
 * Service Components Composable Options
 */
export interface UseInstanceComponentsOptions {
  /**
   * Service to get components for
   */
  service: ComputedRef<BookingBlockInstance | null>
  
  /**
   * Selected user type (for filtering component descriptions)
   */
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

/**
 * Service Components Composable Return Type
 */
export interface UseInstanceComponentsReturn {
  /**
   * Whether the service is a composable block
   */
  isComposable: ComputedRef<boolean>
  
  /**
   * Active components for the service
   */
  instanceComponents: ComputedRef<ComponentItem[]>
  
  /**
   * Component count
   */
  componentCount: ComputedRef<number>
}

/**
 * Service Components Composable
 * 
 * LEARNING: Provides component logic extracted from ServiceSelectionStep component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for component detection and extraction
 */
export function useInstanceComponents(
  options: UseInstanceComponentsOptions
): UseInstanceComponentsReturn {
  const { service, selectedUserTypeBlock } = options
  
  const { getGlobalEntityById, getGlobalData } = useGlobal()
  const componentEntity = useComponentEntity<'blockInstance'>('blockInstance')

  const getGlobalEntityByIdOrNull = (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ): GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null => {
    return getGlobalEntityById(entityKey, id) ?? null
  }

  /**
   * LEARNING: Only composable blocks can have option components (instanceComponents)
   * WHY: Check blockShape.composable property from globalData
   * PATTERN: Use utility function to check composable status
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
   * LEARNING: Get active components for composable blocks
   * WHY: Provides components that are part of composable services
   * PATTERN: Use utility function to extract components
   */
  const instanceComponents = computed(() => {
    const blockInstance = service.value
    if (!isComposable.value || !blockInstance) return []
    
    const instanceComponentsRelationships = componentEntity.getComponents(blockInstance.id)
    if (!instanceComponentsRelationships || instanceComponentsRelationships.length === 0) {
      return []
    }
    
    const globalData = getGlobalData()
    if (!globalData) return []
    
    const selectedUserTypeBlockId = selectedUserTypeBlock.value?.id || null
    
    return extractInstanceComponents({
      serviceId: blockInstance.id,
      instanceComponentsRelationships,
      getGlobalEntityById: getGlobalEntityByIdOrNull,
      selectedUserTypeBlockId
    })
  })

  /**
   * LEARNING: Component count
   * WHY: Provides count of active components
   * PATTERN: Computed property that returns length of active components
   */
  const componentCount = computed(() => instanceComponents.value.length)

  return {
    isComposable,
    instanceComponents,
    componentCount
  }
}

