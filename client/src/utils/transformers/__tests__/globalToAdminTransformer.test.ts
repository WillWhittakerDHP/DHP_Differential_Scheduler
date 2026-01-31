/**
 * GLOBAL TO ADMIN TRANSFORMER TESTS
 * 
 * Unit tests for AdminTransformer class.
 * Tests GlobalData to AdminObject transformation with relationships.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminTransformer } from '../globalToAdminTransformer'
import { createAtomicBlockGlobalData, createCompositeBlockGlobalData } from '../../__tests__/factories/globalDataFactory'

// Mock admin config
vi.mock('@/configs/adminConfig', () => ({
  getAdminConfig: vi.fn(() => ({
    instanceConfig: {
      blockInstance: { isInstanceKey: true },
      partInstance: { isInstanceKey: true },
      blockShape: { isShapeKey: true },
      partShape: { isShapeKey: true },
    },
    formFieldConfig: {},
    displayFieldConfig: {},
  })),
}))

describe('AdminTransformer', () => {
  let transformer: AdminTransformer
  
  beforeEach(() => {
    transformer = new AdminTransformer()
    vi.clearAllMocks()
  })
  
  describe('transformGlobalToAdmin', () => {
    it('should transform atomic block instance', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      expect(result.blockInstance).toHaveLength(1)
      expect(result.partInstance).toHaveLength(2)
      expect(result.blockInstance[0].id).toBe('block-1')
    })
    
    it('should attach partAssignments relationships', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const blockInstance = result.blockInstance[0]
      expect(blockInstance.partAssignments).toBeDefined()
      expect(blockInstance.partAssignments).toHaveLength(2)
      expect(blockInstance.partAssignments).toContain('part-1')
      expect(blockInstance.partAssignments).toContain('part-2')
    })
    
    it('should transform composite block with components', () => {
      const globalData = createCompositeBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const compositeBlock = result.blockInstance.find(b => b.id === 'composite-1')
      expect(compositeBlock).toBeDefined()
      expect(compositeBlock?.instanceComponents).toBeDefined()
      expect(compositeBlock?.instanceComponents).toHaveLength(2)
    })
    
    it('should handle empty GlobalData', () => {
      const globalData = {
        entities: {
          blockInstance: [],
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
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      expect(result.blockInstance).toHaveLength(0)
      expect(result.partInstance).toHaveLength(0)
    })
    
    it('should preserve entity properties', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const partInstance = result.partInstance[0]
      expect(partInstance.id).toBe('part-1')
      expect(partInstance.name).toBe('Interior Inspection')
      expect(partInstance.baseTime).toBe(60)
      expect(partInstance.baseFee).toBe(100)
      expect(partInstance.onSite).toBe(true)
      expect(partInstance.clientPresent).toBe(true)
    })
    
    it('should maintain entity order by orderIndex', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const partInstances = result.partInstance
      expect(partInstances[0].orderIndex).toBeLessThanOrEqual(partInstances[1].orderIndex)
    })
    
    it('should handle relationships for all entity types', () => {
      const globalData = createCompositeBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      // Check that relationships are attached
      const compositeBlock = result.blockInstance.find(b => b.id === 'composite-1')
      const component1 = result.blockInstance.find(b => b.id === 'component-1')
      
      expect(compositeBlock?.instanceComponents).toBeDefined()
      expect(component1?.partAssignments).toBeDefined()
    })
  })
  
  describe('relationship attachment', () => {
    it('should attach empty arrays when no relationships exist', () => {
      const globalData = {
        entities: {
          blockInstance: [
            { id: 'block-1', entityKey: 'blockInstance', name: 'Block 1', disabled: false, orderIndex: 1 } as any,
          ],
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
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const blockInstance = result.blockInstance[0]
      expect(blockInstance.partAssignments).toEqual([])
      expect(blockInstance.bookingCascades).toEqual([])
      expect(blockInstance.instanceComponents).toEqual([])
    })
    
    it('should handle multiple relationships to same entity', () => {
      const globalData = createCompositeBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const component2 = result.blockInstance.find(b => b.id === 'component-2')
      expect(component2?.partAssignments).toHaveLength(2) // part-2 and part-3
    })
  })
  
  describe('data integrity', () => {
    it('should not mutate original GlobalData', () => {
      const globalData = createAtomicBlockGlobalData()
      const originalBlockCount = globalData.entities.blockInstance.length
      
      transformer.transformGlobalToAdmin(globalData)
      
      expect(globalData.entities.blockInstance.length).toBe(originalBlockCount)
    })
    
    it('should return plain objects (not class instances)', () => {
      const globalData = createAtomicBlockGlobalData()
      
      const result = transformer.transformGlobalToAdmin(globalData)
      
      const blockInstance = result.blockInstance[0]
      expect(blockInstance.constructor.name).toBe('Object')
    })
  })
})

