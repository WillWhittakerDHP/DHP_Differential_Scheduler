/**
 * WHY: Pure map global relationships → InstanceComponent[] (useComponentEntity audit).
 */

import type { InstanceComponent } from '@/types/component'
import type { GlobalRelationship } from '@/types/relationships'
import { toGlobalEntityId } from '@/utils/globalEntity'

export function transformGlobalRelationshipsToInstanceComponents(
  relationships: GlobalRelationship[]
): InstanceComponent[] {
  const instanceComponents: InstanceComponent[] = []
  relationships.forEach((rel) => {
    if (rel.relationshipKind !== 'instanceComponents') return
    rel.children.forEach((child, index) => {
      instanceComponents.push({
        id: toGlobalEntityId(`${rel.parent.id}-${child.id}`),
        parentId: rel.parent.id,
        childId: child.id,
        orderIndex: index,
        disabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  })
  return instanceComponents
}
