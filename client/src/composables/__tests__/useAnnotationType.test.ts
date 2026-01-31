/**
 * USE ANNOTATION SHAPE TESTS
 * 
 * Unit tests for useAnnotationShape composable.
 * Tests annotation shape CRUD operations and queries.
 * Phase 7: Config Composables
 * 
 * Session 1.4.7: Updated to test globalData cache pattern
 * - useAnnotationShapes now reads from globalData.annotationShapes
 * - Mutations use refetchQueries(['globalData']) instead of invalidateQueries(['annotationShapes'])
 * 
 * NOTE: Renamed from useAnnotationType tests (2026-01-30)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import {
  useAnnotationShapes,
  useCreateAnnotationShape,
  useUpdateAnnotationShape,
  useDeleteAnnotationShape,
} from '../useAnnotationTypes'
import apiClient from '@/utils/api'
import type { AnnotationShape } from '@/types/annotations'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

// Mock Vue Query
const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
}

vi.mock('@tanstack/vue-query', () => ({
  useMutation: vi.fn((config) => ({
    mutate: vi.fn(),
    mutateAsync: async (variables: unknown) => {
      const result = await config.mutationFn(variables)
      // Call onSuccess if defined
      if (config.onSuccess) {
        await config.onSuccess(result)
      }
      return result
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
  useQueryClient: vi.fn(() => mockQueryClient),
}))

// Mock globalData for useGlobal
const mockGlobalData: Ref<GlobalData | null> = ref(null)
const mockIsLoading: Ref<boolean> = ref(false)
const mockError: Ref<Error | null> = ref(null)

vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: mockGlobalData,
    isLoading: mockIsLoading,
    error: mockError,
  })),
}))

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  getAnnotationShapeEndpoint: vi.fn(() => '/api/annotations/annotationShape'),
  getAnnotationShapeByIdEndpoint: vi.fn((id) => `/api/annotations/annotationShape/${id}`),
}))

describe('useAnnotationShape', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock globalData
    mockGlobalData.value = null
  })

  describe('useAnnotationShapes', () => {
    it('should return annotation shapes from globalData', () => {
      const mockShapes: AnnotationShape[] = [
        { id: 'shape-1', name: 'description' },
        { id: 'shape-2', name: 'tooltip' },
      ]
      
      // Set up globalData with annotation shapes
      mockGlobalData.value = {
        entities: { blockInstance: [], blockShape: [], partInstance: [], partShape: [] },
        relationships: {} as GlobalData['relationships'],
        annotations: {
          annotationShape: mockShapes,
          annotationInstance: [],
        },
        events: {
          eventShape: [],
          eventInstance: [],
        },
      }

      const { data } = useAnnotationShapes()

      expect(data.value).toEqual(mockShapes)
    })

    it('should return empty array when globalData is null', () => {
      mockGlobalData.value = null

      const { data } = useAnnotationShapes()

      expect(data.value).toEqual([])
    })

    it('should return empty array when annotationShapes is undefined', () => {
      mockGlobalData.value = {
        entities: { blockInstance: [], blockShape: [], partInstance: [], partShape: [] },
        relationships: {} as GlobalData['relationships'],
        annotations: {
          annotationInstance: [],
        },
        events: {
          eventShape: [],
          eventInstance: [],
        },
      }

      const { data } = useAnnotationShapes()

      expect(data.value).toEqual([])
    })
    
    it('should expose isLoading and error from useGlobal', () => {
      mockGlobalData.value = null
      
      const result = useAnnotationShapes()
      
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('isLoading')
      expect(result).toHaveProperty('error')
    })
  })

  describe('useCreateAnnotationShape', () => {
    it('should create annotation shape', async () => {
      const newShape: AnnotationShape = { id: 'shape-1', name: 'newShape' }
      vi.mocked(apiClient.post).mockResolvedValue({ data: newShape })

      const mutation = useCreateAnnotationShape()

      const result = await mutation.mutateAsync({ name: 'newShape' })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/annotations/annotationShape',
        { name: 'newShape' }
      )
      expect(result).toEqual(newShape)
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 'shape-1', name: 'newShape' } })

      const mutation = useCreateAnnotationShape()

      await mutation.mutateAsync({ name: 'newShape' })

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create annotation shape')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const mutation = useCreateAnnotationShape()

      await expect(mutation.mutateAsync({ name: 'newShape' })).rejects.toThrow('Failed to create annotation shape')
    })
  })

  describe('useUpdateAnnotationShape', () => {
    it('should update annotation shape', async () => {
      const updatedShape: AnnotationShape = { id: 'shape-1', name: 'updatedShape' }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedShape })

      const mutation = useUpdateAnnotationShape()

      const result = await mutation.mutateAsync({
        id: 'shape-1',
        data: { name: 'updatedShape' },
      })

      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/annotations/annotationShape/shape-1',
        { name: 'updatedShape' }
      )
      expect(result).toEqual(updatedShape)
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 'shape-1', name: 'updatedShape' } })

      const mutation = useUpdateAnnotationShape()

      await mutation.mutateAsync({
        id: 'shape-1',
        data: { name: 'updatedShape' },
      })

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update annotation shape')
      vi.mocked(apiClient.put).mockRejectedValue(error)

      const mutation = useUpdateAnnotationShape()

      await expect(mutation.mutateAsync({
        id: 'shape-1',
        data: { name: 'updatedShape' },
      })).rejects.toThrow('Failed to update annotation shape')
    })
  })

  describe('useDeleteAnnotationShape', () => {
    it('should delete annotation shape', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      const mutation = useDeleteAnnotationShape()

      await mutation.mutateAsync('shape-1')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/annotations/annotationShape/shape-1')
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      const mutation = useDeleteAnnotationShape()

      await mutation.mutateAsync('shape-1')

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete annotation shape')
      vi.mocked(apiClient.delete).mockRejectedValue(error)

      const mutation = useDeleteAnnotationShape()

      await expect(mutation.mutateAsync('shape-1')).rejects.toThrow('Failed to delete annotation shape')
    })
  })
})
