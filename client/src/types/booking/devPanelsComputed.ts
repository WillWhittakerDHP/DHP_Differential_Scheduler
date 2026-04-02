import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/types/transformers/bookingData'
import type { AppointmentShape, AppointmentSlot, SlotShape } from '@/types/appointment'
import type { PartFinal } from '@/types/booking/partFinal'

export interface DevPanelsComputedData {
  selectedBlockInstances: BookingBlockInstance[]
  appointmentSlots: AppointmentSlot[]
  appointmentShape: AppointmentShape | null
  selectedDate: string | undefined
  selectedTime: string | undefined
}

export interface UseDevPanelsComputedOptions {
  appointmentData: ComputedRef<DevPanelsComputedData>
}

export interface ServiceSummary {
  name: string
  orchestrator: boolean
  wizardVisible: boolean
  baseSqFt: number
  partCount: number
}

export interface TimeSlotResults {
  majorArrival: string | null
  minorArrival: string | null
  appointmentEnd: string | null
}

export interface UseDevPanelsComputedReturn {
  servicesSummary: ComputedRef<ServiceSummary[]>
  finalizedParts: ComputedRef<PartFinal[]>
  slotShapeTotals: ComputedRef<SlotShape>
  timeSlotResults: ComputedRef<TimeSlotResults>
  allActiveServiceTypes: ComputedRef<BookingBlockInstance[]>
  serviceTypeOptions: ComputedRef<Array<{ title: string; value: string }>>
}
