/**
 * LEARNING: Appointment field formatters
 * WHY: Field formatting logic is hardcoded in useAppointmentsTableModel with repeated field checks
 * PATTERN: Config-driven formatter map that can be extended without modifying the composable
 * 
 * Used by:
 * - useAppointmentsTableModel.ts
 */

import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import type { RFC3339DateTime, ISO8601Date } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'

const { formatDateOnlyForDisplay, formatDateForDisplay } = useLocalTime()

export type FieldFormatter = (
  appointment: AppointmentResponse,
  value: unknown,
  properties: PropertyResponse[],
  users: UserResponse[]
) => string

function formatNullValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatPropertyField(
  appointment: AppointmentResponse,
  value: unknown,
  properties: PropertyResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const propertyVersionId = appointment.propertyVersionId || appointment.propertyId
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

function formatUserField(
  value: unknown,
  users: UserResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const user = users.find(u => u.id === value)
  return user ? `${user.firstName} ${user.lastName}` : String(value)
}

function formatScheduledByField(
  value: unknown,
  users: UserResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const user = users.find(u => u.id === value)
  return user ? user.userRole : String(value)
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

/**
 * LEARNING: Config-driven field formatter map
 * WHY: Eliminates repeated field === "..." checks, makes formatters extensible
 * PATTERN: Map field names to formatter functions
 */
export const APPOINTMENT_FIELD_FORMATTERS: Record<string, FieldFormatter> = {
  propertyVersionId: (appointment, value, properties) => formatPropertyField(appointment, value, properties),
  propertyId: (appointment, value, properties) => formatPropertyField(appointment, value, properties),
  clientId: (_appointment, value, _properties, users) => formatUserField(value, users),
  agentId: (_appointment, value, _properties, users) => formatUserField(value, users),
  scheduledById: (_appointment, value, _properties, users) => formatScheduledByField(value, users),
  status: (_appointment, value) => String(value || 'started'),
  selectedDate: (_appointment, value) => formatDateField(value),
  selectedTimeSlots: (_appointment, value) => formatArrayCountField(value, 'slot(s)'),
  selectedOptionTypeBlocks: (_appointment, value) => formatArrayCountField(value, 'option(s)'),
  propertyDetails: (_appointment, value) => formatNullValue(value),
  additionalContacts: (_appointment, value) => formatNullValue(value),
}

export function getAppointmentFieldFormatter(field: string): FieldFormatter {
  return APPOINTMENT_FIELD_FORMATTERS[field] || ((_appointment, value) => formatNullValue(value))
}
