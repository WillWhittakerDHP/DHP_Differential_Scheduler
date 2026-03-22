/**
 * Canonical list of template variables for calendar event / invite context.
 * WHY: Single source for client (InstancesTab event template UI) and server (invite context builder).
 */
export const EVENT_TEMPLATE_VARIABLES = [
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
  { name: 'rescheduleLink', description: 'Full URL for reschedule flow', example: 'https://example.com/booking?mode=reschedule&appointmentId=abc-123' },
  { name: 'cancelLink', description: 'Full URL for cancel flow', example: 'https://example.com/cancel?appointmentId=abc-123' },
] as const
