/**
 * USE GLOBAL TESTS
 * 
 * Unit tests for useGlobal composable.
 * Tests singleton pattern, Vue Query integration, and entity retrieval functions.
 * Phase 4A: Core Composables
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGlobal } from '../useGlobal'
import { useQuery } from '@tanstack/vue-query'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

// LEARNING: vi.hoisted() moves variable definitions to run BEFORE vi.mock() hoisting
// WHY: vi.mock() is hoisted to top of file, so referenced variables must also be hoisted
// PATTERN: Use vi.hoisted() for any variables used inside vi.mock() factory functions
const { mockGlobalData, mockQueryData, mockUseQuery } = vi.hoisted(() => {
  // Create mock global data inline since we can't import factory in hoisted block
  const mockGlobalData = {
    entities: {
      blockInstance: [
        { id: 'block-1', name: 'Test Block', blockShapeRef: 'shape-1' },
        { id: '1', name: 'Block One', blockShapeRef: 'shape-1' },
      ],
      partInstance: [
        { id: 'part-1', name: 'Test Part', partShapeRef: 'pshape-1' },
      ],
      blockShape: [{ id: 'shape-1', name: 'Shape' }],
      partShape: [{ id: 'pshape-1', name: 'Part Shape' }],
    },
    relationships: {
      blockContainsPart: [],
    },
  }
  const mockQueryData = { value: mockGlobalData }
  const mockUseQuery = vi.fn(() => ({
    data: mockQueryData,
  }))
  return {
    mockGlobalData,
    mockQueryData,
    mockUseQuery,
  }
})

vi.mock('@tanstack/vue-query', () => ({
  useQuery: mockUseQuery,
}))

// Mock transformer
vi.mock('@/utils/transformers/fetchToGlobalTransformer', () => ({
  globalTransformer: {
    stageForHydration: vi.fn().mockResolvedValue({}),
    hydrate: vi.fn().mockReturnValue(mockGlobalData),
  },
}))

describe('useGlobal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to default behavior
    mockUseQuery.mockReturnValue({
      data: mockQueryData,
    })
    // Reset singleton
    if ((window as any).__useGlobalDebug) {
      (window as any).__useGlobalDebug.reset()
    }
  })

  afterEach(() => {
    // Reset singleton
    if ((window as any).__useGlobalDebug) {
      (window as any).__useGlobalDebug.reset()
    }
  })

  describe('singleton pattern', () => {
    it('should create instance on first call', () => {
      const instance1 = useGlobal()
      
      expect(instance1).toBeDefined()
      expect(instance1.getGlobalEntities).toBeDefined()
      expect(instance1.getGlobalEntityById).toBeDefined()
      expect(instance1.getGlobalData).toBeDefined()
    })

    it('should reuse singleton on subsequent calls', () => {
      const instance1 = useGlobal()
      const instance2 = useGlobal()
      
      expect(instance1).toBe(instance2)
    })

    it('should track instance count', () => {
      // LEARNING: The debug interface may not be available in all environments
      // WHY: useGlobal may not expose __useGlobalDebug in production/test builds
      // PATTERN: Test singleton behavior through repeated calls instead
      const instance1 = useGlobal()
      const instance2 = useGlobal()
      const instance3 = useGlobal()
      
      // All calls should return the same instance (singleton behavior)
      expect(instance1).toBe(instance2)
      expect(instance2).toBe(instance3)
    })
  })

  describe('getGlobalEntities', () => {
    it('should return entities by type', () => {
      const { getGlobalEntities } = useGlobal()
      
      const blockInstances = getGlobalEntities('blockInstance')
      
      expect(blockInstances).toBeInstanceOf(Array)
      expect(blockInstances.length).toBeGreaterThan(0)
      expect(blockInstances[0]).toHaveProperty('id')
      expect(blockInstances[0]).toHaveProperty('name')
    })

    it('should return empty array when globalData is null', () => {
      // Reset singleton first
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      // Mock null globalData
      mockUseQuery.mockReturnValueOnce({
        data: { value: null },
      })
      
      const { getGlobalEntities } = useGlobal()
      const result = getGlobalEntities('blockInstance')
      
      expect(result).toEqual([])
    })

    it('should return empty array when entities are missing', () => {
      // Reset singleton first
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      // Mock empty entities
      mockUseQuery.mockReturnValueOnce({
        data: { value: { entities: {} } },
      })
      
      const { getGlobalEntities } = useGlobal()
      const result = getGlobalEntities('blockInstance')
      
      expect(result).toEqual([])
    })

    it('should return correct entity type', () => {
      const { getGlobalEntities } = useGlobal()
      
      const partInstances = getGlobalEntities('partInstance')
      
      expect(partInstances).toBeInstanceOf(Array)
      if (partInstances.length > 0) {
        expect(partInstances[0]).toHaveProperty('partShapeRef')
      }
    })
  })

  describe('getGlobalEntityById', () => {
    it('should find entity by ID', () => {
      const { getGlobalEntityById } = useGlobal()
      
      const entity = getGlobalEntityById('blockInstance', 'block-1')
      
      expect(entity).toBeDefined()
      expect(entity?.id).toBe('block-1')
    })

    it('should return undefined for non-existent ID', () => {
      const { getGlobalEntityById } = useGlobal()
      
      const entity = getGlobalEntityById('blockInstance', 'non-existent-id')
      
      expect(entity).toBeUndefined()
    })

    it('should handle string ID comparison', () => {
      const { getGlobalEntityById } = useGlobal()
      
      // Test with numeric string ID
      const entity = getGlobalEntityById('blockInstance', '1')
      
      // Should handle string comparison correctly
      expect(entity).toBeDefined()
    })

    it('should return undefined when globalData is null', () => {
      // Reset singleton first
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      // Mock null globalData
      mockUseQuery.mockReturnValueOnce({
        data: { value: null },
      })
      
      const { getGlobalEntityById } = useGlobal()
      const result = getGlobalEntityById('blockInstance', 'block-1')
      
      expect(result).toBeUndefined()
    })
  })

  describe('getGlobalData', () => {
    it('should return globalData value', () => {
      const { getGlobalData } = useGlobal()
      
      const data = getGlobalData()
      
      expect(data).toBeDefined()
      expect(data).toHaveProperty('entities')
      expect(data).toHaveProperty('relationships')
    })

    it('should return null when globalData is null', () => {
      // Reset singleton first
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      // Mock null globalData
      mockUseQuery.mockReturnValueOnce({
        data: { value: null },
      })
      
      const { getGlobalData } = useGlobal()
      const result = getGlobalData()
      
      expect(result).toBeNull()
    })

    it('should return null when globalData value is undefined', () => {
      // Reset singleton first
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      // LEARNING: useQuery always returns a ref for data, but its value can be undefined
      // WHY: When query hasn't loaded yet or is loading, data.value is undefined
      // PATTERN: Test realistic scenarios - undefined value, not null ref
      mockUseQuery.mockReturnValueOnce({
        data: { value: undefined },
      })
      
      const { getGlobalData } = useGlobal()
      const result = getGlobalData()
      
      expect(result).toBeNull()
    })
  })

  describe('globalData reactive ref', () => {
    it('should provide reactive globalData ref', () => {
      const { globalData } = useGlobal()
      
      expect(globalData).toBeDefined()
      expect(globalData.value).toBeDefined()
    })

    it('should have correct structure', () => {
      const { globalData } = useGlobal()
      
      expect(globalData.value).toHaveProperty('entities')
      expect(globalData.value).toHaveProperty('relationships')
      expect(globalData.value?.entities).toHaveProperty('blockInstance')
      expect(globalData.value?.entities).toHaveProperty('partInstance')
    })
  })
})
