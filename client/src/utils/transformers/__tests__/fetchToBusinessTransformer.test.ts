/**
 * FETCH TO BUSINESS TRANSFORMER TESTS
 * 
 * Unit tests for BusinessTransformer class.
 * Tests business data fetching logic.
 * 
 * What it covers:
 * - fetchAll: Fetches appointments, properties, and users in parallel
 * - Error handling: Returns empty arrays on error
 * 
 * How it works:
 * - Mocks API client to test successful and error scenarios
 * - Tests parallel fetching behavior
 * - Tests error handling
 * 
 * Dependencies:
 * - vitest for testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BusinessTransformer, businessTransformer } from '../fetchToBusinessTransformer'
import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn()
  },
  getAppointmentEndpoint: () => '/api/appointments',
  getPropertyEndpoint: () => '/api/properties',
  getUserEndpoint: () => '/api/users'
}))

describe('BusinessTransformer', () => {
  let transformer: BusinessTransformer
  let apiClient: any

  beforeEach(async () => {
    vi.clearAllMocks()
    transformer = new BusinessTransformer()
    // Get the mocked apiClient
    const apiModule = await import('@/utils/api')
    apiClient = apiModule.default
  })

  describe('fetchAll', () => {
    it('should fetch all business entities in parallel', async () => {
      const mockAppointments: AppointmentResponse[] = [
        { id: '1', startTime: '2026-01-15T10:00:00Z' as any, endTime: '2026-01-15T11:00:00Z' as any, duration: 60 }
      ]
      const mockProperties: PropertyResponse[] = [
        { id: '1', address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345' }
      ]
      const mockUsers: UserResponse[] = [
        { id: '1', name: 'Test User', email: 'test@example.com' }
      ]

      apiClient.get
        .mockResolvedValueOnce({ data: mockAppointments })
        .mockResolvedValueOnce({ data: mockProperties })
        .mockResolvedValueOnce({ data: mockUsers })

      const result = await transformer.fetchAll()

      expect(apiClient.get).toHaveBeenCalledTimes(3)
      expect(apiClient.get).toHaveBeenCalledWith('/api/appointments')
      expect(apiClient.get).toHaveBeenCalledWith('/api/properties')
      expect(apiClient.get).toHaveBeenCalledWith('/api/users')
      
      expect(result.appointments).toEqual(mockAppointments)
      expect(result.properties).toEqual(mockProperties)
      expect(result.users).toEqual(mockUsers)
    })

    it('should return empty arrays on error', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'))

      const result = await transformer.fetchAll()

      expect(result.appointments).toEqual([])
      expect(result.properties).toEqual([])
      expect(result.users).toEqual([])
    })

    it('should return empty arrays when any request fails', async () => {
      // Promise.all rejects if any promise rejects, so the catch block returns empty arrays for all
      apiClient.get
        .mockResolvedValueOnce({ data: [{ id: '1' }] })
        .mockRejectedValueOnce(new Error('Properties fetch failed'))

      const result = await transformer.fetchAll()

      // When any request fails, Promise.all rejects and catch returns empty arrays for all
      expect(result.appointments).toEqual([])
      expect(result.properties).toEqual([])
      expect(result.users).toEqual([])
    })

    it('should handle empty responses', async () => {
      apiClient.get
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })

      const result = await transformer.fetchAll()

      expect(result.appointments).toEqual([])
      expect(result.properties).toEqual([])
      expect(result.users).toEqual([])
    })
  })

  describe('businessTransformer singleton', () => {
    it('should export singleton instance', () => {
      expect(businessTransformer).toBeInstanceOf(BusinessTransformer)
    })

    it('should be the same instance on multiple imports', async () => {
      const { businessTransformer: transformer1 } = await import('../fetchToBusinessTransformer')
      const { businessTransformer: transformer2 } = await import('../fetchToBusinessTransformer')
      
      expect(transformer1).toBe(transformer2)
    })
  })
})
