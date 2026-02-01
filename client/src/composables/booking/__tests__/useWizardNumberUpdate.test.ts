
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import * as vue from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

const mockInject = vi.fn()

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof vue>('vue')
  return {
    ...actual,
    inject: (...args: unknown[]) => mockInject(...args),
  }
})

import { useWizardNumberUpdate } from '../useWizardNumberUpdate'

function createInstance(id: string, number: number | null = null): BookingBlockInstance {
  return {
    id,
    name: `Instance ${id}`,
    number,
  } as BookingBlockInstance
}

describe('useWizardNumberUpdate', () => {
  beforeEach(() => {
    mockInject.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('updateNumber', () => {
    it('should not throw when wizard is not injected', () => {
      mockInject.mockReturnValue(undefined)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      expect(() => updateNumber('instance-1', 5)).not.toThrow()
    })

    it('should update number in selectedServices', () => {
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([createInstance('service-1')]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
      }
      mockInject.mockReturnValue(wizard)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      updateNumber('service-1', 10)
      
      expect(wizard.selectedServices.value[0].number).toBe(10)
    })

    it('should update number in selectedPropertyTypeBlocks', () => {
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([createInstance('property-1')]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
      }
      mockInject.mockReturnValue(wizard)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      updateNumber('property-1', 20)
      
      expect(wizard.selectedPropertyTypeBlocks.value[0].number).toBe(20)
    })

    it('should update number in selectedOptionTypeBlocks', () => {
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([createInstance('option-1')]),
      }
      mockInject.mockReturnValue(wizard)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      updateNumber('option-1', 30)
      
      expect(wizard.selectedOptionTypeBlocks.value[0].number).toBe(30)
    })

    it('should handle null number value', () => {
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([createInstance('service-1', 5)]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
      }
      mockInject.mockReturnValue(wizard)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      updateNumber('service-1', null)
      
      expect(wizard.selectedServices.value[0].number).toBeNull()
    })

    it('should not modify other instances', () => {
      const wizard = {
        selectedServices: ref<BookingBlockInstance[]>([
          createInstance('service-1', 1),
          createInstance('service-2', 2),
        ]),
        selectedPropertyTypeBlocks: ref<BookingBlockInstance[]>([]),
        selectedOptionTypeBlocks: ref<BookingBlockInstance[]>([]),
      }
      mockInject.mockReturnValue(wizard)
      
      const { updateNumber } = useWizardNumberUpdate()
      
      updateNumber('service-1', 10)
      
      expect(wizard.selectedServices.value[0].number).toBe(10)
      expect(wizard.selectedServices.value[1].number).toBe(2)
    })
  })
})
