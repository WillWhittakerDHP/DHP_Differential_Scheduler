/**
 * USE APPOINTMENT TESTS
 * 
 * Unit tests for useAppointment composable.
 * Tests appointment CRUD operations, queries, and cache invalidation.
 * Phase 5: High Priority Composables
 * 
 * Session 1.4.7: Updated to test BusinessData cache pattern
 * ARCHITECTURAL CHANGE: Business entities now use ['businessData'] cache key
 * - Uses optimistic updates + refetchQueries pattern
 * - Reads from businessData.appointments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useAppointment } from '../useAppointment'
import apiClient from '@/utils/api'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

// Mock Vue Query
const mockQueryClient = {
  invalidateQueries: vi.fn(),
  refetchQueries: vi.fn(),
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
}

const mockAppointment: AppointmentResponse = {
  id: 'appt-1',
  propertyVersionId: 'prop-1',
  userTypeBlockId: 'block-1',
  selectedServiceIds: null,
  selectedPropertyTypeBlockIds: null,
  selectedOptionTypeBlocks: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedDateRangeEnd: null,
  selectedTimeSlots: null,
  isQuoteMode: false,
  status: 'started',
  clientId: null,
  agentId: null,
  additionalContacts: null,
  propertyDetails: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Mock businessData for useBusiness
const mockBusinessData: Ref<BusinessData | undefined> = ref({
  appointments: [mockAppointment],
  properties: [],
  users: [],
})
const mockIsLoading = ref(false)
const mockError: Ref<Error | null> = ref(null)

// Mock useBusiness composable
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
  useMutation: vi.fn((config: { mutationFn: (...args: unknown[]) => Promise<unknown>; onSuccess?: (data: unknown, ...args: unknown[]) => Promise<unknown> | void }) => {
    const mutateAsync = async (...args: unknown[]): Promise<unknown> => {
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

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getAppointmentEndpoint: vi.fn(() => '/api/appointments'),
  getAppointmentByIdEndpoint: vi.fn((id) => `/api/appointments/${id}`),
}))

describe('useAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock businessData
    mockBusinessData.value = {
      appointments: [mockAppointment],
      properties: [],
      users: [],
    }
    mockIsLoading.value = false
    mockError.value = null
  })

  describe('create mutation', () => {
    it('should create appointment', async () => {
      const appointmentData: AppointmentRequest = {
        propertyVersionId: 'prop-1',
        userTypeBlockId: 'block-1',
        selectedDate: new Date().toISOString().split('T')[0],
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAppointment })
      
      const { create } = useAppointment()
      
      const result = await create.mutateAsync(appointmentData)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/appointments',
        appointmentData
      )
      
      expect(result).toEqual(mockAppointment)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAppointment })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { create } = useAppointment()
      
      await create.mutateAsync({
        propertyVersionId: 'prop-1',
        userTypeBlockId: 'block-1',
        selectedDate: new Date().toISOString().split('T')[0],
      })
      
      // Session 1.4.7: Optimistic update + refetchQueries pattern
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle create errors', async () => {
      const error = new Error('Failed to create appointment')
      vi.mocked(apiClient.post).mockRejectedValue(error)
      
      const { create } = useAppointment()
      
      await expect(create.mutateAsync({
        propertyVersionId: 'prop-1',
        userTypeBlockId: 'block-1',
        selectedDate: new Date().toISOString().split('T')[0],
      })).rejects.toThrow('Failed to create appointment')
    })
  })

  describe('update mutation', () => {
    it('should update appointment', async () => {
      const updateData: Partial<AppointmentRequest> = {
        selectedDate: new Date().toISOString().split('T')[0],
      }
      
      const updatedAppointment = { ...mockAppointment, selectedDate: updateData.selectedDate! }
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedAppointment })
      
      const { update } = useAppointment()
      
      const result = await update.mutateAsync({
        id: 'appt-1',
        data: updateData,
      })
      
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/appointments/appt-1',
        updateData
      )
      
      expect(result).toEqual(updatedAppointment)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockAppointment })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { update } = useAppointment()
      
      await update.mutateAsync({
        id: 'appt-1',
        data: { selectedDate: new Date().toISOString().split('T')[0] },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle update errors', async () => {
      const error = new Error('Failed to update appointment')
      vi.mocked(apiClient.put).mockRejectedValue(error)
      
      const { update } = useAppointment()
      
      await expect(update.mutateAsync({
        id: 'appt-1',
        data: { selectedDate: new Date().toISOString().split('T')[0] },
      })).rejects.toThrow('Failed to update appointment')
    })
  })

  describe('patch mutation', () => {
    it('should patch appointment', async () => {
      const patchData: Partial<AppointmentRequest> = {
        selectedDateRangeEnd: new Date().toISOString().split('T')[0],
      }
      
      const patchedAppointment = { ...mockAppointment, selectedDateRangeEnd: patchData.selectedDateRangeEnd! }
      vi.mocked(apiClient.patch).mockResolvedValue({ data: patchedAppointment })
      
      const { patch } = useAppointment()
      
      const result = await patch.mutateAsync({
        id: 'appt-1',
        data: patchData,
      })
      
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/api/appointments/appt-1',
        patchData
      )
      
      expect(result).toEqual(patchedAppointment)
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockAppointment })
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { patch } = useAppointment()
      
      await patch.mutateAsync({
        id: 'appt-1',
        data: { selectedDateRangeEnd: new Date().toISOString().split('T')[0] },
      })
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle patch errors', async () => {
      const error = new Error('Failed to patch appointment')
      vi.mocked(apiClient.patch).mockRejectedValue(error)
      
      const { patch } = useAppointment()
      
      await expect(patch.mutateAsync({
        id: 'appt-1',
        data: { selectedDateRangeEnd: new Date().toISOString().split('T')[0] },
      })).rejects.toThrow('Failed to patch appointment')
    })
  })

  describe('remove mutation', () => {
    it('should delete appointment', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      
      const { remove } = useAppointment()
      
      await remove.mutateAsync('appt-1')
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/appointments/appt-1')
    })

    it('should refetch businessData on success', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({})
      mockQueryClient.getQueryData.mockReturnValue(mockBusinessData.value)
      
      const { remove } = useAppointment()
      
      await remove.mutateAsync('appt-1')
      
      expect(mockQueryClient.setQueryData).toHaveBeenCalled()
      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({ queryKey: ['businessData'] })
    })

    it('should handle delete errors', async () => {
      const error = new Error('Failed to delete appointment')
      vi.mocked(apiClient.delete).mockRejectedValue(error)
      
      const { remove } = useAppointment()
      
      await expect(remove.mutateAsync('appt-1')).rejects.toThrow('Failed to delete appointment')
    })
  })

  describe('fetchAll', () => {
    it('should read appointments from businessData cache', () => {
      const { fetchAll } = useAppointment()
      
      // Should return object with data, isLoading, error
      expect(fetchAll).toBeDefined()
      expect(fetchAll.data).toBeDefined()
      expect(fetchAll.isLoading).toBeDefined()
      expect(fetchAll.error).toBeDefined()
      
      // Data should be computed property reading from ['businessData'] cache
      expect(fetchAll.data.value).toEqual([mockAppointment])
      expect(fetchAll.isLoading.value).toBe(false)
    })

    it('should return empty array when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchAll } = useAppointment()
      
      expect(fetchAll.data.value).toEqual([])
    })

    it('should return empty array when appointments is empty', () => {
      mockBusinessData.value = {
        appointments: [],
        properties: [],
        users: [],
      }
      
      const { fetchAll } = useAppointment()
      
      expect(fetchAll.data.value).toEqual([])
    })
  })

  describe('fetchById', () => {
    it('should read appointment by ID from businessData cache', () => {
      const { fetchById } = useAppointment()
      const query = fetchById('appt-1')
      
      // Should return object with data, isLoading, error
      expect(query).toBeDefined()
      expect(query.data).toBeDefined()
      expect(query.isLoading).toBeDefined()
      expect(query.error).toBeDefined()
      
      // Data should be computed property finding appointment by ID
      expect(query.data.value).toEqual(mockAppointment)
      expect(query.isLoading.value).toBe(false)
    })

    it('should return undefined when appointment not found', () => {
      const { fetchById } = useAppointment()
      const query = fetchById('nonexistent')
      
      expect(query.data.value).toBeUndefined()
    })

    it('should return undefined when businessData is undefined', () => {
      mockBusinessData.value = undefined
      
      const { fetchById } = useAppointment()
      const query = fetchById('appt-1')
      
      expect(query.data.value).toBeUndefined()
    })
  })

  describe('fetchRandom helper', () => {
    it('should return random appointment from businessData cache', async () => {
      // Set up multiple appointments in cache
      mockBusinessData.value = {
        appointments: [
          { ...mockAppointment, id: 'appt-1' },
          { ...mockAppointment, id: 'appt-2' },
          { ...mockAppointment, id: 'appt-3' },
        ],
        properties: [],
        users: [],
      }
      
      const { fetchRandom } = useAppointment()
      
      const result = await fetchRandom()
      
      expect(result).toBeDefined()
      expect(result?.id).toMatch(/^appt-\d+$/)
      expect(['appt-1', 'appt-2', 'appt-3'].includes(result?.id || '')).toBe(true)
    })

    it('should return null when no appointments exist', async () => {
      mockBusinessData.value = {
        appointments: [],
        properties: [],
        users: [],
      }
      
      const { fetchRandom } = useAppointment()
      
      const result = await fetchRandom()
      
      expect(result).toBeNull()
    })

    it('should return single appointment when only one exists', async () => {
      mockBusinessData.value = {
        appointments: [{ ...mockAppointment, id: 'appt-1' }],
        properties: [],
        users: [],
      }
      
      const { fetchRandom } = useAppointment()
      
      const result = await fetchRandom()
      
      expect(result).toEqual({ ...mockAppointment, id: 'appt-1' })
    })
  })
})

