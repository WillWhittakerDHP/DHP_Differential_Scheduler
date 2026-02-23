
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

export const AVAILABLE_TEMPLATE_VARIABLES = [
  { name: 'streetAddress', description: 'Property street address', example: '123 Main St' },
  { name: 'city', description: 'Property city', example: 'Austin' },
  { name: 'state', description: 'Property state abbreviation', example: 'TX' },
  { name: 'zipCode', description: 'Property ZIP code', example: '78701' },
  { name: 'fullAddress', description: 'Full formatted address', example: '123 Main St, Austin, TX 78701' },
  { name: 'appointmentDate', description: 'Formatted appointment date', example: 'February 21, 2026' },
  { name: 'appointmentTime', description: 'Formatted start time', example: '2:30 PM' },
  { name: 'appointmentId', description: 'Appointment UUID', example: 'abc-123-def' },
  { name: 'status', description: 'Current appointment status', example: 'confirmed' },
  { name: 'service', description: 'Primary service name', example: "Buyer's Inspection" },
] as const
