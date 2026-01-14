/**
 * USE ANNOTATION TYPE TESTS
 * 
 * Unit tests for useAnnotationType composable.
 * Tests annotation type CRUD operations and queries.
 * Phase 7: Config Composables
 * 
 * Session 1.4.7: Updated to test globalData cache pattern
 * - useAnnotationTypes now reads from globalData.annotationTypes
 * - Mutations use refetchQueries(['globalData']) instead of invalidateQueries(['annotationTypes'])
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import {
  useAnnotationTypes,
  useCreateAnnotationType,
  useUpdateAnnotationType,
  useDeleteAnnotationType,
} from '../useAnnotationType'
import apiClient from '@/utils/api'
import type { AnnotationType } from '@/types/annotations'
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
  getAnnotationTypeEndpoint: vi.fn(() => '/api/annotation-types'),
  getAnnotationTypeByIdEndpoint: vi.fn((id) => `/api/annotation-types/${id}`),
}))

describe('useAnnotationType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock globalData
    mockGlobalData.value = null
  })

  describe('useAnnotationTypes', () => {
    it('should return annotation types from globalData', () => {
      const mockTypes: AnnotationType[] = [
        { id: 'type-1', name: 'description' },
        { id: 'type-2', name: 'tooltip' },
      ]
      
      // Set up globalData with annotation types
      mockGlobalData.value = {
        entities: { blockInstance: [], blockShape: [], partInstance: [], partShape: [] },
        relationships: {} as GlobalData['relationships'],
        annotations: [],
        annotationTypes: mockTypes,
      }

      const { data } = useAnnotationTypes()

      expect(data.value).toEqual(mockTypes)
    })

    it('should return empty array when globalData is null', () => {
      mockGlobalData.value = null

      const { data } = useAnnotationTypes()

      expect(data.value).toEqual([])
    })

    it('should return empty array when annotationTypes is undefined', () => {
      mockGlobalData.value = {
        entities: { blockInstance: [], blockShape: [], partInstance: [], partShape: [] },
        relationships: {} as GlobalData['relationships'],
        annotations: [],
        // annotationTypes intentionally undefined
      }

      const { data } = useAnnotationTypes()

      expect(data.value).toEqual([])
    })
    
    it('should expose isLoading and error from useGlobal', () => {
      mockGlobalData.value = null
      
      const result = useAnnotationTypes()
      
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('isLoading')
      expect(result).toHaveProperty('error')
    })
  })

  describe('useCreateAnnotationType', () => {
    it('should create annotation type', async () => {
      const newType: AnnotationType = { id: 'type-1', name: 'newType' }
      vi.mocked(apiClient.post).mockResolvedValue({ data: newType })

      const mutation = useCreateAnnotationType()

      const result = await mutation.mutateAsync({ name: 'newType' })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/annotation-types',
        { name: 'newType' }
      )
      expect(result).toEqual(newType)
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 'type-1', name: 'newType' } })

      const mutation = useCreateAnnotationType()

      await mutation.mutateAsync({ name: 'newType' })

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create annotation type')
      vi.mocked(apiClient.post).mockRejectedValue(error)

      const mutation = useCreateAnnotationType()

      await expect(mutation.mutateAsync({ name: 'newType' })).rejects.toThrow('Failed to create annotation type')
    })
  })

  describe('useUpdateAnnotationType', () => {
    it('should update annotation type', async () => {
      const updatedType: AnnotationType = { id: 'type-1', name: 'updatedType' }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedType })

      const mutation = useUpdateAnnotationType()

      const result = await mutation.mutateAsync({
        id: 'type-1',
        data: { name: 'updatedType' },
      })

      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/annotation-types/type-1',
        { name: 'updatedType' }
      )
      expect(result).toEqual(updatedType)
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 'type-1', name: 'updatedType' } })

      const mutation = useUpdateAnnotationType()

      await mutation.mutateAsync({
        id: 'type-1',
        data: { name: 'updatedType' },
      })

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update annotation type')
      vi.mocked(apiClient.put).mockRejectedValue(error)

      const mutation = useUpdateAnnotationType()

      await expect(mutation.mutateAsync({
        id: 'type-1',
        data: { name: 'updatedType' },
      })).rejects.toThrow('Failed to update annotation type')
    })
  })

  describe('useDeleteAnnotationType', () => {
    it('should delete annotation type', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      const mutation = useDeleteAnnotationType()

      await mutation.mutateAsync('type-1')

      expect(apiClient.delete).toHaveBeenCalledWith('/api/annotation-types/type-1')
    })

    it('should refetch globalData query on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})

      const mutation = useDeleteAnnotationType()

      await mutation.mutateAsync('type-1')

      // Session 1.4.7: Use refetchQueries for consistency with globalData pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete annotation type')
      vi.mocked(apiClient.delete).mockRejectedValue(error)

      const mutation = useDeleteAnnotationType()

      await expect(mutation.mutateAsync('type-1')).rejects.toThrow('Failed to delete annotation type')
    })
  })
})

