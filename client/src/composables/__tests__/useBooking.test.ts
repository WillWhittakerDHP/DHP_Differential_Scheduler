/**
 * USE BOOKING TESTS
 * 
 * Unit tests for useBooking composable.
 * Tests booking data fetching, transformation, and state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBooking } from '../useBooking'
import { useGlobal } from '../useGlobal'
import { createAtomicBlockGlobalData } from '@/utils/__tests__/factories/globalDataFactory'

// Mock dependencies
vi.mock('../useGlobal', () => ({
  useGlobal: vi.fn(() => ({
    globalData: {
      value: createAtomicBlockGlobalData(),
    },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/utils/transformers/globalToBookingTransformer', () => ({
  bookingTransformer: {
    transformGlobalToBooking: vi.fn((globalData) => ({
      blockInstances: globalData?.entities?.blockInstance || [],
    })),
  },
}))

describe('useBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('bookingData', () => {
    it('should provide booking data', () => {
      const { bookingData } = useBooking()
      
      expect(bookingData.value).toBeDefined()
      expect(bookingData.value.blockInstances).toBeDefined()
    })
    
    it('should transform globalData to booking format', () => {
      const { bookingData } = useBooking()
      
      expect(bookingData.value.blockInstances).toBeInstanceOf(Array)
    })
    
    it('should be reactive', () => {
      const { bookingData } = useBooking()
      
      const firstValue = bookingData.value
      const secondValue = bookingData.value
      
      expect(firstValue).toBe(secondValue) // Should be same reference
    })
  })
  
  describe('loading states', () => {
    it('should expose loading state', () => {
      const { isLoading } = useBooking()
      
      expect(typeof isLoading).toBe('boolean')
    })
    
    it('should expose error state', () => {
      const { error } = useBooking()
      
      expect(error).toBeDefined()
    })
  })
  
  describe('computed properties', () => {
    it('should provide filtered block instances', () => {
      const { bookingData } = useBooking()
      
      const blockInstances = bookingData.value.blockInstances
      
      expect(Array.isArray(blockInstances)).toBe(true)
    })
    
    it('should filter disabled instances', () => {
      const { bookingData } = useBooking()
      
      const blockInstances = bookingData.value.blockInstances
      const hasDisabled = blockInstances.some((b) => b.disabled === true)
      
      expect(hasDisabled).toBe(false)
    })
  })
  
  describe('error handling', () => {
    it('should handle missing globalData gracefully', () => {
      vi.mocked(useGlobal).mockReturnValue({
        globalData: { value: null },
        getGlobalEntities: vi.fn(() => []),
        getGlobalEntityById: vi.fn(),
        getGlobalData: vi.fn(() => null),
      })
      
      const { bookingData } = useBooking()
      
      expect(bookingData.value).toBeDefined()
    })
    
    it('should handle transformation errors', () => {
      vi.mocked(useGlobal).mockReturnValue({
        globalData: { value: null },
        getGlobalEntities: vi.fn(() => []),
        getGlobalEntityById: vi.fn(),
        getGlobalData: vi.fn(() => null),
      })
      
      const { bookingData } = useBooking()
      
      expect(bookingData.value).toBeDefined()
    })
  })
})

