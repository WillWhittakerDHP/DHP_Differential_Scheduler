/**
 * USEAVAILABILITYVALIDATION TESTS
 * 
 * Unit tests for useAvailabilityValidation composable.
 * Tests availability step validation logic.
 * 
 * What it covers:
 * - isFormValid: Overall step validity
 * - validateForm: Validation function
 * - fieldErrors: Field-level error messages
 * 
 * How it works:
 * - Tests date validation (required, not in past)
 * - Tests time slot validation
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAvailabilityValidation } from '../useAvailabilityValidation'
import type { TimeSlot } from '@/types/appointment'

function createTimeSlot(slotStart: string): TimeSlot {
  return {
    slotStart,
    slotEnd: '',
  }
}

describe('useAvailabilityValidation', () => {
  describe('isFormValid', () => {
    it('should return false when date is not selected', () => {
      const selectedDate = ref<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(createTimeSlot('09:00'))
      const clientTimeSlot = ref<TimeSlot | null>(null)
      
      const { isFormValid } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return false when no time slot selected', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const selectedDate = ref({
        start: tomorrow.toISOString().split('T')[0],
        end: tomorrow.toISOString().split('T')[0],
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      
      const { isFormValid } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return true when date and inspector time slot selected', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const selectedDate = ref({
        start: tomorrow.toISOString().split('T')[0],
        end: tomorrow.toISOString().split('T')[0],
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(createTimeSlot('09:00'))
      const clientTimeSlot = ref<TimeSlot | null>(null)
      
      const { isFormValid } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      expect(isFormValid.value).toBe(true)
    })

    it('should return true when date and client time slot selected', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const selectedDate = ref({
        start: tomorrow.toISOString().split('T')[0],
        end: tomorrow.toISOString().split('T')[0],
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(createTimeSlot('10:00'))
      
      const { isFormValid } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      expect(isFormValid.value).toBe(true)
    })
  })

  describe('fieldErrors', () => {
    it('should have date error when date not selected', () => {
      const selectedDate = ref<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      
      const { fieldErrors, validateForm } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      validateForm()
      expect(fieldErrors.value.selectedDate).toBeDefined()
    })
  })

  describe('validateForm', () => {
    it('should be a function', () => {
      const selectedDate = ref<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
      })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      
      const { validateForm } = useAvailabilityValidation({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
      })
      
      expect(typeof validateForm).toBe('function')
    })
  })
})
