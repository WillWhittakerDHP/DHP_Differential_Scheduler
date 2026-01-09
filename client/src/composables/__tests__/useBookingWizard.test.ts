/**
 * USE BOOKING WIZARD TESTS
 * 
 * Integration tests for useBookingWizard composable.
 * Tests wizard navigation, state management, and validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookingWizard } from '../useBookingWizard'
import { createAtomicBlockGlobalData } from '@/utils/__tests__/factories/globalDataFactory'

// Mock dependencies
vi.mock('../useBooking', () => ({
  useBooking: () => ({
    bookingData: {
      value: {
        blockInstances: createAtomicBlockGlobalData().entities.blockInstance,
      },
    },
  }),
}))

describe('useBookingWizard', () => {
  describe('state management', () => {
    it('should initialize with empty selections', () => {
      const wizard = useBookingWizard()
      
      expect(wizard.selectedServices.value).toEqual([])
      expect(wizard.selectedUserTypeBlock.value).toBeNull()
      expect(wizard.selectedOptionTypeBlocks.value).toEqual([])
      expect(wizard.selectedPropertyTypeBlocks.value).toEqual([])
    })
    
    it('should toggle service selection', () => {
      const wizard = useBookingWizard()
      const mockService = { 
        id: 'block-1', 
        name: 'Test Service',
        entityKey: 'blockInstance',
        disabled: false,
        orderIndex: 0,
      } as unknown as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance
      
      // Initially empty
      expect(wizard.selectedServices.value.length).toBe(0)
      
      // Toggle on
      wizard.toggleService(mockService)
      expect(wizard.selectedServices.value.length).toBe(1)
      expect(wizard.selectedServices.value[0].id).toBe('block-1')
      
      // Toggle off
      wizard.toggleService(mockService)
      expect(wizard.selectedServices.value.length).toBe(0)
    })
    
    it('should clear selections on reset', () => {
      const wizard = useBookingWizard()
      const mockService = { id: 'block-1', name: 'Test Service' } as const
      
      wizard.toggleService(mockService as unknown as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance)
      expect(wizard.selectedServices.value.length).toBeGreaterThan(0)
      
      wizard.resetWizard()
      expect(wizard.selectedServices.value).toEqual([])
    })
  })
  
  describe('validation', () => {
    it('should have available services computed property', () => {
      const wizard = useBookingWizard()
      
      expect(wizard.availableServices.value).toBeInstanceOf(Array)
    })
    
    it('should have available availability options computed property', () => {
      const wizard = useBookingWizard()
      
      expect(wizard.availableOptionTypeBlocks.value).toBeInstanceOf(Array)
    })
  })
  
  describe('wizard state', () => {
    it('should have selected services array', () => {
      const wizard = useBookingWizard()
      
      expect(wizard.selectedServices.value).toBeInstanceOf(Array)
    })
    
    it('should have selected availability options array', () => {
      const wizard = useBookingWizard()
      
      expect(wizard.selectedOptionTypeBlocks.value).toBeInstanceOf(Array)
    })
  })
  
  describe('reset functionality', () => {
    it('should reset wizard to initial state', () => {
      const wizard = useBookingWizard()
      const mockService = { id: 'block-1', name: 'Test Service' } as const
      
      wizard.toggleService(mockService as unknown as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance)
      expect(wizard.selectedServices.value.length).toBeGreaterThan(0)
      
      wizard.resetWizard()
      
      expect(wizard.selectedServices.value).toEqual([])
    })
  })
})

