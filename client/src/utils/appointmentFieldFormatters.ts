/**
 * WHY: Appointment field formatters
WHY: Field formatting logic is hardcoded in...
 */
import { getClientAttendee, getAgentAttendee } from '@/utils/admin/appointmentAttendees'
import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import { localTime } from '@/utils/time/localTime'
import { formatNullValue } from '@/utils/formatting/nullDisplay'

const { formatDateOnlyForDisplay, formatDateForDisplay } = localTime()

type FieldFormatter = (
  appointment: AppointmentResponse,
  value: unknown,
  properties: PropertyResponse[],
  users: UserResponse[]
) => string

function formatPropertyField(
  appointment: AppointmentResponse,
  value: unknown,
  properties: PropertyResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const propertyVersionId = appointment.propertyVersionId
  if (propertyVersionId) {
    const property = properties.find(p => p.propertyVersionId === propertyVersionId || p.id === propertyVersionId)
    if (property) return `${property.address}, ${property.city}, ${property.state}`
  }
  
  if (appointment.propertyVersion?.address) {
    const addr = appointment.propertyVersion.address
    return `${addr.address}, ${addr.city}, ${addr.state}`
  }
  
  return String(value)
}

/** Display name (firstName lastName) when user in list; else role; else id. Matches client/agent pattern. */
function formatScheduledByField(
  value: unknown,
  users: UserResponse[]
): string {
  if (!value) return formatNullValue(value)

  const user = users.find(u => u.id === value)
  if (!user) return String(value)
  if (user.firstName != null || user.lastName != null) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.userRole || String(value)
  }
  return user.userRole || String(value)
}

function formatDateField(value: unknown): string {
  if (!value) return formatNullValue(value)
  const dateString = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return formatDateOnlyForDisplay(dateString as ISO8601Date)
  }
  return formatDateForDisplay(dateString as RFC3339DateTime)
}

function formatArrayCountField(value: unknown, label: string): string {
  if (!value) return formatNullValue(value)
  return Array.isArray(value) ? `${value.length} ${label}` : formatNullValue(value)
}

function formatClientField(
  appointment: AppointmentResponse,
  _value: unknown,
  _properties: PropertyResponse[],
  users: UserResponse[]
): string {
  const clientAttendee = getClientAttendee(appointment)
  if (clientAttendee?.user) {
    return `${clientAttendee.user.firstName} ${clientAttendee.user.lastName}`
  }
  if (clientAttendee?.userId) {
    const user = users.find(u => u.id === clientAttendee.userId)
    return user ? `${user.firstName} ${user.lastName}` : '—'
  }
  return '—'
}

function formatAgentField(
  appointment: AppointmentResponse,
  _value: unknown,
  _properties: PropertyResponse[],
  users: UserResponse[]
): string {
  const agentAttendee = getAgentAttendee(appointment)
  if (agentAttendee?.user) {
    return `${agentAttendee.user.firstName} ${agentAttendee.user.lastName}`
  }
  if (agentAttendee?.userId) {
    const user = users.find(u => u.id === agentAttendee.userId)
    return user ? `${user.firstName} ${user.lastName}` : '—'
  }
  return '—'
}

/**
 * WHY: Config-driven field formatter map
WHY: Eliminates repeated field === ".....
 */
const APPOINTMENT_FIELD_FORMATTERS: Record<string, FieldFormatter> = {
  propertyVersionId: (appointment, value, properties) => formatPropertyField(appointment, value, properties),
  propertyId: (appointment, value, properties) => formatPropertyField(appointment, value, properties),
  client: (appointment, value, properties, users) => formatClientField(appointment, value, properties, users),
  agent: (appointment, value, properties, users) => formatAgentField(appointment, value, properties, users),
  scheduledById: (_appointment, value, _properties, users) => formatScheduledByField(value, users),
  status: (_appointment, value) => String(value || 'started'),
  selectedDate: (_appointment, value) => formatDateField(value),
  selectedTimeSlots: (_appointment, value) => formatArrayCountField(value, 'slot(s)'),
  selectedOptionIds: (_appointment, value) => formatArrayCountField(value, 'option(s)'),
  selectedOptionTypeBlocks: (_appointment, value) => formatArrayCountField(value, 'option(s)'),
  propertyDetails: (_appointment, value) => formatNullValue(value),
}

export function getAppointmentFieldFormatter(field: string): FieldFormatter {
  return APPOINTMENT_FIELD_FORMATTERS[field] || ((_appointment, value) => formatNullValue(value))
}
