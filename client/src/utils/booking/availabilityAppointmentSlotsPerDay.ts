/**
 * WHY: Heavy slot normalization loop lives here for audit-friendly composables.
 */

import type { AppointmentSlots, TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import {
  calculateAppointmentSlots,
  normalizeAppointmentSlotsByOrderIndex,
} from '@/utils/booking/appointmentTimeCalculations'
import { groupTimeSlotsByUtcDate } from '@/utils/booking/availabilitySlotGrouping'

export interface AppointmentSlotsPerDayRow {
  date: string
  appointmentSlots: AppointmentSlots
}

export function buildAppointmentSlotsPerDayRows(
  slots: TimeSlot[],
  blockInstances: BookingBlockInstance[],
  settings: AvailabilitySettings | null
): AppointmentSlotsPerDayRow[] {
  const slotsByDate = groupTimeSlotsByUtcDate(slots)

  return Array.from(slotsByDate.entries()).map(([date, daySlots]) => {
    const appointmentSlotsForDate: AppointmentSlots = []

    daySlots.forEach((slot, index) => {
      const calculatedSlots = calculateAppointmentSlots(
        blockInstances,
        slot.startTime,
        undefined,
        undefined,
        undefined,
        undefined,
        settings
      )
      const normalized = normalizeAppointmentSlotsByOrderIndex(
        calculatedSlots.map((calculatedSlot) => ({
          ...calculatedSlot,
          isAvailable: slot.isAvailable,
          flexibleViolations: slot.flexibleViolations,
          orderIndex: index,
        }))
      )
      appointmentSlotsForDate.push(...normalized)
    })

    return {
      date,
      appointmentSlots: normalizeAppointmentSlotsByOrderIndex(appointmentSlotsForDate),
    }
  })
}
