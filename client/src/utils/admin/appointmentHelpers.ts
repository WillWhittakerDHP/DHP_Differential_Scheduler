/**
 * Pure helpers for appointment table display: status/role colors and timestamp formatting.
 * WHY: Shared by AppointmentsTable.vue and useAppointmentsTableHandlers (no Vue reactivity).
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

export function getRoleColor(role: string | undefined): string {
  if (!role) return 'default'
  const colorMap: Record<string, string> = {
    client: 'primary',
    agent: 'info',
    transaction_manager: 'warning',
    owner: 'secondary',
    inspector: 'success',
  }
  return colorMap[role] || 'default'
}

export function formatAppointmentTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
