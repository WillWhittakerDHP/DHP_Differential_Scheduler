/**
 * WHY: Constraint Colors and Formatting Utilities

WHY: Centralizes color mappi...
 */
export const CONSTRAINT_COLORS: Record<string, string> = {
  'overlap.event.direct': '#1565C0',          // Dark Blue - regular calendar event
  'overlap.outOfOffice.direct': '#64B5F6',    // Light Blue - out-of-office event
  
  // Buffer overlap - by CONSTRAINT TYPE (what rule added the buffer)
  'overlap.appointment.buffer': '#90CAF9',    // Lighter Blue - appointment buffer
  'overlap.driveToCandidate.buffer': '#FFB74D',    // Light yellow-orange - drive to buffer
  'overlap.driveFromCandidate.buffer': '#E65100',  // Dark red-orange - drive from buffer
  'overlap.lunch.buffer': '#BA68C8',          // Light Purple - lunch buffer
  
  // Legacy / fallback (unprefixed overlap types)
  'overlap.appointment.direct': '#1565C0',
  'overlap.appointment': '#2196F3',
  'overlap.driveToCandidate.direct': '#FFA726',    // Light yellow-orange
  'overlap.driveFromCandidate.direct': '#D84315',  // Dark red-orange
  'overlap.lunch.direct': '#6A1B9A',
  'overlap.driveToCandidate': '#FFB74D',    // Light yellow-orange
  'overlap.driveFromCandidate': '#E65100',  // Dark red-orange
  'overlap.lunch': '#9C27B0',
  
  // Capacity constraints (format: 'capacity.{type}')
  'capacity.daily': '#009688',         // Teal
  'capacity.calendarWeek': '#00BCD4',  // Cyan
  'capacity.rollingWeek': '#3F51B5',   // Indigo
  
  // Range constraints (format: 'range.{type}')
  'range.leadTime': '#FFC107',         // Amber
  'range.dateRange': '#FF5722',        // Deep Orange
  'range.businessHours': '#E91E63'     // Pink
}

export function getColorForViolation(violationType: string): string {
  if (CONSTRAINT_COLORS[violationType]) {
    return CONSTRAINT_COLORS[violationType]
  }
  
  const baseType = violationType.replace(/:\d+$/, '')
  if (CONSTRAINT_COLORS[baseType]) {
    return CONSTRAINT_COLORS[baseType]
  }
  
  return '#757575'
}

export function formatViolationTooltip(violationType: string): string {
  const parts = violationType.split('.')
  
  if (parts[0] === 'overlap' && parts.length >= 3) {
    const constraintName = parts[1] // e.g., 'appointment', 'driveToCandidate', 'event'
    const reasonPart = parts[2] // 'direct' or 'buffer' or 'buffer:20'
    
    let reason = reasonPart
    let bufferMinutes: number | null = null
    if (reasonPart.includes(':')) {
      const [reasonType, minutes] = reasonPart.split(':')
      reason = reasonType
      bufferMinutes = parseInt(minutes, 10)
    }
    
    const nameMap: Record<string, string> = {
      'event': 'Calendar Event',
      'outOfOffice': 'Out of Office',
      'appointment': 'Appointment Buffer',
      'driveToCandidate': 'Drive To Appointment',
      'driveFromCandidate': 'Drive From Appointment',
      'lunch': 'Lunch Break'
    }
    
    const friendlyName = nameMap[constraintName] || constraintName
    
    if (reason === 'direct') {
      return `Direct conflict with ${friendlyName}`
    } else if (reason === 'buffer') {
      if (bufferMinutes !== null && !isNaN(bufferMinutes)) {
        return `${friendlyName} buffer (${bufferMinutes} min)`
      }
      return `${friendlyName} buffer required`
    }
  }
  
  // Handle capacity and range constraints
  if (parts[0] === 'capacity') {
    const capacityType = parts[1] || 'capacity'
    const typeMap: Record<string, string> = {
      'daily': 'Daily Capacity',
      'calendarWeek': 'Calendar Week Capacity',
      'rollingWeek': 'Rolling Week Capacity'
    }
    return typeMap[capacityType] || `Capacity: ${capacityType}`
  }
  
  if (parts[0] === 'range') {
    const rangeType = parts[1] || 'range'
    const typeMap: Record<string, string> = {
      'leadTime': 'Lead Time',
      'dateRange': 'Date Range',
      'businessHours': 'Business Hours'
    }
    return typeMap[rangeType] || `Range: ${rangeType}`
  }
  
  return `Blocked by: ${violationType}`
}
