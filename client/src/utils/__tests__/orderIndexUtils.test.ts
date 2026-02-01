
import { describe, it, expect } from 'vitest'
import { normalizeOrderIndices, sortByOrderIndex, updateOrderAfterDragDrop } from '../orderIndexUtils'
import { createBlockInstance } from './factories/entityFactory'

describe('orderIndexUtils', () => {
  describe('normalizeOrderIndices', () => {
    it('should normalize orderIndex values to sequential (0, 1, 2, 3...)', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 5 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 10 }),
        createBlockInstance('block-3', 'Block 3', { orderIndex: 15 }),
      ]
      
      const normalized = normalizeOrderIndices(entities)
      
      expect(normalized[0].orderIndex).toBe(0)
      expect(normalized[1].orderIndex).toBe(1)
      expect(normalized[2].orderIndex).toBe(2)
    })

    it('should not mutate original array', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 5 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 10 }),
      ]
      
      const originalOrderIndexes = entities.map(e => e.orderIndex)
      normalizeOrderIndices(entities)
      
      expect(entities[0].orderIndex).toBe(originalOrderIndexes[0])
      expect(entities[1].orderIndex).toBe(originalOrderIndexes[1])
    })

    it('should handle empty array', () => {
      const normalized = normalizeOrderIndices([])
      expect(normalized).toEqual([])
    })

    it('should handle single item', () => {
      const entities = [createBlockInstance('block-1', 'Block 1', { orderIndex: 5 })]
      
      const normalized = normalizeOrderIndices(entities)
      
      expect(normalized).toHaveLength(1)
      expect(normalized[0].orderIndex).toBe(0)
    })

    it('should preserve other entity properties', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 5, name: 'Custom Name' }),
      ]
      
      const normalized = normalizeOrderIndices(entities)
      
      expect(normalized[0].id).toBe('block-1')
      expect(normalized[0].name).toBe('Custom Name')
      expect(normalized[0].orderIndex).toBe(0)
    })
  })

  describe('sortByOrderIndex', () => {
    it('should sort entities by orderIndex ascending', () => {
      const entities = [
        createBlockInstance('block-3', 'Block 3', { orderIndex: 2 }),
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
      ]
      
      const sorted = sortByOrderIndex(entities)
      
      expect(sorted[0].id).toBe('block-1')
      expect(sorted[1].id).toBe('block-2')
      expect(sorted[2].id).toBe('block-3')
    })

    it('should not mutate original array', () => {
      const entities = [
        createBlockInstance('block-3', 'Block 3', { orderIndex: 2 }),
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
      ]
      
      const originalIds = entities.map(e => e.id)
      sortByOrderIndex(entities)
      
      expect(entities[0].id).toBe(originalIds[0])
      expect(entities[1].id).toBe(originalIds[1])
    })

    it('should handle null/undefined orderIndex as 0', () => {
      const entities = [
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
        createBlockInstance('block-1', 'Block 1', { orderIndex: null as any }),
      ]
      
      const sorted = sortByOrderIndex(entities)
      
      expect(sorted[0].id).toBe('block-1')
      expect(sorted[1].id).toBe('block-2')
    })

    it('should handle empty array', () => {
      const sorted = sortByOrderIndex([])
      expect(sorted).toEqual([])
    })

    it('should handle single item', () => {
      const entities = [createBlockInstance('block-1', 'Block 1', { orderIndex: 5 })]
      
      const sorted = sortByOrderIndex(entities)
      
      expect(sorted).toHaveLength(1)
      expect(sorted[0].id).toBe('block-1')
    })

    it('should preserve entity properties', () => {
      const entities = [
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
      ]
      
      const sorted = sortByOrderIndex(entities)
      
      expect(sorted[0].name).toBe('Block 1')
      expect(sorted[1].name).toBe('Block 2')
    })
  })

  describe('updateOrderAfterDragDrop', () => {
    it('should reorder entities and normalize indices', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
        createBlockInstance('block-3', 'Block 3', { orderIndex: 2 }),
      ]
      
      const reordered = updateOrderAfterDragDrop(entities, 0, 2)
      
      expect(reordered[0].id).toBe('block-2')
      expect(reordered[1].id).toBe('block-3')
      expect(reordered[2].id).toBe('block-1')
      
      expect(reordered[0].orderIndex).toBe(0)
      expect(reordered[1].orderIndex).toBe(1)
      expect(reordered[2].orderIndex).toBe(2)
    })

    it('should handle moving item forward', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
        createBlockInstance('block-3', 'Block 3', { orderIndex: 2 }),
      ]
      
      const reordered = updateOrderAfterDragDrop(entities, 1, 0)
      
      expect(reordered[0].id).toBe('block-2')
      expect(reordered[1].id).toBe('block-1')
      expect(reordered[2].id).toBe('block-3')
    })

    it('should handle moving item backward', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
        createBlockInstance('block-3', 'Block 3', { orderIndex: 2 }),
      ]
      
      const reordered = updateOrderAfterDragDrop(entities, 0, 2)
      
      expect(reordered[0].id).toBe('block-2')
      expect(reordered[1].id).toBe('block-3')
      expect(reordered[2].id).toBe('block-1')
    })

    it('should not mutate original array', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1 }),
      ]
      
      const originalIds = entities.map(e => e.id)
      updateOrderAfterDragDrop(entities, 0, 1)
      
      expect(entities[0].id).toBe(originalIds[0])
      expect(entities[1].id).toBe(originalIds[1])
    })

    it('should handle single item', () => {
      const entities = [createBlockInstance('block-1', 'Block 1', { orderIndex: 0 })]
      
      const reordered = updateOrderAfterDragDrop(entities, 0, 0)
      
      expect(reordered).toHaveLength(1)
      expect(reordered[0].id).toBe('block-1')
      expect(reordered[0].orderIndex).toBe(0)
    })

    it('should preserve entity properties', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 0, name: 'Custom 1' }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 1, name: 'Custom 2' }),
      ]
      
      const reordered = updateOrderAfterDragDrop(entities, 0, 1)
      
      expect(reordered[0].name).toBe('Custom 2')
      expect(reordered[1].name).toBe('Custom 1')
    })

    it('should normalize indices after reordering', () => {
      const entities = [
        createBlockInstance('block-1', 'Block 1', { orderIndex: 10 }),
        createBlockInstance('block-2', 'Block 2', { orderIndex: 20 }),
        createBlockInstance('block-3', 'Block 3', { orderIndex: 30 }),
      ]
      
      const reordered = updateOrderAfterDragDrop(entities, 0, 2)
      
      expect(reordered[0].orderIndex).toBe(0)
      expect(reordered[1].orderIndex).toBe(1)
      expect(reordered[2].orderIndex).toBe(2)
    })
  })
})

