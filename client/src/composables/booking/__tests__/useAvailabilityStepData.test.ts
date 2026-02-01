
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { useAvailabilityStepData } from '../useAvailabilityStepData'
import type { TimeSlot } from '@/types/appointment'

vi.mock('@/utils/booking/availabilityStepData', () => ({
  buildSelectedTimeSlots: vi.fn(),
  buildAvailabilityStepData: vi.fn(),
}))

// Mock useAvailabilitySettings - SESSION: 2.1.3b
vi.mock('@/composables/booking/useAvailabilitySettings', () => ({
  useAvailabilitySettings: vi.fn(() => ({
    settings: computed(() => ({
      differentialPerspectives: {
        majorAttendees: ['mock-major-id'],
        minorAttendees: ['mock-minor-id'],
      },
    })),
    isLoading: ref(false),
    error: ref(null),
    hasError: computed(() => false),
    refresh: vi.fn(),
  })),
}))

import { buildSelectedTimeSlots, buildAvailabilityStepData } from '@/utils/booking/availabilityStepData'

describe('useAvailabilityStepData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildSelectedTimeSlots).mockReturnValue(null)
    vi.mocked(buildAvailabilityStepData).mockReturnValue({
      selectedDate: { start: null, end: null },
      selectedTimeSlots: null,
    })
  })

  describe('selectedTimeSlots', () => {
    it('should call buildSelectedTimeSlots with correct parameters', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>({
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T11:00:00',
      })
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 120)
      const presentationDuration = computed(() => 30)

      const { selectedTimeSlots } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      selectedTimeSlots.value

      expect(buildSelectedTimeSlots).toHaveBeenCalledWith({
        selectedDateStart: '2026-01-15',
        inspectorTimeSlot: {
          slotStart: '2026-01-15T09:00:00',
          slotEnd: '2026-01-15T11:00:00',
        },
        clientTimeSlot: null,
        onSiteTotal: 120,
        presentationDuration: 30,
      })
    })

    it('should return null when no date is selected', () => {
      const selectedDate = ref({ start: null, end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 0)
      const presentationDuration = computed(() => 0)

      vi.mocked(buildSelectedTimeSlots).mockReturnValue(null)

      const { selectedTimeSlots } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      expect(selectedTimeSlots.value).toBeNull()
    })

    it('should return transformed time slots when slots are selected', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>({
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T11:00:00',
      })
      const clientTimeSlot = ref<TimeSlot | null>({
        slotStart: '2026-01-15T11:00:00',
        slotEnd: '2026-01-15T11:30:00',
      })
      const onSiteTotal = computed(() => 120)
      const presentationDuration = computed(() => 30)

      const mockTransformedSlots = [
        {
          startTime: '2026-01-15T09:00:00Z',
          duration: 120,
          role: 'inspector' as const,
        },
        {
          startTime: '2026-01-15T11:00:00Z',
          duration: 30,
          role: 'client' as const,
        },
      ]

      vi.mocked(buildSelectedTimeSlots).mockReturnValue(mockTransformedSlots)

      const { selectedTimeSlots } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      expect(selectedTimeSlots.value).toEqual(mockTransformedSlots)
    })
  })

  describe('stepData', () => {
    it('should call buildAvailabilityStepData with correct parameters', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 0)
      const presentationDuration = computed(() => 0)

      vi.mocked(buildSelectedTimeSlots).mockReturnValue(null)

      const { stepData } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      stepData.value

      expect(buildAvailabilityStepData).toHaveBeenCalledWith({
        selectedDate: { start: '2026-01-15', end: null },
        selectedTimeSlots: null,
      })
    })

    it('should return step data with selectedDate and selectedTimeSlots', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>({
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T11:00:00',
      })
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 120)
      const presentationDuration = computed(() => 0)

      const mockTransformedSlots = [
        {
          startTime: '2026-01-15T09:00:00Z',
          duration: 120,
          role: 'inspector' as const,
        },
      ]

      vi.mocked(buildSelectedTimeSlots).mockReturnValue(mockTransformedSlots)
      vi.mocked(buildAvailabilityStepData).mockReturnValue({
        selectedDate: { start: '2026-01-15', end: null },
        selectedTimeSlots: mockTransformedSlots,
      })

      const { stepData } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      expect(stepData.value).toEqual({
        selectedDate: { start: '2026-01-15', end: null },
        selectedTimeSlots: mockTransformedSlots,
      })
    })
  })

  describe('reactivity', () => {
    it('should recompute when selectedDate changes', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 0)
      const presentationDuration = computed(() => 0)

      const { selectedTimeSlots } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      selectedTimeSlots.value
      expect(buildSelectedTimeSlots).toHaveBeenCalledTimes(1)

      selectedDate.value = { start: '2026-01-16', end: null }
      selectedTimeSlots.value
      expect(buildSelectedTimeSlots).toHaveBeenCalledTimes(2)
      expect(buildSelectedTimeSlots).toHaveBeenLastCalledWith(
        expect.objectContaining({
          selectedDateStart: '2026-01-16',
        })
      )
    })

    it('should recompute when inspectorTimeSlot changes', () => {
      const selectedDate = ref({ start: '2026-01-15', end: null })
      const inspectorTimeSlot = ref<TimeSlot | null>(null)
      const clientTimeSlot = ref<TimeSlot | null>(null)
      const onSiteTotal = computed(() => 120)
      const presentationDuration = computed(() => 0)

      const { selectedTimeSlots } = useAvailabilityStepData({
        selectedDate,
        inspectorTimeSlot,
        clientTimeSlot,
        onSiteTotal,
        presentationDuration,
      })

      selectedTimeSlots.value
      expect(buildSelectedTimeSlots).toHaveBeenCalledTimes(1)

      inspectorTimeSlot.value = {
        slotStart: '2026-01-15T09:00:00',
        slotEnd: '2026-01-15T11:00:00',
      }
      selectedTimeSlots.value
      expect(buildSelectedTimeSlots).toHaveBeenCalledTimes(2)
    })
  })
})
