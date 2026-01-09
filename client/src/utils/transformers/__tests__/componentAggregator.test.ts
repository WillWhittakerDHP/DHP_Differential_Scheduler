/**
 * COMPONENTAGGREGATOR TESTS
 * 
 * Unit tests for componentAggregator.
 * Priority Score: 8.2 (Reliability: 10, ROI: 10, Independence: 4, Cognitive Load: 4)
 * 
 * Tests verify component aggregation logic including recursive component resolution
 * and part instance composition from composed block instances.
 */

import { describe, it, expect } from 'vitest'
import { composePartInstances, getComponentsRecursive } from '@/utils/transformers/componentAggregator'
import type { GlobalData, GlobalRelationship } from '@/utils/transformers/fetchToGlobalTransformer'
import type { InstanceComponent } from '@/types/component'
import type { GlobalEntity } from '@/types/entities'

/**
 * Helper to create a block instance entity
 */
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

/**
 * Helper to create an activeConstituents relationship
 */
function createActiveConstituentsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'activeConstituents',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'partInstance' } as GlobalEntity<'partInstance'>)),
  }
}

/**
 * Helper to create an InstanceComponent
 */
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
      // Arrange
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
          activeConstituents: [
            createActiveConstituentsRel('block-1', ['part-1', 'part-2']),
            createActiveConstituentsRel('block-2', ['part-3', 'part-4']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      // Assert
      expect(result).toHaveLength(4)
      expect(result).toContain('part-1')
      expect(result).toContain('part-2')
      expect(result).toContain('part-3')
      expect(result).toContain('part-4')
    })

    it('should deduplicate part instances when blocks share parts', () => {
      // Arrange
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
          activeConstituents: [
            createActiveConstituentsRel('block-1', ['part-1', 'part-2']),
            createActiveConstituentsRel('block-2', ['part-2', 'part-3']), // part-2 is shared
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      // Assert
      expect(result).toHaveLength(3) // part-1, part-2, part-3 (part-2 deduplicated)
      expect(result).toContain('part-1')
      expect(result).toContain('part-2')
      expect(result).toContain('part-3')
    })

    it('should handle empty composed block IDs array', () => {
      // Arrange
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          activeConstituents: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances([], globalData)
      
      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should skip block IDs that do not exist in globalData', () => {
      // Arrange
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          activeConstituents: [
            createActiveConstituentsRel('block-1', ['part-1']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances(['block-1', 'block-nonexistent'], globalData)
      
      // Assert
      expect(result).toHaveLength(1)
      expect(result).toContain('part-1')
    })

    it('should handle blocks with no part instances', () => {
      // Arrange
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
          activeConstituents: [
            createActiveConstituentsRel('block-1', ['part-1']),
            // block-2 has no activeConstituents
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances(['block-1', 'block-2'], globalData)
      
      // Assert
      expect(result).toHaveLength(1)
      expect(result).toContain('part-1')
    })

    it('should handle empty activeConstituents relationships', () => {
      // Arrange
      const globalData: GlobalData = {
        entities: {
          blockInstance: [createBlockInstance('block-1', 'Block 1')],
          partInstance: [],
          blockShape: [],
          partShape: [],
        },
        relationships: {
          activeConstituents: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validConstituents: [],
          dependentInstanceOptions: [],
        },
      }
      
      // Act
      const result = composePartInstances(['block-1'], globalData)
      
      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })

  describe('getComponentsRecursive', () => {
    it('should get direct components that are not composers', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('composer-1', 'component-2'),
        createInstanceComponent('other-composer', 'component-3'),
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      // component-1 and component-2 are not composers (no children), so they're returned
      expect(result).toHaveLength(2)
      expect(result).toContain('component-1')
      expect(result).toContain('component-2')
      expect(result).not.toContain('component-3')
    })

    it('should get recursive components when components are themselves composers', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'component-2'), // component-1 is also a composer
        createInstanceComponent('component-2', 'component-3'), // component-2 is also a composer
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      // Function returns only leaf components (components that are not composers themselves)
      // component-1 and component-2 are composers, so only component-3 is returned
      expect(result).toHaveLength(1)
      expect(result).toContain('component-3')
      expect(result).not.toContain('component-1') // component-1 is a composer, not returned
      expect(result).not.toContain('component-2') // component-2 is a composer, not returned
    })

    it('should handle circular references by returning empty array', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'composer-1'), // Circular reference
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      // Should detect circular reference and return empty array
      expect(result).toEqual([])
    })

    it('should filter out disabled components', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1', { disabled: false }),
        createInstanceComponent('composer-1', 'component-2', { disabled: true }),
        createInstanceComponent('composer-1', 'component-3', { disabled: false }),
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      expect(result).toHaveLength(2)
      expect(result).toContain('component-1')
      expect(result).toContain('component-3')
      expect(result).not.toContain('component-2')
    })

    it('should return empty array when composer has no components', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('other-composer', 'component-1'),
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle empty instanceComponents array', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = []
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should use visited set to prevent infinite loops', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('component-1', 'component-2'),
        createInstanceComponent('component-2', 'component-1'), // Creates cycle component-1 -> component-2 -> component-1
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      // When component-2 tries to recursively get component-1, it detects the circular reference
      // (component-1 is already in visited set) and returns empty array
      // This causes component-2 to not be added (since it's a composer with no valid components)
      // So the result is empty (no leaf components found due to cycle)
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle complex nested component structure', () => {
      // Arrange
      const instanceComponents: InstanceComponent[] = [
        // composer-1 has component-1 and component-2
        createInstanceComponent('composer-1', 'component-1'),
        createInstanceComponent('composer-1', 'component-2'),
        // component-1 has component-3 and component-4 (component-1 is a composer)
        createInstanceComponent('component-1', 'component-3'),
        createInstanceComponent('component-1', 'component-4'),
        // component-2 has component-5 (component-2 is a composer)
        createInstanceComponent('component-2', 'component-5'),
        // component-3 has component-6 (component-3 is a composer)
        createInstanceComponent('component-3', 'component-6'),
      ]
      
      // Act
      const result = getComponentsRecursive('composer-1', 'blockInstance', instanceComponents)
      
      // Assert
      // Function returns only leaf components (not composers themselves)
      // component-1, component-2, component-3 are composers, so not returned
      // component-4, component-5, component-6 are leaf components
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
