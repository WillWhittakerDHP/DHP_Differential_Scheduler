import { EMPTY_STRING, nilToEmptyString } from '@shared/utils/nilDefaults.js'

/** Base URL for client-facing links (reschedule, cancel). Use APP_BASE_URL or VITE_APP_BASE_URL. */
function getAppBaseUrl(): string {
  const primary = process.env.APP_BASE_URL
  const secondary = process.env.VITE_APP_BASE_URL
  const base =
    primary !== undefined && primary !== null && primary !== ''
      ? primary
      : secondary !== undefined && secondary !== null && secondary !== ''
        ? secondary
        : EMPTY_STRING
  return base.replace(/\/$/, '')
}

/** Build full reschedule URL. Matches client buildClientLinks. */
function buildRescheduleUrl(appointmentId: string): string {
  const base = getAppBaseUrl()
  const path = `/booking?mode=reschedule&appointmentId=${encodeURIComponent(appointmentId)}`
  return base ? `${base}${path}` : path
}

/** Build full cancel URL. Matches client buildClientLinks. */
function buildCancelUrl(appointmentId: string): string {
  const base = getAppBaseUrl()
  const path = `/cancel?appointmentId=${encodeURIComponent(appointmentId)}`
  return base ? `${base}${path}` : path
}

export interface InviteAppointmentData {
  id: string
  selectedDate: Date | string | null
  selectedTimeSlots: Array<{ startTime: string; endTime: string }> | null
  status: string
  propertyVersion?: {
    address?: {
      streetAddress?: string
      /** DB column name on Sequelize Address model (street line). */
      address?: string
      city?: string
      state?: string
      zipCode?: string
    }
  } | null
}

export function buildInviteContext(
  appointment: InviteAppointmentData,
  serviceName?: string
): Record<string, string> {
  const context: Record<string, string> = {}

  context.appointmentId = appointment.id
  context.status = appointment.status
  context.rescheduleLink = buildRescheduleUrl(appointment.id)
  context.cancelLink = buildCancelUrl(appointment.id)

  const address = appointment.propertyVersion?.address
  if (address) {
    /** WHY: Sequelize `Address` uses column `address`; API/docs use `streetAddress` — support both. */
    const addr = address as {
      streetAddress?: string
      address?: string
      city?: string
      state?: string
      zipCode?: string
    }
    const primaryStreet = nilToEmptyString(addr.streetAddress)
    const street = primaryStreet !== '' ? primaryStreet : nilToEmptyString(addr.address)
    context.streetAddress = street
    context.city = nilToEmptyString(addr.city)
    context.state = nilToEmptyString(addr.state)
    context.zipCode = nilToEmptyString(addr.zipCode)
    context.fullAddress = [street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ')
  }

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

  if (serviceName) {
    context.service = serviceName
  }

  return context
}

export { EVENT_TEMPLATE_VARIABLES as AVAILABLE_TEMPLATE_VARIABLES } from '../../../../shared/constants/templateVariables.js'
