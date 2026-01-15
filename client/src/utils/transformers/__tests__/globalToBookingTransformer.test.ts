/**
 * GLOBAL TO BOOKING TRANSFORMER TESTS
 * 
 * Unit tests for the globalToBookingTransformer.
 * Tests transformation of GlobalData to booking-optimized format, including:
 * - Atomic block instances with activeParts
 * - Composite block instances merging own parts with component parts
 * - Deduplication to prevent double-counting parts
 * - Filtering of disabled entities and components
 * - Sorting by orderIndex
 */

import { describe, it, expect } from 'vitest'
import { bookingTransformer } from '../globalToBookingTransformer'
import type { GlobalData, GlobalRelationship } from '../fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'

// ===================================================================
// TEST DATA SETUP
// ===================================================================

/**
 * Helper to create a block instance entity
 */
function createBlockInstance(
  id: string,
  name: string,
  options: {
    composite?: boolean
    disabled?: boolean
    orderIndex?: number
    blockShapeRef?: string
    baseSqFt?: number
    description?: string
    icon?: string
    active?: boolean
  } = {}
): GlobalEntity<'blockInstance'> {
  return {
    id,
    entityKey: 'blockInstance',
    name,
    disabled: options.disabled ?? false,
    orderIndex: options.orderIndex ?? 0,
    active: options.active ?? true,
    ...(options.composite !== undefined && { composite: options.composite }),
    ...(options.blockShapeRef && { blockShapeRef: options.blockShapeRef }),
    ...(options.baseSqFt !== undefined && { baseSqFt: options.baseSqFt }),
    ...(options.description && { description: options.description }),
    ...(options.icon && { icon: options.icon }),
  } as GlobalEntity<'blockInstance'>
}

/**
 * Helper to create a part instance entity
 */
function createPartInstance(
  id: string,
  name: string,
  options: {
    disabled?: boolean
    orderIndex?: number
    partShapeRef?: string
    onSite?: boolean
    clientPresent?: boolean
    moveable?: boolean
    baseTime?: number
    rateOverBaseTime?: number
    baseFee?: number
    rateOverBaseFee?: number
  } = {}
): GlobalEntity<'partInstance'> {
  return {
    id,
    entityKey: 'partInstance',
    name,
    disabled: options.disabled ?? false,
    orderIndex: options.orderIndex ?? 0,
    ...(options.partShapeRef && { partShapeRef: options.partShapeRef }),
    ...(options.onSite !== undefined && { onSite: options.onSite }),
    ...(options.clientPresent !== undefined && { clientPresent: options.clientPresent }),
    ...(options.moveable !== undefined && { moveable: options.moveable }),
    ...(options.baseTime !== undefined && { baseTime: options.baseTime }),
    ...(options.rateOverBaseTime !== undefined && { rateOverBaseTime: options.rateOverBaseTime }),
    ...(options.baseFee !== undefined && { baseFee: options.baseFee }),
    ...(options.rateOverBaseFee !== undefined && { rateOverBaseFee: options.rateOverBaseFee }),
  } as GlobalEntity<'partInstance'>
}

/**
 * Helper to create a block shape entity
 */
function createBlockShape(id: string, name: string): GlobalEntity<'blockShape'> {
  return {
    id,
    entityKey: 'blockShape',
    name,
    disabled: false,
    orderIndex: 0,
  } as GlobalEntity<'blockShape'>
}

/**
 * Helper to create a part shape entity
 */
function createPartShape(id: string, name: string): GlobalEntity<'partShape'> {
  return {
    id,
    entityKey: 'partShape',
    name,
    disabled: false,
    orderIndex: 0,
  } as GlobalEntity<'partShape'>
}

/**
 * Helper to create an activeParts relationship
 */
function createActivePartsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'activeParts',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'partInstance' } as GlobalEntity<'partInstance'>)),
  }
}

/**
 * Helper to create an instanceComponents relationship
 */
function createActiveComponentsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'instanceComponents',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>)),
  }
}

