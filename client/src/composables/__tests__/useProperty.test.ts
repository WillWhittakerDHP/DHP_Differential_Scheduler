
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useProperty } from '../useProperty'
import apiClient from '@/utils/api'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
}

const mockProperty: PropertyResponse = {
  id: 'prop-1',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  propertyVersionId: 'version-1',
  addressId: 'addr-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockBusinessData: Ref<BusinessData | undefined> = ref({
  appointments: [],
  properties: [mockProperty],
  users: [],
})
const mockIsLoading = ref(false)
const mockError: Ref<Error | null> = ref(null)

vi.mock('../useBusiness', () => ({
  useBusiness: vi.fn(() => ({
    businessData: mockBusinessData,
    isLoading: mockIsLoading,
    error: mockError,
    refetch: vi.fn(),
  })),
  BUSINESS_DATA_QUERY_KEY: ['businessData'],
}))

vi.mock('@tanstack/vue-query', () => ({
  useMutation: vi.fn((config) => {
    const mutateAsync = async (...args: unknown[]): Promise<unknown> => {
      const result = await config.mutationFn(...args)
      if (config.onSuccess) {
        await config.onSuccess(result, ...args, undefined)
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

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getPropertyEndpoint: vi.fn(() => '/api/properties'),
  getPropertyByIdEndpoint: vi.fn((id) => `/api/properties/${id}`),
}))

describe('useProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBusinessData.value = {
      appointments: [],
      properties: [mockProperty],
      users: [],
    }
    mockIsLoading.value = false
    mockError.value = null
  })

  describe('create mutation', () => {
    it('should create property', async () => {
      const propertyData: PropertyRequest = {
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockProperty })
      
      const { create } = useProperty()
      
      const result = await create.mutateAsync(propertyData)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/properties',
        propertyData
      )
      
      expect(result).toEqual(mockProperty)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockProperty })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { create } = useProperty()
      
      await create.mutateAsync({
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle create errors', async () => {
      const error = new Error('Failed to create property')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { create } = useProperty()
      
      await expect(create.mutateAsync({
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      })).rejects.toThrow('Failed to create property')
    })
  })

  describe('update mutation', () => {
    it('should update property', async () => {
      const updateData: Partial<PropertyRequest> = {
        address: '456 Oak Ave',
      }
      
      const updatedProperty = { ...mockProperty, address: '456 Oak Ave' }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedProperty })
      
      const { update } = useProperty()
      
      const result = await update.mutateAsync({
        id: 'prop-1',
        data: updateData,
      })
      
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/properties/prop-1',
        updateData
      )
      
      expect(result).toEqual(updatedProperty)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProperty })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { update } = useProperty()
      
      await update.mutateAsync({
        id: 'prop-1',
        data: { address: '456 Oak Ave' },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update property')
      vi.mocked(apiClient.put).mockRejectedValue(error)
      
      const { update } = useProperty()
      
      await expect(update.mutateAsync({
        id: 'prop-1',
        data: { address: '456 Oak Ave' },
      })).rejects.toThrow('Failed to update property')
    })
  })

  describe('patch mutation', () => {
    it('should patch property', async () => {
      const patchData: Partial<PropertyRequest> = {
        city: 'Chicago',
      }
      
      const patchedProperty = { ...mockProperty, city: 'Chicago' }
      vi.mocked(apiClient.patch).mockResolvedValue({ data: patchedProperty })
      
      const { patch } = useProperty()
      
      const result = await patch.mutateAsync({
        id: 'prop-1',
        data: patchData,
      })
      
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/properties/prop-1',
        patchData
      )
      
      expect(result).toEqual(patchedProperty)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockProperty })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { patch } = useProperty()
      
      await patch.mutateAsync({
        id: 'prop-1',
        data: { city: 'Chicago' },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle patch errors', async () => {
      const error = new Error('Failed to patch property')
      vi.mocked(apiClient.patch).mockRejectedValue(error)
      
      const { patch } = useProperty()
      
      await expect(patch.mutateAsync({
        id: 'prop-1',
        data: { city: 'Chicago' },
      })).rejects.toThrow('Failed to patch property')
    })
  })

  describe('remove mutation', () => {
    it('should delete property', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useProperty()
      
      await remove.mutateAsync('prop-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/properties/prop-1')
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { remove } = useProperty()
      
      await remove.mutateAsync('prop-1')
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete property')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { remove } = useProperty()
      
      await expect(remove.mutateAsync('prop-1')).rejects.toThrow('Failed to delete property')
    })
  })

  describe('fetchAll', () => {
    it('should read properties from businessData cache', () => {
      const { fetchAll } = useProperty()
      
      expect(fetchAll).toBeDefined()
      expect(fetchAll.data).toBeDefined()
      expect(fetchAll.isLoading).toBeDefined()
      expect(fetchAll.error).toBeDefined()
      
      expect(fetchAll.data.value).toEqual([mockProperty])
      expect(fetchAll.isLoading.value).toBe(false)
    })

    it('should return empty array when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchAll } = useProperty()
      
      expect(fetchAll.data.value).toEqual([])
    })

    it('should return empty array when properties is empty', () => {
      mockBusinessData.value = {
        appointments: [],
        properties: [],
        users: [],
      }
      
      const { fetchAll } = useProperty()
      
      expect(fetchAll.data.value).toEqual([])
    })
  })

  describe('fetchById', () => {
    it('should read property by ID from businessData cache', () => {
      const { fetchById } = useProperty()
      const query = fetchById('prop-1')
      
      expect(query).toBeDefined()
      expect(query.data).toBeDefined()
      expect(query.isLoading).toBeDefined()
      expect(query.error).toBeDefined()
      
      expect(query.data.value).toEqual(mockProperty)
      expect(query.isLoading.value).toBe(false)
    })

    it('should return undefined when property not found', () => {
      const { fetchById } = useProperty()
      const query = fetchById('nonexistent')
      
      expect(query.data.value).toBeUndefined()
    })

    it('should return undefined when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchById } = useProperty()
      const query = fetchById('prop-1')
      
      expect(query.data.value).toBeUndefined()
    })
  })
})

