import type { AppointmentResponse, AppointmentRequest } from '@/types/appointment'
import type { AppointmentSelectedTimeSlotPayload } from '@shared/types/appointmentTypes'

export function mapAppointmentToEditPayload(appointment: AppointmentResponse): Partial<AppointmentRequest> {
  return {
    propertyVersionId: appointment.propertyVersionId || null,
    userTypeBlockId: appointment.userTypeId || null,
    selectedOptionIds: appointment.selectedOptionIds || null,
    selectedDate: appointment.selectedDate || null,
    selectedDateRangeEnd: appointment.selectedDateRangeEnd || null,
    selectedTimeSlots: appointment.selectedTimeSlots
      ? ((appointment.selectedTimeSlots as Array<{ time: string; duration: number }>).map((slot) => ({
          startTime: slot.time,
          endTime: slot.time,
          duration: slot.duration,
        })) as AppointmentSelectedTimeSlotPayload[])
      : null,
    isQuoteMode: appointment.isQuoteMode,
    quotePdfUrl: appointment.quotePdfUrl || null,
    status: appointment.status,
    scheduledById: appointment.scheduledById || null,
    propertyDetails: appointment.propertyDetails || null,
    attendees:
      appointment.attendees?.map((attendee) => ({
        userId: attendee.userId,
        userTypeBlockInstanceId: attendee.userTypeBlockInstanceId || null,
        shouldReceiveInvitation: attendee.shouldReceiveInvitation ?? true,
      })) || null,
  }
}
