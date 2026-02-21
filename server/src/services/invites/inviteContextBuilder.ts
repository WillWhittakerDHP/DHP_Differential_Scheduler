/**
 * Invite Context Builder
 *
 * Builds a flat Record<string, string> context from appointment data
 * for use with the template resolver.
 *
 * PATTERN: Data transformation — no side effects, accepts pre-loaded appointment data.
 *
 * Available template variables:
 *
 *   Property:
 *     {streetAddress}  — e.g. "123 Main St"
 *     {city}           — e.g. "Austin"
 *     {state}          — e.g. "TX"
 *     {zipCode}        — e.g. "78701"
 *     {fullAddress}    — e.g. "123 Main St, Austin, TX 78701"
 *
 *   Appointment:
 *     {appointmentDate} — e.g. "February 21, 2026"
 *     {appointmentTime} — e.g. "2:30 PM"
 *     {appointmentId}   — UUID
 *     {status}          — e.g. "confirmed"
 *
 *   Service:
 *     {service}         — primary service name, e.g. "Buyer's Inspection"
 */

/**
 * Shape of appointment data accepted by the context builder.
 * Mirrors what the orchestration service fetches via Sequelize includes.
 */
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

/**
 * Build a template context from appointment data.
 *
 * @param appointment - Pre-loaded appointment with propertyVersion.address
 * @param serviceName - Optional primary service name (resolved by orchestration service)
 * @returns Flat context object suitable for resolveTemplate()
 */
export function buildInviteContext(
  appointment: InviteAppointmentData,
  serviceName?: string
): Record<string, string> {
  const context: Record<string, string> = {}

  context.appointmentId = appointment.id
  context.status = appointment.status

  // Property / address variables
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

  // Date / time variables
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

  // Service variable
  if (serviceName) {
    context.service = serviceName
  }

  return context
}

/**
 * All template variables that can appear in templates.
 * Useful for admin UI help text and documentation.
 */
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
