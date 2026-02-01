
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useUser } from '../useUser'
import apiClient from '@/utils/api'
import type { UserRequest, UserResponse } from '@/types/user'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
}

const mockUser: UserResponse = {
  id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  userRole: 'client',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockBusinessData: Ref<BusinessData | undefined> = ref({
  appointments: [],
  properties: [],
  users: [mockUser],
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
    const mutateAsync = async (...args: unknown[]) => {
      try {
        const result = await config.mutationFn(...args)
        if (config.onSuccess) {
          await config.onSuccess(result, ...args, undefined)
        }
        return result
      } catch (error) {
        throw error
      }
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
  getUserEndpoint: vi.fn(() => '/api/users'),
  getUserByIdEndpoint: vi.fn((id) => `/api/users/${id}`),
}))

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBusinessData.value = {
      appointments: [],
      properties: [],
      users: [mockUser],
    }
    mockIsLoading.value = false
    mockError.value = null
  })

  describe('create mutation', () => {
    it('should create user', async () => {
      const userData: UserRequest = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userRole: 'client',
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockUser })
      
      const { create } = useUser()
      
      const result = await create.mutateAsync(userData)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/users',
        userData
      )
      
      expect(result).toEqual(mockUser)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockUser })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { create } = useUser()
      
      await create.mutateAsync({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userRole: 'client',
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle create errors', async () => {
      const error = new Error('Failed to create user')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { create } = useUser()
      
      await expect(create.mutateAsync({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userRole: 'client',
      })).rejects.toThrow('Failed to create user')
    })
  })

  describe('update mutation', () => {
    it('should update user', async () => {
      const updateData: Partial<UserRequest> = {
        firstName: 'Updated',
      }
      
      const updatedUser = { ...mockUser, firstName: 'Updated' }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedUser })
      
      const { update } = useUser()
      
      const result = await update.mutateAsync({
        id: 'user-1',
        data: updateData,
      })
      
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/users/user-1',
        updateData
      )
      
      expect(result).toEqual(updatedUser)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockUser })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { update } = useUser()
      
      await update.mutateAsync({
        id: 'user-1',
        data: { firstName: 'Updated' },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update user')
      vi.mocked(apiClient.put).mockRejectedValue(error)
      
      const { update } = useUser()
      
      await expect(update.mutateAsync({
        id: 'user-1',
        data: { firstName: 'Updated' },
      })).rejects.toThrow('Failed to update user')
    })
  })

  describe('patch mutation', () => {
    it('should patch user', async () => {
      const patchData: Partial<UserRequest> = {
        email: 'updated@example.com',
      }
      
      const patchedUser = { ...mockUser, email: 'updated@example.com' }
      vi.mocked(apiClient.patch).mockResolvedValue({ data: patchedUser })
      
      const { patch } = useUser()
      
      const result = await patch.mutateAsync({
        id: 'user-1',
        data: patchData,
      })
      
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/users/user-1',
        patchData
      )
      
      expect(result).toEqual(patchedUser)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockUser })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { patch } = useUser()
      
      await patch.mutateAsync({
        id: 'user-1',
        data: { email: 'updated@example.com' },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle patch errors', async () => {
      const error = new Error('Failed to patch user')
      vi.mocked(apiClient.patch).mockRejectedValue(error)
      
      const { patch } = useUser()
      
      await expect(patch.mutateAsync({
        id: 'user-1',
        data: { email: 'updated@example.com' },
      })).rejects.toThrow('Failed to patch user')
    })
  })

  describe('remove mutation', () => {
    it('should delete user', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useUser()
      
      await remove.mutateAsync('user-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/users/user-1')
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { remove } = useUser()
      
      await remove.mutateAsync('user-1')
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete user')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { remove } = useUser()
      
      await expect(remove.mutateAsync('user-1')).rejects.toThrow('Failed to delete user')
    })
  })

  describe('fetchAll', () => {
    it('should read users from businessData cache', () => {
      const { fetchAll } = useUser()
      
      expect(fetchAll).toBeDefined()
      expect(fetchAll.data).toBeDefined()
      expect(fetchAll.isLoading).toBeDefined()
      expect(fetchAll.error).toBeDefined()
      
      expect(fetchAll.data.value).toEqual([mockUser])
      expect(fetchAll.isLoading.value).toBe(false)
    })

    it('should return empty array when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchAll } = useUser()
      
      expect(fetchAll.data.value).toEqual([])
    })

    it('should return empty array when users is empty', () => {
      mockBusinessData.value = {
        appointments: [],
        properties: [],
        users: [],
      }
      
      const { fetchAll } = useUser()
      
      expect(fetchAll.data.value).toEqual([])
    })
  })

  describe('fetchById', () => {
    it('should read user by ID from businessData cache', () => {
      const { fetchById } = useUser()
      const query = fetchById('user-1')
      
      expect(query).toBeDefined()
      expect(query.data).toBeDefined()
      expect(query.isLoading).toBeDefined()
      expect(query.error).toBeDefined()
      
      expect(query.data.value).toEqual(mockUser)
      expect(query.isLoading.value).toBe(false)
    })

    it('should return undefined when user not found', () => {
      const { fetchById } = useUser()
      const query = fetchById('nonexistent')
      
      expect(query.data.value).toBeUndefined()
    })

    it('should return undefined when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchById } = useUser()
      const query = fetchById('user-1')
      
      expect(query.data.value).toBeUndefined()
    })
  })
})

