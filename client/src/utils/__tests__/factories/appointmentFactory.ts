
import type { Appointment } from '@/types/appointment'
import type { GlobalEntityId } from '@/types/entities'

export function createAppointment(
  id: GlobalEntityId,
  options: {
    userId?: string
    propertyVersionId?: string
    propertyId?: string // Deprecated, kept for backward compatibility
    startTime?: string
    endTime?: string
    status?: 'scheduled' | 'completed' | 'cancelled'
    notes?: string
  } = {}
): Appointment {
  const startTime = options.startTime || new Date('2026-01-15T10:00:00Z').toISOString()
  const endTime = options.endTime || new Date('2026-01-15T12:00:00Z').toISOString()
  
  return {
    id,
    userId: options.userId || 'user-1',
    propertyVersionId: options.propertyVersionId || options.propertyId || 'property-version-1', // Use propertyVersionId, fallback to propertyId for compatibility
    propertyId: options.propertyId || options.propertyVersionId || 'property-1', // Keep for backward compatibility
    startTime,
    endTime,
    status: options.status || 'scheduled',
    notes: options.notes || '',
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  } as Appointment
}

export function createAppointments(
  count: number,
  baseDate: Date = new Date('2026-01-15T10:00:00Z')
): Appointment[] {
  return Array.from({ length: count }, (_, i) => {
    const startTime = new Date(baseDate)
    startTime.setHours(startTime.getHours() + (i * 2))
    
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 2)
    
    return createAppointment(`appointment-${i + 1}`, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    })
  })
}

export function createAppointmentWithBlocks(
  id: GlobalEntityId,
  blockInstanceIds: string[],
  options: {
    startTime?: string
    endTime?: string
  } = {}
) {
  const appointment = createAppointment(id, options)
  
  return {
    appointment,
    blockInstanceIds,
  }
}

