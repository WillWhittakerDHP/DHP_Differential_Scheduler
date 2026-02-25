
export interface InviteAppointmentData {
  id: string
  selectedDate: Date | string | null
  selectedTimeSlots: Array<{ startTime: string; endTime: string }> | null
  status: string
  propertyVersion?: {
    address?: {
      streetAddress: string
      city: string
      state: string
      zipCode: string
    }
  } | null
}

export function buildInviteContext(
  appointment: InviteAppointmentData,
  serviceName?: string
): Record<string, string> {
  const context: Record<string, string> = {}

  context.appointmentId = appointment.id
  context.status = appointment.status

  const address = appointment.propertyVersion?.address
  if (address) {
    context.streetAddress = address.streetAddress
    context.city = address.city
    context.state = address.state
    context.zipCode = address.zipCode
    context.fullAddress = [
      address.streetAddress,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(', ')
  }

  if (appointment.selectedDate) {
    const dateObj =
      typeof appointment.selectedDate === 'string'
        ? new Date(appointment.selectedDate + 'T00:00:00')
        : appointment.selectedDate

    context.appointmentDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const firstSlot = appointment.selectedTimeSlots?.[0]
  if (firstSlot?.startTime) {
    const startDate = new Date(firstSlot.startTime)
    context.appointmentTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (serviceName) {
    context.service = serviceName
  }

  return context
}

export { EVENT_TEMPLATE_VARIABLES as AVAILABLE_TEMPLATE_VARIABLES } from '../../../../shared/constants/templateVariables.js'
