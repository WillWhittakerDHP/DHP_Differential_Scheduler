/**
 * WHY: Instances-first admin IA splits the active service shape into Orchestrator vs Atomic lists
 * when any instance has orchestrator === true, while other shapes keep full main/grouped maps for drag-drop.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { UseInstanceBlockInstancesByShapeOptions } from '@/types/admin/instanceComposableOptions'

function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  const b = instance as BlockInstanceEntity
  return b.wizardVisible !== false
}

function isOrchestratorInstance(instance: GlobalEntity<'blockInstance'>): boolean {
  return (instance as BlockInstanceEntity).orchestrator === true
}

export interface UseOrchestratorAwareInstanceMapsOptions extends UseInstanceBlockInstancesByShapeOptions {
  activeShapeTab: Ref<string>
  orchestratorAtomicSubTab: Ref<'orchestrator' | 'atomic'>
}

export interface UseOrchestratorAwareInstanceMapsReturn {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  groupedInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  shapeHasOrchestratorInstances: (shapeId: string) => boolean
}

export function useOrchestratorAwareInstanceMaps(
  input: UseOrchestratorAwareInstanceMapsOptions
): UseOrchestratorAwareInstanceMapsReturn {
  const { blockInstancesByShape, activeShapeTab, orchestratorAtomicSubTab } = input

  function shapeHasOrchestratorInstances(shapeId: string): boolean {
    const list = blockInstancesByShape.value.get(shapeId) ?? []
    return list.some((i) => isOrchestratorInstance(i))
  }

  const mainInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const splitActive =
        blockShapeId === activeShapeTab.value && shapeHasOrchestratorInstances(blockShapeId)

      if (!splitActive) {
        result.set(
          blockShapeId,
          instances.filter((instance) => isAdminStandaloneSection(instance))
        )
        return
      }

      if (orchestratorAtomicSubTab.value === 'orchestrator') {
        result.set(
          blockShapeId,
          instances.filter((instance) => isOrchestratorInstance(instance))
        )
        return
      }

      const atomicOnly = instances.filter((instance) => !isOrchestratorInstance(instance))
      result.set(
        blockShapeId,
        atomicOnly.filter((instance) => isAdminStandaloneSection(instance))
      )
    })

    return result
  })

  const groupedInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
    const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

    blockInstancesByShape.value.forEach((instances, blockShapeId) => {
      const splitActive =
        blockShapeId === activeShapeTab.value && shapeHasOrchestratorInstances(blockShapeId)

      if (!splitActive) {
        result.set(
          blockShapeId,
          instances.filter((instance) => !isAdminStandaloneSection(instance))
        )
        return
      }

      if (orchestratorAtomicSubTab.value === 'orchestrator') {
        result.set(blockShapeId, [])
        return
      }

      const atomicOnly = instances.filter((instance) => !isOrchestratorInstance(instance))
      result.set(
        blockShapeId,
        atomicOnly.filter((instance) => !isAdminStandaloneSection(instance))
      )
    })

    return result
  })

  return {
    mainInstancesByShape,
    groupedInstancesByShape,
    shapeHasOrchestratorInstances,
  }
}
