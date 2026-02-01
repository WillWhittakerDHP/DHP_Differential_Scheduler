
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useComponentEntity } from '../useComponentEntity'
import { useGlobal } from '../useGlobal'
import { useQueryClient } from '@tanstack/vue-query'
import apiClient, { getRelationshipEndpoint, getRelationshipByParentChildEndpoint } from '@/utils/api'
import { createMultipleBlocksGlobalData } from '@/utils/__tests__/factories/globalDataFactory'
import { createActiveComponentsRel } from '@/utils/__tests__/factories/relationshipFactory'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

const mockQueryClient = {
  refetchQueries: vi.fn(),
}

vi.mock('@tanstack/vue-query', () => ({
  useMutation: vi.fn((config) => ({
    mutate: vi.fn(),
    mutateAsync: config.mutationFn,
    isLoading: false,
    isError: false,
    error: null,
  })),
  useQueryClient: vi.fn(() => mockQueryClient),
}))

const mockGlobalData = createMultipleBlocksGlobalData(3)
const componentRel = createActiveComponentsRel('block-1', ['block-2', 'block-3'])
mockGlobalData.relationships.instanceComponents = [componentRel]

vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: {
      value: mockGlobalData,
    },
    getGlobalData: vi.fn(() => mockGlobalData),
  })),
}))

vi.mock('@/utils/transformers/relationshipTransformers', () => ({
  getComposedEntityFromRelationships: vi.fn((composerId, entityKey, relationships, entities) => {
    return entities.blockInstance?.find((e: any) => e.id === composerId) || null
  }),
  getComponentsRecursive: vi.fn((composerId, entityKey, relationships) => {
    const rel = relationships.find((r: any) => r.parent.id === composerId)
    return rel ? rel.children.map((c: any) => c.id) : []
  }),
}))

vi.mock('@/utils/api', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
  getRelationshipEndpoint: vi.fn((key) => `/api/relationships/${key}`),
  getRelationshipByParentChildEndpoint: vi.fn((key, parentId, childId) => 
    `/api/relationships/${key}/${parentId}/${childId}`
  ),
}))

