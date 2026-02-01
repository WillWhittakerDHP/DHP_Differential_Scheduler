
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useBookingWizardStepValidators } from '../useBookingWizardStepValidators'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

vi.mock('@/utils/booking/bookingWizardStepValidators', () => ({
  buildBookingWizardStepValidators: vi.fn(),
}))

import { buildBookingWizardStepValidators } from '@/utils/booking/bookingWizardStepValidators'

describe('useBookingWizardStepValidators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildBookingWizardStepValidators).mockReturnValue({
      0: null,
      1: null,
      2: null,
      3: null,
    })
  })

  describe('stepValidators computed', () => {
    it('should call buildBookingWizardStepValidators with hasServiceSelection', () => {
      const selectedUserTypeBlock = ref<BookingBlockInstance | null>({
        id: 'ut-1',
        name: 'User Type 1',
      } as BookingBlockInstance)
      const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([
        { id: 'service-1', name: 'Service 1' } as BookingBlockInstance,
      ])

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock,
        selectedServiceTypeBlocks,
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: null,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          hasServiceSelection: true,
        })
      )
    })

    it('should pass hasServiceSelection as false when no user type selected', () => {
      const selectedUserTypeBlock = ref<BookingBlockInstance | null>(null)
      const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([
        { id: 'service-1', name: 'Service 1' } as BookingBlockInstance,
      ])

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock,
        selectedServiceTypeBlocks,
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: null,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          hasServiceSelection: false,
        })
      )
    })

    it('should pass hasServiceSelection as false when no services selected', () => {
      const selectedUserTypeBlock = ref<BookingBlockInstance | null>({
        id: 'ut-1',
        name: 'User Type 1',
      } as BookingBlockInstance)
      const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([])

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock,
        selectedServiceTypeBlocks,
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: null,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          hasServiceSelection: false,
        })
      )
    })

    it('should unwrap ref validate functions', () => {
      const mockValidate = vi.fn(() => true)
      const propertyDetailsStepValidate = ref(mockValidate)

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock: ref(null),
        selectedServiceTypeBlocks: ref([]),
        propertyDetailsStepValid: ref(true),
        propertyDetailsStepValidate,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyDetailsStepValidate: mockValidate,
          propertyDetailsStepValid: true,
        })
      )
    })

    it('should pass direct function for validate (not wrapped in ref)', () => {
      const mockValidate = vi.fn(() => true)

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock: ref(null),
        selectedServiceTypeBlocks: ref([]),
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: mockValidate,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyDetailsStepValidate: mockValidate,
        })
      )
    })

    it('should pass validity states from refs', () => {
      const propertyDetailsStepValid = ref(true)
      const availabilityStepValid = ref(false)
      const contactsStepValid = ref(true)

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock: ref(null),
        selectedServiceTypeBlocks: ref([]),
        propertyDetailsStepValid,
        propertyDetailsStepValidate: null,
        availabilityStepValid,
        availabilityStepValidate: null,
        contactsStepValid,
        contactsStepValidate: null,
      })

      stepValidators.value

      expect(buildBookingWizardStepValidators).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyDetailsStepValid: true,
          availabilityStepValid: false,
          contactsStepValid: true,
        })
      )
    })

    it('should return stepValidators from buildBookingWizardStepValidators', () => {
      const mockValidators = {
        0: vi.fn(() => true),
        1: vi.fn(() => false),
        2: null,
        3: null,
      }
      vi.mocked(buildBookingWizardStepValidators).mockReturnValue(mockValidators)

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock: ref(null),
        selectedServiceTypeBlocks: ref([]),
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: null,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      expect(stepValidators.value).toBe(mockValidators)
    })
  })

  describe('reactivity', () => {
    it('should recompute when selectedServices changes', () => {
      const selectedServiceTypeBlocks = ref<BookingBlockInstance[]>([])

      const { stepValidators } = useBookingWizardStepValidators({
        selectedUserTypeBlock: ref({ id: 'ut-1' } as BookingBlockInstance),
        selectedServiceTypeBlocks,
        propertyDetailsStepValid: null,
        propertyDetailsStepValidate: null,
        availabilityStepValid: null,
        availabilityStepValidate: null,
        contactsStepValid: null,
        contactsStepValidate: null,
      })

      stepValidators.value
      expect(buildBookingWizardStepValidators).toHaveBeenCalledTimes(1)

      selectedServiceTypeBlocks.value = [{ id: 'service-1' } as BookingBlockInstance]
      stepValidators.value
      expect(buildBookingWizardStepValidators).toHaveBeenCalledTimes(2)
    })
  })
})
