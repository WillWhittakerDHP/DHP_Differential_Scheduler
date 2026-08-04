/**
 * GET list of appointments for admin entry dropdown (Edit quote / Reschedule).
 * Session 6.8.6.2 — filtered by status (exclude cancelled, deleted) and admin time-out window.
 */

import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { Appointment } from '../../../config/app.js'
import { getAdminEntryTimeoutFromSettings } from './appointmentHelpers.js'
import { appointmentIncludes } from './appointmentHelpers.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import { sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { ERROR_MESSAGES } from './appointmentConstants.js'
import { FIELD_NAMES, SORT_ORDERS } from '../entities/entityConstants.js'
import type { AdminEntryAppointmentItem } from '../../../../../shared/types/appointmentTypes.js'
import { USER_ROLE_BUYER, USER_ROLE_AGENT } from '../../../../../shared/constants/roleConstants.js'

function formatAddress(addr: { address: string; unit: string | null; city: string; state: string; zipCode: string } | null | undefined): string {
  if (!addr) return ''
  const parts = [addr.address]
  if (addr.unit && addr.unit.trim()) parts.push(addr.unit)
  parts.push(`${addr.city}, ${addr.state} ${addr.zipCode}`)
  return parts.join(', ')
}

export async function listForAdminEntryHandler(req: Request, res: Response): Promise<void> {
  try {
    const timeout = await getAdminEntryTimeoutFromSettings()
    const valueDays = timeout.unit === 'weeks' ? timeout.value * 7 : timeout.value
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - valueDays)
    cutoff.setHours(0, 0, 0, 0)

    const appointments = await Appointment.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled', 'deleted'] as const },
        [FIELD_NAMES.CREATED_AT]: { [Op.gte]: cutoff },
      },
      include: appointmentIncludes,
      order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
    })

    const items: AdminEntryAppointmentItem[] = appointments.map((apt): AdminEntryAppointmentItem => {
      const pv = (apt as { propertyVersion?: { address?: { address: string; unit: string | null; city: string; state: string; zipCode: string } } }).propertyVersion
      const address = formatAddress(pv?.address ?? null)

      const rawAttendees = (apt as { attendees?: Array<{ userId: string; user?: { userRole: string } }> }).attendees
      const attendees = Array.isArray(rawAttendees) ? rawAttendees : []
      let buyerUserId: string | null = null
      let agentUserId: string | null = null
      for (const att of attendees) {
        const u = att.user
        const role = u?.userRole
        if (role === USER_ROLE_BUYER && !buyerUserId) buyerUserId = att.userId
        if ((role === USER_ROLE_AGENT || role === 'inspector') && !agentUserId) agentUserId = att.userId
      }

      return {
        id: apt.id,
        address,
        buyerUserId,
        agentUserId,
      }
    })

    sendSuccess(res, items)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENTS, 'listing appointments for admin entry')
  }
}
