
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePrimitiveMutation, useEntityCrud } from '../useEntity'
import apiClient from '@/utils/api'
import type { GlobalEntity } from '@/types/entities'

const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
  getQueryData: vi.fn(() => ({
    entities: {
      blockInstance: [],
      blockShape: [],
      partInstance: [],
      partShape: [],
    },
  })),
  setQueryData: vi.fn(),
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

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getEntityEndpoint: vi.fn((key) => `/api/entities/${key}`),
  getEntityByIdEndpoint: vi.fn((key, id) => `/api/entities/${key}/${id}`),
  getOrderIndexEndpoint: vi.fn((key) => `/api/entities/${key}/order`),
}))

vi.mock('../useComponentEntity', () => ({
  useComponentEntity: vi.fn(() => ({
    deleteComponentsRecursively: vi.fn(),
  })),
}))

vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: { value: null },
  })),
}))

vi.mock('@/utils/entityDefaults', () => ({
  getDefaultEntityValues: vi.fn(() => ({
    orderIndex: 0,
    active: true,
  })),
}))

vi.mock('@/utils/transformers/entityTransformers', () => ({
  transformApiEntity: vi.fn((entity) => ({
    ...entity,
    id: entity.id || 'transformed-id',
  })),
}))

vi.mock('@/utils/transformers/fetchToGlobalTransformer', () => ({
  globalTransformer: {
    dehydrateEntity: vi.fn((entity) => entity),
  },
}))

describe('useEntity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('usePrimitiveMutation', () => {
    it('should update a single field', async () => {
      const mockResponse = { data: { id: 'block-1', name: 'Updated Name' } }
      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)
      
      const mutation = usePrimitiveMutation('blockInstance')
      
      await mutation.mutateAsync({
        admin: { key: 'name', value: 'Updated Name' },
        dynamicId: 'block-1',
      })
      
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/entities/blockInstance/block-1',
        { key: 'name', value: 'Updated Name' }
      )
    })
    
    it('should handle 404 errors', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Entity not found', id: 'block-1' },
        },
      })
      
      const mutation = usePrimitiveMutation('blockInstance')
      
      await expect(mutation.mutateAsync({
        admin: { key: 'name', value: 'Updated Name' },
        dynamicId: 'block-1',
      })).rejects.toThrow('Entity not found')
    })
    
    it('should invalidate queries on success', async () => {
      const mockResponse = { data: { id: 'block-1' } }
      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)
      
      const mutation = usePrimitiveMutation('blockInstance')
      
      await mutation.mutateAsync({
        admin: { key: 'name', value: 'Updated Name' },
        dynamicId: 'block-1',
      })
      
      expect(apiClient.patch).toHaveBeenCalled()
    })
  })
  
  describe('useEntityCrud', () => {
    it('should create a new entity', async () => {
      const mockResponse = {
        data: {
          id: 'block-new',
          name: 'New Block',
          entity_key: 'blockInstance',
        },
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
      
      const { create } = useEntityCrud('blockInstance')
      
      const newEntity: Partial<GlobalEntity<'blockInstance'>> = {
        name: 'New Block',
        active: true,
        orderIndex: 1,
      }
      
      await create(newEntity)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/entities/blockInstance',
        expect.objectContaining({ name: 'New Block' })
      )
    })
    
    it('should update an existing entity', async () => {
      const mockResponse = {
        data: {
          id: 'block-1',
          name: 'Updated Block',
        },
      }
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)
      
      const { update } = useEntityCrud('blockInstance')
      
      await update({
        id: 'block-1',
        name: 'Updated Block',
      } as Partial<GlobalEntity<'blockInstance'>>, 'block-1')
      
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/entities/blockInstance/block-1',
        expect.objectContaining({ name: 'Updated Block' })
      )
    })
    
    it('should delete an entity', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { success: true } })
      
      const { remove } = useEntityCrud('blockInstance')
      
      await remove('block-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/entities/blockInstance/block-1')
    })
    
    it('should handle delete errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))
      
      const { remove } = useEntityCrud('blockInstance')
      
      await expect(remove('block-1')).rejects.toThrow('Delete failed')
    })
  })
  
  describe('optimistic updates', () => {
    it('should rollback on update failure', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Update failed'))
      
      const { update } = useEntityCrud('blockInstance')
      
      await expect(update({
        id: 'block-1',
        name: 'Updated Block',
      } as Partial<GlobalEntity<'blockInstance'>>, 'block-1')).rejects.toThrow('Update failed')
    })
  })
  
  describe('error handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))
      
      const { create } = useEntityCrud('blockInstance')
      
      await expect(create({
        name: 'New Block',
      } as Partial<GlobalEntity<'blockInstance'>>)).rejects.toThrow('Network error')
    })
    
    it('should handle validation errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Validation failed', fields: { name: 'Required' } },
        },
      })
      
      const { create } = useEntityCrud('blockInstance')
      
      await expect(create({
        name: '',
      } as Partial<GlobalEntity<'blockInstance'>>)).rejects.toThrow()
    })
  })
})

