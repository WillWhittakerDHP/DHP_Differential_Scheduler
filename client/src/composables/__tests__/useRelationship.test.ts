/**
 * USE RELATIONSHIP TESTS
 * 
 * Unit tests for useRelationship composable.
 * Tests relationship CRUD operations, cache reading, and mutations.
 * Phase 4A: Core Composables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRelationshipCrud } from '../useRelationship'
import apiClient from '@/utils/api'
import { createAtomicBlockGlobalData } from '@/utils/__tests__/factories/globalDataFactory'
import { createActiveConstituentsRel } from '@/utils/__tests__/factories/relationshipFactory'
import { useGlobal } from '../useGlobal'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

// Mock Vue Query
const mockQueryClient = {
  invalidateQueries: vi.fn(),
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

// Mock useGlobal
const mockGlobalData = createAtomicBlockGlobalData()
const relationship = createActiveConstituentsRel('block-1', ['part-1', 'part-2'])
mockGlobalData.relationships.activeConstituents = [relationship]

vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: {
      value: mockGlobalData,
    },
  })),
}))

// Mock API client
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

describe('useRelationshipCrud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('relationships computed', () => {
    it('should return relationships from globalData', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      expect(relationships.value).toBeInstanceOf(Array)
      expect(relationships.value.length).toBeGreaterThan(0)
    })

    it('should transform GlobalRelationship to FetchedRelationship format', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      const rel = relationships.value[0]
      
      expect(rel).toHaveProperty('id')
      expect(rel).toHaveProperty('kind')
      expect(rel).toHaveProperty('parent_id')
      expect(rel).toHaveProperty('child_id')
      expect(rel.kind).toBe('activeConstituents')
    })

    it('should return empty array when relationships are missing', () => {
      // Mock empty relationships
      const emptyGlobalData: GlobalData = {
        entities: {
          blockInstance: [],
          blockShape: [],
          partInstance: [],
          partShape: [],
        },
        relationships: {},
      }
      vi.mocked(useGlobal).mockReturnValueOnce({
        globalData: { value: emptyGlobalData },
        getGlobalEntities: vi.fn(() => []),
        getGlobalEntityById: vi.fn(),
        getGlobalData: vi.fn(() => emptyGlobalData),
      })
      
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      expect(relationships.value).toEqual([])
    })

    it('should filter by relationship kind', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      relationships.value.forEach(rel => {
        expect(rel.kind).toBe('activeConstituents')
      })
    })

    it('should flatten parent-children structure', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      // Should have one relationship per child
      expect(relationships.value.length).toBe(2) // block-1 has 2 children
    })
  })

  describe('isLoading and error', () => {
    it('should always return false for isLoading', () => {
      const { isLoading } = useRelationshipCrud('activeConstituents')
      
      expect(isLoading.value).toBe(false)
    })

    it('should always return undefined for error', () => {
      const { error } = useRelationshipCrud('activeConstituents')
      
      expect(error.value).toBeUndefined()
    })
  })

  describe('create mutation', () => {
    it('should create relationship', async () => {
      const mockResponse = {
        data: {
          id: 'rel-1',
          kind: 'activeConstituents',
          parent_id: 'block-1',
          child_id: 'part-3',
        },
      }
      
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      
      const { create } = useRelationshipCrud('activeConstituents')
      
      const result = await create({
        parent_kind: 'blockInstance',
        child_kind: 'partInstance',
        parent_id: 'block-1',
        child_id: 'part-3',
      })
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/relationships/activeConstituents',
        {
          parent_kind: 'blockInstance',
          child_kind: 'partInstance',
          parent_id: 'block-1',
          child_id: 'part-3',
        }
      )
      
      expect(result).toEqual(mockResponse.data)
    })

    it('should use optimistic updates (no refetch needed on success)', async () => {
      // LEARNING: Implementation uses optimistic updates via onMutate
      // WHY: Immediate UI feedback - cache is updated before API call completes
      // PATTERN: Optimistic updates don't need refetchQueries on success
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      
      const { create } = useRelationshipCrud('activeConstituents')
      
      await create({
        parent_kind: 'blockInstance',
        child_kind: 'partInstance',
        parent_id: 'block-1',
        child_id: 'part-3',
      })
      
      // Optimistic updates don't call refetchQueries - cache is already updated in onMutate
      // Only refetch() function explicitly calls refetchQueries
      expect(mockQueryClient.refetchQueries).not.toHaveBeenCalled()
    })

    it('should handle create errors', async () => {
      const error = new Error('Failed to create relationship')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { create } = useRelationshipCrud('activeConstituents')
      
      await expect(create({
        parent_kind: 'blockInstance',
        child_kind: 'partInstance',
        parent_id: 'block-1',
        child_id: 'part-3',
      })).rejects.toThrow('Failed to create relationship')
    })
  })

  describe('remove mutation', () => {
    it('should delete relationship', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useRelationshipCrud('activeConstituents')
      
      await remove('block-1', 'part-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/api/relationships/activeConstituents/block-1/part-1'
      )
    })

    it('should use optimistic updates (no refetch needed on success)', async () => {
      // LEARNING: Implementation uses optimistic updates via onMutate
      // WHY: Immediate UI feedback - cache is updated before API call completes
      // PATTERN: Optimistic updates don't need refetchQueries on success
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useRelationshipCrud('activeConstituents')
      
      await remove('block-1', 'part-1')
      
      // Optimistic updates don't call refetchQueries - cache is already updated in onMutate
      // Only refetch() function explicitly calls refetchQueries
      expect(mockQueryClient.refetchQueries).not.toHaveBeenCalled()
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete relationship')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { remove } = useRelationshipCrud('activeConstituents')
      
      await expect(remove('block-1', 'part-1')).rejects.toThrow('Failed to delete relationship')
    })
  })

  describe('refetch', () => {
    it('should refetch globalData', async () => {
      const { refetch } = useRelationshipCrud('activeConstituents')
      
      await refetch()
      
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })
  })

  describe('relationship transformation', () => {
    it('should create synthetic IDs for relationships', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      relationships.value.forEach(rel => {
        expect(rel.id).toMatch(/block-1-part-\d+/)
      })
    })

    it('should set disabled to false by default', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      relationships.value.forEach(rel => {
        expect(rel.disabled).toBe(false)
      })
    })

    it('should include parent and child kinds', () => {
      const { relationships } = useRelationshipCrud('activeConstituents')
      
      relationships.value.forEach(rel => {
        expect(rel.parent_kind).toBeDefined()
        expect(rel.child_kind).toBeDefined()
      })
    })
  })
})

