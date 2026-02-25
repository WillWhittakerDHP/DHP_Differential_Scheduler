
import { describe, it, expect } from 'vitest'
import { composePartInstances, getComponentsRecursive } from '@/utils/transformers/componentAggregator'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalRelationship } from '@/types/relationships'
import type { InstanceComponent } from '@/types/component'
import type { GlobalEntity } from '@/types/entities'

function createBlockInstance(id: string, name: string): GlobalEntity<'blockInstance'> {
  return {
    id,
    entityKey: 'blockInstance',
    name,
    disabled: false,
    orderIndex: 0,
    active: true,
  } as GlobalEntity<'blockInstance'>
}

function createPartAssignmentsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'partAssignments',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'partInstance' } as GlobalEntity<'partInstance'>)),
  }
}

function createInstanceComponent(
  parentId: string,
  childId: string,
  options: { disabled?: boolean; orderIndex?: number } = {}
): InstanceComponent {
  return {
    id: `${parentId}-${childId}`,
    parentId,
    childId,
    orderIndex: options.orderIndex ?? 0,
    disabled: options.disabled ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe('componentAggregator', () => {
  describe('composePartInstances', () => {
    it('should compose part instances from multiple composed block instances', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [
            createBlockInstance('block-1', 'Block 1'),
            createBlockInstance('block-2', 'Block 2'),
          ],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [
            createPartAssignmentsRel('block-1', ['part-1', 'part-2']),
            createPartAssignmentsRel('block-2', ['part-3', 'part-4']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      expect(result).toHaveLength(4)
      expect(result).toContain('part-1')
      expect(result).toContain('part-2')
      expect(result).toContain('part-3')
      expect(result).toContain('part-4')
    })

    it('should deduplicate part instances when blocks share parts', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [
            createBlockInstance('block-1', 'Block 1'),
            createBlockInstance('block-2', 'Block 2'),
          ],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [
            createPartAssignmentsRel('block-1', ['part-1', 'part-2']),
            createPartAssignmentsRel('block-2', ['part-2', 'part-3']), // part-2 is shared
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      expect(result).toHaveLength(3) // part-1, part-2, part-3 (part-2 deduplicated)
      expect(result).toContain('part-1')
      expect(result).toContain('part-2')
      expect(result).toContain('part-3')
    })

    it('should handle empty composed block IDs array', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances([], globalData)
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should skip block IDs that do not exist in globalData', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [
            createPartAssignmentsRel('block-1', ['part-1']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances(['block-1', 'block-nonexistent'], globalData)
      
      expect(result).toHaveLength(1)
      expect(result).toContain('part-1')
    })

    it('should handle blocks with no part instances', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [
            createBlockInstance('block-1', 'Block 1'),
            createBlockInstance('block-2', 'Block 2'),
          ],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [
            createPartAssignmentsRel('block-1', ['part-1']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      expect(result).toHaveLength(1)
      expect(result).toContain('part-1')
    })

    it('should handle empty partAssignments relationships', () => {
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          partAssignments: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstances: [],
        },
      }
      
      const result = composePartInstances(['block-1'], globalData)
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('getComponentsRecursive', () => {
    it('should get direct components that are not composers', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('composer-1', 'component-2'),
        createInstanceComponent('other-composer', 'component-3'),
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toHaveLength(2)
      expect(result).toContain('component-1')
      expect(result).toContain('component-2')
      expect(result).not.toContain('component-3')
    })

    it('should get recursive components when components are themselves composers', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'component-2'), // component-1 is also a composer
        createInstanceComponent('component-2', 'component-3'), // component-2 is also a composer
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toHaveLength(1)
      expect(result).toContain('component-3')
      expect(result).not.toContain('component-1') // component-1 is a composer, not returned
      expect(result).not.toContain('component-2') // component-2 is a composer, not returned
    })

    it('should handle circular references by returning empty array', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'composer-1'), // Circular reference
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toEqual([])
    })

    it('should filter out disabled components', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1', { disabled: false }),
        createInstanceComponent('composer-1', 'component-2', { disabled: true }),
        createInstanceComponent('composer-1', 'component-3', { disabled: false }),
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toHaveLength(2)
      expect(result).toContain('component-1')
      expect(result).toContain('component-3')
      expect(result).not.toContain('component-2')
    })

    it('should return empty array when composer has no components', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('other-composer', 'component-1'),
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle empty instanceComponents array', () => {
      const instanceComponents: InstanceComponent[] = []
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should use visited set to prevent infinite loops', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'component-2'),
        createInstanceComponent('component-2', 'component-1'), // Creates cycle component-1 -> component-2 -> component-1
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // This causes component-2 to not be added (since it's a composer with no valid components)
      // So the result is empty (no leaf components found due to cycle)
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle complex nested component structure', () => {
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('composer-1', 'component-2'),
        createInstanceComponent('component-1', 'component-3'),
        createInstanceComponent('component-1', 'component-4'),
        createInstanceComponent('component-2', 'component-5'),
        createInstanceComponent('component-3', 'component-6'),
      ]
      
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      expect(result).toHaveLength(3)
      expect(result).toContain('component-4')
      expect(result).toContain('component-5')
      expect(result).toContain('component-6')
      expect(result).not.toContain('component-1') // composer, not returned
      expect(result).not.toContain('component-2') // composer, not returned
      expect(result).not.toContain('component-3') // composer, not returned
    })
  })
})
