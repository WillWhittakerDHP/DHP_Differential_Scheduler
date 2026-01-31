/**
 * USE ANNOTATIONS TESTS
 * 
 * Unit tests for useAnnotations composable.
 * Tests annotation CRUD operations, queries, and cache invalidation.
 * Session 1.4.6: Created following useAppointment pattern
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAnnotations } from '../useAnnotations'
import apiClient from '@/utils/api'
import type { AnnotationRequest, Annotation } from '@/types/annotations'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

// Mock Vue Query
const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
}

const mockAnnotation: Annotation = {
  id: 'ann-1',
  text: 'Test annotation',
  type: 'type-1',
  userTypeBlock: null,
}

// Mock globalData
const mockGlobalData = ref<GlobalData | null>({
  entities: {
    blockInstance: [],
    blockShape: [],
    partInstance: [],
    partShape: [],
  },
  relationships: {},
  appointments: [],
  properties: [],
  users: [],
  annotations: [mockAnnotation],
})

vi.mock('@tanstack/vue-query', () => ({
  useMutation: vi.fn((config: { mutationFn: (...args: unknown[]) => Promise<unknown>; onSuccess?: (data: unknown, ...args: unknown[]) => Promise<unknown> | void }) => {
    const mutateAsync = async (...args: unknown[]): Promise<unknown> => {
      const result = await config.mutationFn(...args)
      if (config.onSuccess) {
        await config.onSuccess(result, ...args)
      }
      return result
    }
    return {
      mutate: vi.fn(),
      mutateAsync,
      isLoading: false,
      isError: false,
      error: null,
    }
  }),
  useQueryClient: vi.fn(() => mockQueryClient),
}))

// Mock useGlobal
vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: mockGlobalData,
    getGlobalEntities: vi.fn(() => []),
    getGlobalEntityById: vi.fn(),
    getGlobalData: vi.fn(() => mockGlobalData.value),
  })),
}))

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getAnnotationEndpoint: vi.fn(() => '/api/annotations/annotationInstance'),
  getAnnotationByIdEndpoint: vi.fn((id) => `/api/annotations/annotationInstance/${id}`),
}))

describe('useAnnotations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create mutation', () => {
    it('should create annotation', async () => {
      const annotationData: AnnotationRequest = {
        text: 'New annotation',
        type: 'type-1',
        userTypeBlock: null,
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAnnotation })
      
      const { create } = useAnnotations()
      
      const result = await create.mutateAsync(annotationData)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/annotations/annotationInstance',
        annotationData
      )
      
      expect(result).toEqual(mockAnnotation)
    })

    it('should invalidate globalData query on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAnnotation })
      mockQueryClient.getQueryData.mockReturnValue({
        annotations: [],
      })
      
      const { create } = useAnnotations()
      
      await create.mutateAsync({
        text: 'New annotation',
        type: 'type-1',
        userTypeBlock: null,
      })
      
      // Session 1.4.6: Use refetchQueries for consistency with Session 1.4.4 pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle create errors', async () => {
      const error = new Error('Failed to create annotation')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { create } = useAnnotations()
      
      await expect(create.mutateAsync({
        text: 'New annotation',
        type: 'type-1',
        userTypeBlock: null,
      })).rejects.toThrow('Failed to create annotation')
    })
  })

  describe('update mutation', () => {
    it('should update annotation', async () => {
      const updateData: Partial<AnnotationRequest> = {
        text: 'Updated annotation',
      }
      
      const updatedAnnotation = { ...mockAnnotation, text: updateData.text! }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedAnnotation })
      
      const { update } = useAnnotations()
      
      const result = await update.mutateAsync({
        id: 'ann-1',
        data: updateData,
      })
      
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/annotations/annotationInstance/ann-1',
        updateData
      )
      
      expect(result).toEqual(updatedAnnotation)
    })

    it('should invalidate globalData query on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockAnnotation })
      
      const { update } = useAnnotations()
      
      await update.mutateAsync({
        id: 'ann-1',
        data: { text: 'Updated annotation' },
      })
      
      // Session 1.4.6: Use refetchQueries for consistency with Session 1.4.4 pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update annotation')
      vi.mocked(apiClient.put).mockRejectedValue(error)
      
      const { update } = useAnnotations()
      
      await expect(update.mutateAsync({
        id: 'ann-1',
        data: { text: 'Updated annotation' },
      })).rejects.toThrow('Failed to update annotation')
    })
  })

  describe('patch mutation', () => {
    it('should patch annotation', async () => {
      const patchData: Partial<AnnotationRequest> = {
        text: 'Patched annotation',
      }
      
      const patchedAnnotation = { ...mockAnnotation, text: patchData.text! }
      vi.mocked(apiClient.patch).mockResolvedValue({ data: patchedAnnotation })
      
      const { patch } = useAnnotations()
      
      const result = await patch.mutateAsync({
        id: 'ann-1',
        data: patchData,
      })
      
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/annotations/annotationInstance/ann-1',
        patchData
      )
      
      expect(result).toEqual(patchedAnnotation)
    })

    it('should invalidate globalData query on success', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockAnnotation })
      
      const { patch } = useAnnotations()
      
      await patch.mutateAsync({
        id: 'ann-1',
        data: { text: 'Patched annotation' },
      })
      
      // Session 1.4.6: Use refetchQueries for consistency with Session 1.4.4 pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle patch errors', async () => {
      const error = new Error('Failed to patch annotation')
      vi.mocked(apiClient.patch).mockRejectedValue(error)
      
      const { patch } = useAnnotations()
      
      await expect(patch.mutateAsync({
        id: 'ann-1',
        data: { text: 'Patched annotation' },
      })).rejects.toThrow('Failed to patch annotation')
    })
  })

  describe('remove mutation', () => {
    it('should delete annotation', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useAnnotations()
      
      await remove.mutateAsync('ann-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/annotations/annotationInstance/ann-1')
    })

    it('should invalidate globalData query on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useAnnotations()
      
      await remove.mutateAsync('ann-1')
      
      // Session 1.4.6: Use refetchQueries for consistency with Session 1.4.4 pattern
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['globalData'],
      })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete annotation')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { remove } = useAnnotations()
      
      await expect(remove.mutateAsync('ann-1')).rejects.toThrow('Failed to delete annotation')
    })
  })

  describe('fetchAll', () => {
    it('should read annotations from globalData cache', () => {
      const { fetchAll } = useAnnotations()
      
      // Should return object with data, isLoading, error
      expect(fetchAll).toBeDefined()
      expect(fetchAll.data).toBeDefined()
      expect(fetchAll.isLoading).toBeDefined()
      expect(fetchAll.error).toBeDefined()
      
      // Data should be computed property reading from globalData
      expect(fetchAll.data.value).toEqual([mockAnnotation])
      expect(fetchAll.isLoading.value).toBe(false)
    })

    it('should return empty array when globalData is null', () => {
      mockGlobalData.value = null
      
      const { fetchAll } = useAnnotations()
      
      expect(fetchAll.data.value).toEqual([])
      
      // Reset for other tests
      mockGlobalData.value = {
        entities: {
          blockInstance: [],
          blockShape: [],
          partInstance: [],
          partShape: [],
        },
        relationships: {},
        appointments: [],
        properties: [],
        users: [],
        annotations: [mockAnnotation],
      }
    })
  })

  describe('fetchById', () => {
    it('should read annotation by ID from globalData cache', () => {
      const { fetchById } = useAnnotations()
      const query = fetchById('ann-1')
      
      // Should return object with data, isLoading, error
      expect(query).toBeDefined()
      expect(query.data).toBeDefined()
      expect(query.isLoading).toBeDefined()
      expect(query.error).toBeDefined()
      
      // Data should be computed property finding annotation by ID
      expect(query.data.value).toEqual(mockAnnotation)
      expect(query.isLoading.value).toBe(false)
    })

    it('should return undefined when annotation not found', () => {
      const { fetchById } = useAnnotations()
      const query = fetchById('nonexistent')
      
      expect(query.data.value).toBeUndefined()
    })

    it('should return undefined when globalData is null', () => {
      mockGlobalData.value = null
      
      const { fetchById } = useAnnotations()
      const query = fetchById('ann-1')
      
      expect(query.data.value).toBeUndefined()
      
      // Reset for other tests
      mockGlobalData.value = {
        entities: {
          blockInstance: [],
          blockShape: [],
          partInstance: [],
          partShape: [],
        },
        relationships: {},
        appointments: [],
        properties: [],
        users: [],
        annotations: [mockAnnotation],
      }
    })
  })
})

