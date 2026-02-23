import { computed, type ComputedRef } from 'vue'
import { toGlobalEntityId } from '@/types/entities'
import type { InstanceComponent } from '@/types/component'
import type { GlobalRelationship } from '@/types/relationships'
import { useGlobal } from '../useGlobal'

export type UseComponentEntityQueryReturn = {
  instanceComponents: ComputedRef<InstanceComponent[]>
  getGlobalData: ReturnType<typeof useGlobal>['getGlobalData']
}

function transformGlobalRelationshipsToInstanceComponents(relationships: GlobalRelationship[]): InstanceComponent[] {
  const instanceComponents: InstanceComponent[] = []

  relationships.forEach((rel) => {
    if (rel.relationshipKind !== 'instanceComponents') return

    rel.children.forEach((child, index) => {
      instanceComponents.push({
        id: toGlobalEntityId(`${rel.parent.id}-${child.id}`), // synthetic ID for lookup
        parentId: rel.parent.id,
        childId: child.id,
        orderIndex: index,
        disabled: false, // GlobalRelationship doesn't include disabled
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  })

  return instanceComponents
}

/**
 * PATTERN: Query/state module for `useComponentEntity`
 */
export function useComponentEntityQuery(): UseComponentEntityQueryReturn {
  const { globalData, getGlobalData } = useGlobal()

  const instanceComponents = computed((): InstanceComponent[] => {
    const data = globalData?.value
    if (!data?.relationships?.instanceComponents) {
      return []
    }

    return transformGlobalRelationshipsToInstanceComponents(data.relationships.instanceComponents)
  })

  return { instanceComponents, getGlobalData }
}


