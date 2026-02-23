/**
 * WHY: Entity Status Composable

WHY: Components should be thin UI wrappers - s...
 */
import { computed, type ComputedRef } from 'vue'
import { useComponentEntity } from '../useComponentEntity'
import { useAdmin } from './useAdmin'
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
 * WHY: Entity Status Composable

WHY: Moves business logic out of components in...
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
   */
  const isComposer = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return false
    const components = getComponents(entity.value.id)
    return components.length > 0
  })

  /**
   * PATTERN: Use isComponent method from composable
   */
  const isComponent = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable || !isComponentMethod) return false
    return isComponentMethod(entity.value.id)
  })

  /**
   * WHY: Display indicator when BlockInstance is composable but not in a component relationship
   */
  const isComposable = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return false
    return canBeComposed(entity.value.id) && !isComposer.value && !isComponent.value
  })

  /**
   */
  const componentCount = computed(() => {
    if (entityKey !== 'blockInstance' || !componentEntityComposable) return 0
    const components = getComponents(entity.value.id)
    return components.length
  })

  /**
   */
  const composerName = computed(() => {
    if (entityKey !== 'blockInstance' || !isComponent.value || !componentEntityComposable) return null
    
    const composerId = getComposerId(entity.value.id)
    if (!composerId) return null
    
    const composer = adminComp.getEntity('blockInstance', composerId)
    const name = composer?.name
    return name !== undefined && name !== null && name !== '' ? name : `BlockInstance ${composerId.slice(0, 8)}`
  })

  return {
    isComposer,
    isComponent,
    isComposable,
    componentCount,
    composerName
  }
}

