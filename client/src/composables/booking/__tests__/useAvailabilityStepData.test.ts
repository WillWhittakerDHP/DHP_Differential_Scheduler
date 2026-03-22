import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAvailabilityStepData } from '../useAvailabilityStepData'
import type { AppointmentSlot } from '@/types/appointment'

vi.mock('@/utils/booking/availabilityStepData', () => ({
  buildSelectedTimeSlots: vi.fn(),
  buildAvailabilityStepData: vi.fn(),
  totalDriveMinutesFromAppointmentSlot: vi.fn(),
}))

import {
  buildSelectedTimeSlots,
  buildAvailabilityStepData,
  totalDriveMinutesFromAppointmentSlot,
} from '@/utils/booking/availabilityStepData'

describe('useAvailabilityStepData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildSelectedTimeSlots).mockReturnValue(null)
    vi.mocked(totalDriveMinutesFromAppointmentSlot).mockReturnValue(null)
    vi.mocked(buildAvailabilityStepData).mockReturnValue({
      candidateDate: { start: null, end: null },
      candidateTimeSlots: null,
      moveableScheduling: null,
      totalDriveMinutes: null,
    })
  })

  it('calls buildSelectedTimeSlots with selected date and slot', () => {
    const selectedDate = ref<{ start: string | null; end: string | null }>({
      start: '2026-01-15',
      end: '2026-01-15',
    })
    const selectedSlot = ref<AppointmentSlot | null>(null)

    const { selectedTimeSlots } = useAvailabilityStepData({
      selectedDate,
      selectedSlot,
      moveableScheduling: ref(null),
    })
    void selectedTimeSlots.value

    expect(buildSelectedTimeSlots).toHaveBeenCalledWith({
      selectedDateStart: '2026-01-15',
      selectedSlot: null,
    })
  })

  it('calls buildAvailabilityStepData with totalDriveMinutes from slot helper', () => {
    const selectedDate = ref<{ start: string | null; end: string | null }>({
      start: '2026-01-15',
      end: '2026-01-15',
    })
    const selectedSlot = ref<AppointmentSlot | null>(null)
    vi.mocked(totalDriveMinutesFromAppointmentSlot).mockReturnValue(42)

    const { stepData } = useAvailabilityStepData({
      selectedDate,
      selectedSlot,
      moveableScheduling: ref(null),
    })
    void stepData.value

    expect(buildAvailabilityStepData).toHaveBeenCalledWith({
      candidateDate: { start: '2026-01-15', end: '2026-01-15' },
      candidateTimeSlots: null,
      moveableScheduling: null,
      totalDriveMinutes: 42,
    })
  })
})
