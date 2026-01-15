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

export type FieldFormatter = (
  appointment: AppointmentResponse,
  value: unknown,
  properties: PropertyResponse[],
  users: UserResponse[]
) => string

/**
 * LEARNING: Format null/undefined values for display
 * WHY: Consistent formatting across formatters
 */
function formatNullValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * LEARNING: Format property fields (propertyVersionId, propertyId)
 * WHY: Shows formatted address string instead of ID
 */
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

/**
 * LEARNING: Format user fields (clientId, agentId)
 * WHY: Shows full name instead of ID
 */
function formatUserField(
  value: unknown,
  users: UserResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const user = users.find(u => u.id === value)
  return user ? `${user.firstName} ${user.lastName}` : String(value)
}

/**
 * LEARNING: Format scheduledById field
 * WHY: Shows user role instead of name (as requested by user)
 */
function formatScheduledByField(
  value: unknown,
  users: UserResponse[]
): string {
  if (!value) return formatNullValue(value)
  
  const user = users.find(u => u.id === value)
  return user ? user.userRole : String(value)
}

/**
 * LEARNING: Format date fields
 * WHY: Converts date strings to localized date format
 */
function formatDateField(value: unknown): string {
  if (!value) return formatNullValue(value)
  return new Date(String(value)).toLocaleDateString()
}

/**
 * LEARNING: Format array fields with count
 * WHY: Shows count instead of full array
 */
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

/**
 * LEARNING: Get formatter for a field or return default formatter
 * WHY: Provides fallback for fields without custom formatters
 */
export function getAppointmentFieldFormatter(field: string): FieldFormatter {
  return APPOINTMENT_FIELD_FORMATTERS[field] || ((_appointment, value) => formatNullValue(value))
}
