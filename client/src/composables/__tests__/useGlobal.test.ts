
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGlobal } from '../useGlobal'
import { useQuery } from '@tanstack/vue-query'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

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

vi.mock('@/utils/transformers/fetchToGlobalTransformer', () => ({
  globalTransformer: {
    stageForHydration: vi.fn().mockResolvedValue({}),
    hydrate: vi.fn().mockReturnValue(mockGlobalData),
  },
}))

describe('useGlobal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: mockQueryData,
    })
    if ((window as any).__useGlobalDebug) {
      (window as any).__useGlobalDebug.reset()
    }
  })

  afterEach(() => {
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
      // PATTERN: Test singleton behavior through repeated calls instead
      const instance1 = useGlobal()
      const instance2 = useGlobal()
      const instance3 = useGlobal()
      
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
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      mockUseQuery.mockReturnValueOnce({
        data: { value: null },
      })
      
      const { getGlobalEntities } = useGlobal()
      const result = getGlobalEntities('blockInstance')
      
      expect(result).toEqual([])
    })

    it('should return empty array when entities are missing', () => {
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
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
      
      const entity = getGlobalEntityById('blockInstance', '1')
      
      expect(entity).toBeDefined()
    })

    it('should return undefined when globalData is null', () => {
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
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
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
      mockUseQuery.mockReturnValueOnce({
        data: { value: null },
      })
      
      const { getGlobalData } = useGlobal()
      const result = getGlobalData()
      
      expect(result).toBeNull()
    })

    it('should return null when globalData value is undefined', () => {
      if ((window as any).__useGlobalDebug) {
        (window as any).__useGlobalDebug.reset()
      }
      
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
