/**
 * Entity Status Composable
 * 
 * LEARNING: Extracts component status logic from EntityCard component
 * WHY: Components should be thin UI wrappers - status checks belong in composables
 * PATTERN: Composable that provides component status information
 * 
 * This composable handles:
 * - Composer detection (has components)
 * - Component detection (belongs to composer)
 * - Composable detection (can be composed but isn't)
 * - Component count
 * - Composer name lookup
 */

import { computed, type ComputedRef } from 'vue'
import { useComponentEntity } from '../useComponentEntity'
import { useAdmin } from '../useAdmin'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityStatusOptions {
  entityKey: GlobalEntityKey
  
  entity: ComputedRef<GlobalEntity<GlobalEntityKey>>
}

export interface UseEntityStatusReturn {
  isComposer: ComputedRef<boolean>
  
  isComponent: ComputedRef<boolean>
  
  isComposable: ComputedRef<boolean>
  
  componentCount: ComputedRef<number>
  
  composerName: ComputedRef<string | null>
}

/**
 * Entity Status Composable
 * 
 * LEARNING: Provides component status logic extracted from EntityCard component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed properties for component status
 */
export function useEntityStatus(
  options: UseEntityStatusOptions
): UseEntityStatusReturn {
  const { entityKey, entity } = options
  
  const adminComp = useAdmin()
  
  const componentEntityComposable = entityKey === 'blockInstance'
    ? useComponentEntity('blockInstance')
    : null
  
  const {
    getComponents,
    isComponent: isComponentMethod,
    getComposerId,
    canBeComposed
  } = componentEntityComposable || {
    getComponents: () => [],
    isComponentMethod: () => false,
    getComposerId: () => null,
    canBeComposed: () => false
  }

  /**
   * LEARNING: Check if BlockInstance is a composer
   * WHY: Display indicator when BlockInstance has components
   * PATTERN: Check if components array exists and has length > 0
   */
  const isComposer = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return false
    const components = getComponents(entity.value.id)
    return components.length > 0
  })

  /**
   * LEARNING: Check if BlockInstance is a component
   * WHY: Display indicator when BlockInstance belongs to a composer
   * PATTERN: Use isComponent method from composable
   */
  const isComponent = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable || !isComponentMethod) return false
    return isComponentMethod(entity.value.id)
  })

  /**
   * LEARNING: Check if BlockInstance can be composed (but isn't currently)
   * WHY: Display indicator when BlockInstance is composable but not in a component relationship
   * PATTERN: Check canBeComposed and ensure not already composed
   */
  const isComposable = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return false
    return canBeComposed(entity.value.id) && !isComposer.value && !isComponent.value
  })

  /**
   * LEARNING: Get component count
   * WHY: Display number of components
   * PATTERN: Get components and return count
   */
  const componentCount = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return 0
    const components = getComponents(entity.value.id)
    return components.length
  })

  /**
   * LEARNING: Get composer name for display
   * WHY: Show which composer this component belongs to
   * PATTERN: Get composer ID and fetch entity name
   */
  const composerName = computed(() => {
    if (entityKey !== 'blockInstance' || !isComponent.value || !componentEntityComposable) return null
    
    const composerId = getComposerId(entity.value.id)
    if (!composerId) return null
    
    const composer = adminComp.getEntity('blockInstance', composerId)
    return composer?.name || `BlockInstance ${composerId.slice(0, 8)}`
  })

  return {
    isComposer,
    isComponent,
    isComposable,
    componentCount,
    composerName
  }
}