describe('useComponentEntity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGlobalData.relationships.instanceComponents = [componentRel]
  })

  describe('instanceComponents computed', () => {
    it('should return active components from globalData', () => {
      const { instanceComponents } = useComponentEntity('blockInstance')
      
      expect(instanceComponents.value).toBeInstanceOf(Array)
      expect(instanceComponents.value.length).toBeGreaterThan(0)
    })

    it('should transform GlobalRelationship to ActiveComponent format', () => {
      const { instanceComponents } = useComponentEntity('blockInstance')
      
      const component = instanceComponents.value[0]
      
      expect(component).toHaveProperty('id')
      expect(component).toHaveProperty('parentId')
      expect(component).toHaveProperty('childId')
      expect(component).toHaveProperty('orderIndex')
    })

    it('should return empty array when globalData is null', () => {
      vi.mocked(useGlobal).mockReturnValueOnce({
        globalData: { value: null },
        getGlobalData: vi.fn(() => null),
      } as any)
      
      const { instanceComponents } = useComponentEntity('blockInstance')
      
      expect(instanceComponents.value).toEqual([])
    })

    it('should filter by instanceComponents relationship kind', () => {
      const { instanceComponents } = useComponentEntity('blockInstance')
      
      instanceComponents.value.forEach(comp => {
        expect(comp).toHaveProperty('parentId')
        expect(comp).toHaveProperty('childId')
      })
    })
  })

  describe('canBeComposed', () => {
    it('should return false for non-blockInstance entity types', () => {
      const { canBeComposed } = useComponentEntity('partInstance')
      
      expect(canBeComposed('part-1')).toBe(false)
    })

    it('should return false when globalData is null', () => {
      vi.mocked(useGlobal).mockReturnValueOnce({
        globalData: { value: null },
        getGlobalData: vi.fn(() => null),
      } as any)
      
      const { canBeComposed } = useComponentEntity('blockInstance')
      
      expect(canBeComposed('block-1')).toBe(false)
    })

    it('should return false when blockInstance not found', () => {
      const { canBeComposed } = useComponentEntity('blockInstance')
      
      expect(canBeComposed('non-existent')).toBe(false)
    })

    it('should return true when BlockShape is composable', () => {
      const blockInstance = mockGlobalData.entities.blockInstance[0]
      const blockShape = mockGlobalData.entities.blockShape.find(
        (bs: any) => bs.id === blockInstance.blockShapeRef
      )
      if (blockShape) {
        (blockShape as any).composable = true
      }
      
      const { canBeComposed } = useComponentEntity('blockInstance')
      
      expect(canBeComposed(blockInstance.id)).toBe(true)
    })
  })

  describe('getAvailableComponents', () => {
    it('should return empty array for non-blockInstance entity types', () => {
      const { getAvailableComponents } = useComponentEntity('partInstance')
      
      expect(getAvailableComponents('part-1')).toEqual([])
    })

    it('should return empty array when composer not found', () => {
      const { getAvailableComponents } = useComponentEntity('blockInstance')
      
      expect(getAvailableComponents('non-existent')).toEqual([])
    })

    it('should filter out composer itself', () => {
      const { getAvailableComponents } = useComponentEntity('blockInstance')
      
      const available = getAvailableComponents('block-1')
      
      expect(available.every((comp: any) => comp.id !== 'block-1')).toBe(true)
    })

    it('should filter out existing components', () => {
      const { getAvailableComponents } = useComponentEntity('blockInstance')
      
      const available = getAvailableComponents('block-1')
      
      expect(available.every((comp: any) => comp.id !== 'block-2')).toBe(true)
      expect(available.every((comp: any) => comp.id !== 'block-3')).toBe(true)
    })

    it('should only return components with same blockShapeRef', () => {
      const { getAvailableComponents } = useComponentEntity('blockInstance')
      
      const available = getAvailableComponents('block-1')
      
      const composer = mockGlobalData.entities.blockInstance.find((b: any) => b.id === 'block-1')
      if (composer) {
        available.forEach((comp: any) => {
          expect(comp.blockShapeRef).toBe(composer.blockShapeRef)
        })
      }
    })
  })

  describe('getComponents', () => {
    it('should return components for a composer', () => {
      const { getComponents } = useComponentEntity('blockInstance')
      
      const components = getComponents('block-1')
      
      expect(components).toBeInstanceOf(Array)
      expect(components.length).toBe(2) // block-2 and block-3
    })

    it('should filter by parentId', () => {
      const { getComponents } = useComponentEntity('blockInstance')
      
      const components = getComponents('block-1')
      
      components.forEach(comp => {
        expect(comp.parentId).toBe('block-1')
      })
    })

    it('should exclude disabled components', () => {
      const { getComponents } = useComponentEntity('blockInstance')
      
      const components = getComponents('block-1')
      
      components.forEach(comp => {
        expect(comp.disabled).toBe(false)
      })
    })

    it('should return empty array when no components exist', () => {
      mockGlobalData.relationships.instanceComponents = []
      
      const { getComponents } = useComponentEntity('blockInstance')
      
      expect(getComponents('block-1')).toEqual([])
    })
  })

  describe('isComponent', () => {
    it('should return false for non-blockInstance entity types', () => {
      const { isComponent } = useComponentEntity('partInstance')
      
      expect(isComponent('part-1')).toBe(false)
    })

    it('should return true when entity is a component', () => {
      const { isComponent } = useComponentEntity('blockInstance')
      
      expect(isComponent('block-2')).toBe(true)
      expect(isComponent('block-3')).toBe(true)
    })

    it('should return false when entity is not a component', () => {
      const { isComponent } = useComponentEntity('blockInstance')
      
      expect(isComponent('block-1')).toBe(false) // block-1 is the composer, not a component
    })

    it('should return false when no components exist', () => {
      mockGlobalData.relationships.instanceComponents = []
      
      const { isComponent } = useComponentEntity('blockInstance')
      
      expect(isComponent('block-2')).toBe(false)
    })
  })

  describe('getComposerId', () => {
    it('should return null for non-blockInstance entity types', () => {
      const { getComposerId } = useComponentEntity('partInstance')
      
      expect(getComposerId('part-1')).toBeNull()
    })

    it('should return composer ID for a component', () => {
      const { getComposerId } = useComponentEntity('blockInstance')
      
      expect(getComposerId('block-2')).toBe('block-1')
      expect(getComposerId('block-3')).toBe('block-1')
    })

    it('should return null when entity is not a component', () => {
      const { getComposerId } = useComponentEntity('blockInstance')
      
      expect(getComposerId('block-1')).toBeNull()
    })

    it('should return null when no components exist', () => {
      mockGlobalData.relationships.instanceComponents = []
      
      const { getComposerId } = useComponentEntity('blockInstance')
      
      expect(getComposerId('block-2')).toBeNull()
    })
  })

  describe('getComposedEntity', () => {
    it('should return composed entity', () => {
      const { getComposedEntity } = useComponentEntity('blockInstance')
      
      const composed = getComposedEntity('block-1')
      
      expect(composed).toBeDefined()
    })

    it('should return null when globalData is null', () => {
      vi.mocked(useGlobal).mockReturnValueOnce({
        globalData: { value: null },
        getGlobalData: vi.fn(() => null),
      } as any)
      
      const { getComposedEntity } = useComponentEntity('blockInstance')
      
      expect(getComposedEntity('block-1')).toBeNull()
    })
  })

  describe('createComponent mutation', () => {
    it('should create component relationships', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      
      const { createComponent } = useComponentEntity('blockInstance')
      
      await createComponent({ composerId: 'block-1', componentIds: ['block-2', 'block-3'] })
      
      expect(apiClient.post).toHaveBeenCalledTimes(2)
    })

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create component')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { createComponent } = useComponentEntity('blockInstance')
      
      await expect(createComponent({ composerId: 'block-1', componentIds: ['block-2'] })).rejects.toThrow('Failed to create component')
    })
  })

  describe('addToComponent mutation', () => {
    it('should add component to composer', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      
      const { addToComponent } = useComponentEntity('blockInstance')
      
      await addToComponent({ composerId: 'block-1', componentId: 'block-2', orderIndex: 0 })
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/relationships/instanceComponents',
        {
          parent_id: 'block-1',
          child_id: 'block-2',
          order_index: 0,
        }
      )
    })

    it('should use default orderIndex when not provided', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      
      const { addToComponent } = useComponentEntity('blockInstance')
      
      await addToComponent({ composerId: 'block-1', componentId: 'block-2' })
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/relationships/instanceComponents',
        expect.objectContaining({
          order_index: 0,
        })
      )
    })
  })

  describe('removeFromComponent mutation', () => {
    it('should remove component from composer', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { removeFromComponent } = useComponentEntity('blockInstance')
      
      await removeFromComponent({ composerId: 'block-1', componentId: 'block-2' })
      
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/relationships/instanceComponents/block-1/block-2'
      )
    })

    it('should handle deletion errors', async () => {
      const error = new Error('Failed to delete component')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { removeFromComponent } = useComponentEntity('blockInstance')
      
      await expect(removeFromComponent({ composerId: 'block-1', componentId: 'block-2' })).rejects.toThrow('Failed to delete component')
    })
  })

  describe('calculateDistributionPreview', () => {
    it('should calculate proportional distribution', () => {
      const { calculateDistributionPreview } = useComponentEntity('blockInstance')
      
      const preview = calculateDistributionPreview('block-1', 'baseFee', 100, 'proportional')
      
      expect(preview).toBeInstanceOf(Array)
      expect(preview.length).toBeGreaterThan(0)
      preview.forEach(p => {
        expect(p).toHaveProperty('componentId')
        expect(p).toHaveProperty('currentValue')
        expect(p).toHaveProperty('newValue')
        expect(p).toHaveProperty('change')
      })
    })

    it('should calculate equal distribution', () => {
      const { calculateDistributionPreview } = useComponentEntity('blockInstance')
      
      const preview = calculateDistributionPreview('block-1', 'baseFee', 100, 'equal')
      
      expect(preview).toBeInstanceOf(Array)
      if (preview.length > 0) {
        const values = preview.map(p => p.newValue)
        const firstValue = values[0]
        expect(values.every(v => v === firstValue)).toBe(true)
      }
    })

    it('should return empty array when no components exist', () => {
      mockGlobalData.relationships.instanceComponents = []
      
      const { calculateDistributionPreview } = useComponentEntity('blockInstance')
      
      const preview = calculateDistributionPreview('block-1', 'baseFee', 100, 'proportional')
      
      expect(preview).toEqual([])
    })

    it('should return empty array when globalData is null', () => {
      vi.mocked(useGlobal).mockReturnValueOnce({
        globalData: { value: null },
        getGlobalData: vi.fn(() => null),
      } as any)
      
      const { calculateDistributionPreview } = useComponentEntity('blockInstance')
      
      const preview = calculateDistributionPreview('block-1', 'baseFee', 100, 'proportional')
      
      expect(preview).toEqual([])
    })
  })
})

