
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookingWizard } from '../useBookingWizard'
import { createAtomicBlockGlobalData } from '@/utils/__tests__/factories/globalDataFactory'

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

      expect(wizard.selectedServiceTypeBlocks.value).toEqual([])
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

      expect(wizard.selectedServiceTypeBlocks.value.length).toBe(0)

      wizard.toggleServiceTypeBlock(mockService)
      expect(wizard.selectedServiceTypeBlocks.value.length).toBe(1)
      expect(wizard.selectedServiceTypeBlocks.value[0].id).toBe('block-1')

      wizard.toggleServiceTypeBlock(mockService)
      expect(wizard.selectedServiceTypeBlocks.value.length).toBe(0)
    })

    it('should clear dependent selections when service is toggled', () => {
      const wizard = useBookingWizard()
      const mockService = { id: 'block-1', name: 'Test Service' } as unknown as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance

      wizard.toggleServiceTypeBlock(mockService)
      wizard.selectedOptionTypeBlocks.value = [{ ...mockService, id: 'opt-1' }] as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance[]
      wizard.toggleServiceTypeBlock({ ...mockService, id: 'block-2' } as import('@/utils/transformers/globalToBookingTransformer').BookingBlockInstance)
      expect(wizard.selectedOptionTypeBlocks.value).toEqual([])
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

      expect(wizard.selectedServiceTypeBlocks.value).toBeInstanceOf(Array)
    })

    it('should have selected availability options array', () => {
      const wizard = useBookingWizard()

      expect(wizard.selectedOptionTypeBlocks.value).toBeInstanceOf(Array)
    })
  })

  describe('batchUpdate', () => {
    it('should expose batchUpdate for multi-step updates', () => {
      const wizard = useBookingWizard()
      expect(typeof wizard.batchUpdate).toBe('function')
    })
  })
})

