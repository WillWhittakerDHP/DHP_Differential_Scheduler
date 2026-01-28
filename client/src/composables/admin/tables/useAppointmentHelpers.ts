/**
 * Helper functions for appointment table display
 * WHY: Extracts helper functions from AppointmentsTable component
 * PATTERN: Pure helper functions for display logic
 */

/**
 * Status color mapping function
 * LEARNING: Provides visual distinction between different appointment statuses
 * WHY: Color coding for status workflow stages
 * PATTERN: Color mapping object
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    started: 'blue',
    held: 'purple',
    rescheduling: 'orange',
    quoted: 'cyan',
    submitted: 'amber',
    confirmed: 'success',
    cancelled: 'error',
    deleted: 'grey',
  }
  return colorMap[status] || 'default'
}

/**
 * User role color mapping function
 * LEARNING: Provides visual distinction between different user roles in Scheduled By column
 * WHY: Color coding for user types
 * PATTERN: Color mapping object
 */
export function getRoleColor(role: string | undefined): string {
  if (!role) return 'default'
  const colorMap: Record<string, string> = {
    client: 'primary',
    agent: 'info',
    transaction_manager: 'warning',
    seller: 'secondary',
    inspector: 'success',
  }
  return colorMap[role] || 'default'
}
