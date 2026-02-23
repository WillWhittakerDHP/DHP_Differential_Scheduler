/**
 * Helper functions for appointment table display
 */

/**
 * Status color mapping function
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