// ===================================================================
// TESTS
// ===================================================================

describe('BookingTransformer', () => {
  describe('transformGlobalToBooking', () => {
    it('should transform atomic block instance with activeParts', () => {
      // Setup: Atomic block instance with parts
      const blockInstance = createBlockInstance('block-1', 'Atomic Block', {
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 1,
      })
      const partInstance2 = createPartInstance('part-2', 'Part 2', {
        partShapeRef: 'part-shape-2',
        orderIndex: 2,
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')
      const partShape2 = createPartShape('part-shape-2', 'Part Shape 2')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [blockInstance],
          partInstance: [partInstance1, partInstance2],
          blockShape: [blockShape],
          partShape: [partShape1, partShape2],
        },
        relationships: {
          activeParts: [
            createActivePartsRel('block-1', ['part-1', 'part-2']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances).toHaveLength(1)
      expect(result.blockInstances[0].id).toBe('block-1')
      expect(result.blockInstances[0].name).toBe('Atomic Block')
      expect(result.blockInstances[0].blockShape).toBe('Block Shape 1')
      expect(result.blockInstances[0].partInstances).toHaveLength(2)
      expect(result.blockInstances[0].partInstances[0].id).toBe('part-1')
      expect(result.blockInstances[0].partInstances[1].id).toBe('part-2')
    })

    it('should transform composite block instance with only own activeParts', () => {
      // Setup: Composite block instance with its own parts (no components)
      const compositeBlock = createBlockInstance('composite-1', 'Composite Block', {
        composite: true,
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 1,
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [compositeBlock],
          partInstance: [partInstance1],
          blockShape: [blockShape],
          partShape: [partShape1],
        },
        relationships: {
          activeParts: [
            createActivePartsRel('composite-1', ['part-1']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances).toHaveLength(1)
      expect(result.blockInstances[0].id).toBe('composite-1')
      expect(result.blockInstances[0].partInstances).toHaveLength(1)
      expect(result.blockInstances[0].partInstances[0].id).toBe('part-1')
    })

    it('should transform composite block instance with only component parts', () => {
      // Setup: Composite block instance with components that have parts
      const compositeBlock = createBlockInstance('composite-1', 'Composite Block', {
        composite: true,
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const component1 = createBlockInstance('component-1', 'Component 1', {
        blockShapeRef: 'shape-2',
        orderIndex: 1,
      })
      const component2 = createBlockInstance('component-2', 'Component 2', {
        blockShapeRef: 'shape-3',
        orderIndex: 2,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 1,
      })
      const partInstance2 = createPartInstance('part-2', 'Part 2', {
        partShapeRef: 'part-shape-2',
        orderIndex: 2,
      })
      const blockShape1 = createBlockShape('shape-1', 'Block Shape 1')
      const blockShape2 = createBlockShape('shape-2', 'Block Shape 2')
      const blockShape3 = createBlockShape('shape-3', 'Block Shape 3')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')
      const partShape2 = createPartShape('part-shape-2', 'Part Shape 2')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [compositeBlock, component1, component2],
          partInstance: [partInstance1, partInstance2],
          blockShape: [blockShape1, blockShape2, blockShape3],
          partShape: [partShape1, partShape2],
        },
        relationships: {
          activeParts: [
            createActivePartsRel('component-1', ['part-1']),
            createActivePartsRel('component-2', ['part-2']),
          ],
          bookingCascades: [],
          instanceComponents: [
            createActiveComponentsRel('composite-1', ['component-1', 'component-2']),
          ],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      // Composite should appear with merged component parts
      expect(result.blockInstances).toHaveLength(1)
      expect(result.blockInstances[0].id).toBe('composite-1')
      expect(result.blockInstances[0].partInstances).toHaveLength(2)
      expect(result.blockInstances[0].partInstances[0].id).toBe('part-1')
      expect(result.blockInstances[0].partInstances[1].id).toBe('part-2')

      // Components should be filtered out (not appear in scheduler)
      const componentIds = result.blockInstances.map(b => b.id)
      expect(componentIds).not.toContain('component-1')
      expect(componentIds).not.toContain('component-2')
    })

    it('should merge composite own parts with component parts and deduplicate', () => {
      // Setup: Composite block instance with:
      // - Own part: part-1
      // - Component 1 has: part-1 (duplicate), part-2
      // - Component 2 has: part-2 (duplicate), part-3
      // Expected: part-1, part-2, part-3 (no duplicates)
      const compositeBlock = createBlockInstance('composite-1', 'Composite Block', {
        composite: true,
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const component1 = createBlockInstance('component-1', 'Component 1', {
        blockShapeRef: 'shape-2',
        orderIndex: 1,
      })
      const component2 = createBlockInstance('component-2', 'Component 2', {
        blockShapeRef: 'shape-3',
        orderIndex: 2,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 1,
      })
      const partInstance2 = createPartInstance('part-2', 'Part 2', {
        partShapeRef: 'part-shape-2',
        orderIndex: 2,
      })
      const partInstance3 = createPartInstance('part-3', 'Part 3', {
        partShapeRef: 'part-shape-3',
        orderIndex: 3,
      })
      const blockShape1 = createBlockShape('shape-1', 'Block Shape 1')
      const blockShape2 = createBlockShape('shape-2', 'Block Shape 2')
      const blockShape3 = createBlockShape('shape-3', 'Block Shape 3')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')
      const partShape2 = createPartShape('part-shape-2', 'Part Shape 2')
      const partShape3 = createPartShape('part-shape-3', 'Part Shape 3')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [compositeBlock, component1, component2],
          partInstance: [partInstance1, partInstance2, partInstance3],
          blockShape: [blockShape1, blockShape2, blockShape3],
          partShape: [partShape1, partShape2, partShape3],
        },
        relationships: {
          activeParts: [
            // Composite's own parts
            createActivePartsRel('composite-1', ['part-1']),
            // Component 1 parts (includes duplicate part-1)
            createActivePartsRel('component-1', ['part-1', 'part-2']),
            // Component 2 parts (includes duplicate part-2)
            createActivePartsRel('component-2', ['part-2', 'part-3']),
          ],
          bookingCascades: [],
          instanceComponents: [
            createActiveComponentsRel('composite-1', ['component-1', 'component-2']),
          ],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      // Should have exactly 3 unique parts (no duplicates)
      expect(result.blockInstances).toHaveLength(1)
      expect(result.blockInstances[0].id).toBe('composite-1')
      expect(result.blockInstances[0].partInstances).toHaveLength(3)
      
      // Verify all parts are present
      const partIds = result.blockInstances[0].partInstances.map(p => p.id)
      expect(partIds).toContain('part-1')
      expect(partIds).toContain('part-2')
      expect(partIds).toContain('part-3')
      
      // Verify no duplicates (each part ID appears exactly once)
      const partIdSet = new Set(partIds)
      expect(partIdSet.size).toBe(3)
      expect(partIds.length).toBe(3)
    })

    it('should sort part instances by orderIndex', () => {
      // Setup: Parts with different orderIndex values
      const blockInstance = createBlockInstance('block-1', 'Block', {
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 3, // Should be last
      })
      const partInstance2 = createPartInstance('part-2', 'Part 2', {
        partShapeRef: 'part-shape-2',
        orderIndex: 1, // Should be first
      })
      const partInstance3 = createPartInstance('part-3', 'Part 3', {
        partShapeRef: 'part-shape-3',
        orderIndex: 2, // Should be middle
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')
      const partShape2 = createPartShape('part-shape-2', 'Part Shape 2')
      const partShape3 = createPartShape('part-shape-3', 'Part Shape 3')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [blockInstance],
          partInstance: [partInstance1, partInstance2, partInstance3],
          blockShape: [blockShape],
          partShape: [partShape1, partShape2, partShape3],
        },
        relationships: {
          activeParts: [
            createActivePartsRel('block-1', ['part-1', 'part-2', 'part-3']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances[0].partInstances).toHaveLength(3)
      expect(result.blockInstances[0].partInstances[0].id).toBe('part-2') // orderIndex 1
      expect(result.blockInstances[0].partInstances[1].id).toBe('part-3') // orderIndex 2
      expect(result.blockInstances[0].partInstances[2].id).toBe('part-1') // orderIndex 3
    })

    it('should filter out disabled part instances', () => {
      // Setup: Block instance with enabled and disabled parts
      const blockInstance = createBlockInstance('block-1', 'Block', {
        blockShapeRef: 'shape-1',
        orderIndex: 1,
      })
      const partInstance1 = createPartInstance('part-1', 'Part 1', {
        partShapeRef: 'part-shape-1',
        orderIndex: 1,
        disabled: false,
      })
      const partInstance2 = createPartInstance('part-2', 'Part 2', {
        partShapeRef: 'part-shape-2',
        orderIndex: 2,
        disabled: true, // Should be filtered out
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')
      const partShape1 = createPartShape('part-shape-1', 'Part Shape 1')
      const partShape2 = createPartShape('part-shape-2', 'Part Shape 2')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [blockInstance],
          partInstance: [partInstance1, partInstance2],
          blockShape: [blockShape],
          partShape: [partShape1, partShape2],
        },
        relationships: {
          activeParts: [
            createActivePartsRel('block-1', ['part-1', 'part-2']),
          ],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances[0].partInstances).toHaveLength(1)
      expect(result.blockInstances[0].partInstances[0].id).toBe('part-1')
      expect(result.blockInstances[0].partInstances[0].disabled).toBe(false)
    })

    it('should filter out disabled block instances', () => {
      // Setup: Enabled and disabled block instances
      const blockInstance1 = createBlockInstance('block-1', 'Block 1', {
        blockShapeRef: 'shape-1',
        orderIndex: 1,
        disabled: false,
      })
      const blockInstance2 = createBlockInstance('block-2', 'Block 2', {
        blockShapeRef: 'shape-1',
        orderIndex: 2,
        disabled: true, // Should be filtered out
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [blockInstance1, blockInstance2],
          partInstance: [],
          blockShape: [blockShape],
          partShape: [],
        },
        relationships: {
          activeParts: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances).toHaveLength(1)
      expect(result.blockInstances[0].id).toBe('block-1')
    })

    it('should sort block instances by orderIndex', () => {
      // Setup: Block instances with different orderIndex values
      const blockInstance1 = createBlockInstance('block-1', 'Block 1', {
        blockShapeRef: 'shape-1',
        orderIndex: 3, // Should be last
      })
      const blockInstance2 = createBlockInstance('block-2', 'Block 2', {
        blockShapeRef: 'shape-1',
        orderIndex: 1, // Should be first
      })
      const blockInstance3 = createBlockInstance('block-3', 'Block 3', {
        blockShapeRef: 'shape-1',
        orderIndex: 2, // Should be middle
      })
      const blockShape = createBlockShape('shape-1', 'Block Shape 1')

      const globalData: GlobalData = {
        entities: {
          blockInstance: [blockInstance1, blockInstance2, blockInstance3],
          partInstance: [],
          blockShape: [blockShape],
          partShape: [],
        },
        relationships: {
          activeParts: [],
          bookingCascades: [],
          instanceComponents: [],
          validCascades: [],
          validParts: [],
          dependentInstanceOptions: [],
        },
      }

      const result = bookingTransformer.transformGlobalToBooking(globalData)

      expect(result.blockInstances).toHaveLength(3)
      expect(result.blockInstances[0].id).toBe('block-2') // orderIndex 1
      expect(result.blockInstances[1].id).toBe('block-3') // orderIndex 2
      expect(result.blockInstances[2].id).toBe('block-1') // orderIndex 3
    })
  })
})

