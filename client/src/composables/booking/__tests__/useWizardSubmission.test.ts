/**
 * USEWIZARDSUBMISSION TESTS
 * 
 * Unit tests for useWizardSubmission composable.
 * Tests appointment submission orchestration logic.
 * 
 * What it covers:
 * - handleSubmit: Full submission flow with data collection and mutation
 * - Error handling: Various failure scenarios
 * - Success flow: Step navigation after successful submission
 * 
 * How it works:
 * - Mocks collectAppointmentData, createAppointment mutation
 * - Mocks showError and success notification functions
 * - Tests both success and error scenarios
 * 
 * What it validates:
 * - Correct orchestration order (collect data -> mutate -> notify)
 * - Proper error handling with message extraction
 * - Step navigation after successful submission
 * - Completed steps marking after success
 * 
 * Dependencies:
 * - vitest for testing and mocking
 * - vue ref for reactive state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useWizardSubmission } from '../useWizardSubmission'
import type { AppointmentRequest } from '@/types/appointment'

// Mock appointment data
function createMockAppointmentRequest(): AppointmentRequest {
  return {
    propertyId: 'property-1',
    appointmentTypeId: 'appt-type-1',
    primaryUserId: 'user-1',
    serviceInstanceIds: ['service-1'],
    propertyTypeBlockInstanceIds: ['property-type-1'],
    optionTypeBlockInstanceIds: ['option-1'],
    startDate: '2026-01-15',
    timeSlots: [{ time: '09:00' }],
    inspectorNotes: 'Test notes',
  } as AppointmentRequest
}

describe('useWizardSubmission', () => {
  let mockCollectAppointmentData: ReturnType<typeof vi.fn>
  let mockMutateAsync: ReturnType<typeof vi.fn>
  let mockShowError: ReturnType<typeof vi.fn>
  let mockSuccess: ReturnType<typeof vi.fn>
  let activeStep: ReturnType<typeof ref<number>>
  let completedSteps: ReturnType<typeof ref<Set<number>>>

  beforeEach(() => {
    mockCollectAppointmentData = vi.fn()
    mockMutateAsync = vi.fn()
    mockShowError = vi.fn()
    mockSuccess = vi.fn()
    activeStep = ref(3) // Usually submit from step 3 (0-indexed)
    completedSteps = ref(new Set<number>())
  })

  function createComposable() {
    return useWizardSubmission({
      collectAppointmentData: mockCollectAppointmentData,
      createAppointment: { mutateAsync: mockMutateAsync },
      activeStep,
      completedSteps,
      showError: mockShowError,
      success: mockSuccess,
    })
  }

  describe('handleSubmit - success flow', () => {
    it('should collect appointment data and call mutation', async () => {
      const appointmentData = createMockAppointmentRequest()
      mockCollectAppointmentData.mockResolvedValue(appointmentData)
      mockMutateAsync.mockResolvedValue({ id: 'new-appointment-id' })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockCollectAppointmentData).toHaveBeenCalledTimes(1)
      expect(mockMutateAsync).toHaveBeenCalledWith(appointmentData)
    })

    it('should show success message after creation', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockResolvedValue({ id: 'new-appointment-id' })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockSuccess).toHaveBeenCalledWith('Appointment created successfully!')
    })

    it('should navigate to confirmation step (index 4)', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockResolvedValue({ id: 'new-appointment-id' })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(activeStep.value).toBe(4)
    })

    it('should mark steps 0-3 as completed', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockResolvedValue({ id: 'new-appointment-id' })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(completedSteps.value.has(0)).toBe(true)
      expect(completedSteps.value.has(1)).toBe(true)
      expect(completedSteps.value.has(2)).toBe(true)
      expect(completedSteps.value.has(3)).toBe(true)
      expect(completedSteps.value.has(4)).toBe(false) // Confirmation step not in completedSteps
    })

    it('should preserve existing completed steps', async () => {
      completedSteps.value.add(0) // Already completed step 0
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockResolvedValue({ id: 'new-appointment-id' })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      // All steps 0-3 should be completed
      expect(completedSteps.value.size).toBe(4)
    })
  })

  describe('handleSubmit - data collection failure', () => {
    it('should return early if collectAppointmentData returns null', async () => {
      mockCollectAppointmentData.mockResolvedValue(null)

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockCollectAppointmentData).toHaveBeenCalledTimes(1)
      expect(mockMutateAsync).not.toHaveBeenCalled()
      expect(mockShowError).not.toHaveBeenCalled() // Error shown by collectAppointmentData
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('should not navigate to confirmation on data collection failure', async () => {
      mockCollectAppointmentData.mockResolvedValue(null)
      const initialStep = activeStep.value

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(activeStep.value).toBe(initialStep)
      expect(completedSteps.value.size).toBe(0)
    })
  })

  describe('handleSubmit - mutation failure', () => {
    it('should show error message when mutation throws Error', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockRejectedValue(new Error('Network error'))

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockShowError).toHaveBeenCalledWith('Network error')
    })

    it('should show default error message for non-Error throws', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockRejectedValue('String error')

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockShowError).toHaveBeenCalledWith('Failed to create appointment')
    })

    it('should not show success or navigate on mutation failure', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockRejectedValue(new Error('Server error'))
      const initialStep = activeStep.value

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(mockSuccess).not.toHaveBeenCalled()
      expect(activeStep.value).toBe(initialStep)
    })

    it('should not mark steps as completed on mutation failure', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockRejectedValue(new Error('Server error'))

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(completedSteps.value.size).toBe(0)
    })
  })

  describe('handleSubmit - async behavior', () => {
    it('should await collectAppointmentData before calling mutation', async () => {
      const callOrder: string[] = []
      
      mockCollectAppointmentData.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        callOrder.push('collect')
        return createMockAppointmentRequest()
      })
      
      mockMutateAsync.mockImplementation(async () => {
        callOrder.push('mutate')
        return { id: 'new-id' }
      })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(callOrder).toEqual(['collect', 'mutate'])
    })

    it('should await mutation before showing success', async () => {
      const callOrder: string[] = []
      
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      
      mockMutateAsync.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        callOrder.push('mutate')
        return { id: 'new-id' }
      })
      
      mockSuccess.mockImplementation(() => {
        callOrder.push('success')
      })

      const { handleSubmit } = createComposable()
      await handleSubmit()

      expect(callOrder).toEqual(['mutate', 'success'])
    })
  })

  describe('multiple submissions', () => {
    it('should handle multiple sequential submissions', async () => {
      mockCollectAppointmentData.mockResolvedValue(createMockAppointmentRequest())
      mockMutateAsync.mockResolvedValue({ id: 'new-id' })

      const { handleSubmit } = createComposable()
      
      await handleSubmit()
      expect(mockMutateAsync).toHaveBeenCalledTimes(1)
      
      // Reset step for second submission
      activeStep.value = 3
      completedSteps.value.clear()
      
      await handleSubmit()
      expect(mockMutateAsync).toHaveBeenCalledTimes(2)
    })
  })
})
