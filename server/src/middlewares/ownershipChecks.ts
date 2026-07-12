/**
 * Resource ownership for checkOwnership middleware.
 * WHY: Anonymous booking flows stay open; authenticated non-privileged users cannot read others' appointments by id.
 */

import type { Request, Response } from 'express'
import { Appointment } from '../config/app.js'
import { AUTH_FAILURE_CODES } from '../auth/strategies/strategyTypes.js'
import { createLogger } from '../utils/logger.js'
import { paramString } from '../routes/helpers/requestHelpers.js'
import {
  USER_ROLE_ADMIN,
  USER_ROLE_INSPECTOR,
  USER_ROLE_OWNER,
} from '../constants/userRoles.js'

const logger = createLogger('middleware.ownership')

const OWNERSHIP_FORBIDDEN_MESSAGE = 'You do not have access to this resource'

/** Roles treated as able to access any resource (admin-style). */
function isPrivilegedRole(role: string | undefined): boolean {
  if (role === undefined || role === '') {
    return false
  }
  return (
    role === USER_ROLE_ADMIN ||
    role === USER_ROLE_INSPECTOR ||
    role === USER_ROLE_OWNER
  )
}

async function checkAppointmentOwnership(
  req: Request,
  res: Response,
  paramKey: string
): Promise<boolean> {
  const uid = req.user?.id
  if (uid === undefined) {
    return true
  }
  if (isPrivilegedRole(req.user?.role)) {
    return true
  }
  const id = paramString(req, paramKey)
  if (id === '') {
    logger.warn('appointment ownership: missing route param', { paramKey })
    res.status(400).json({
      code: AUTH_FAILURE_CODES.VALIDATION,
      message: 'Invalid request',
    })
    return false
  }
  const row = await Appointment.findByPk(id, {
    attributes: ['id', 'scheduledById', 'heldBy'],
  })
  if (!row) {
    res.status(404).json({
      code: AUTH_FAILURE_CODES.UNAUTHORIZED,
      message: 'Not found',
    })
    return false
  }
  const sid = row.getDataValue('scheduledById') as string | null
  const hid = row.getDataValue('heldBy') as string | null
  if (sid === uid || hid === uid) {
    return true
  }
  res.status(403).json({
    code: AUTH_FAILURE_CODES.FORBIDDEN,
    message: OWNERSHIP_FORBIDDEN_MESSAGE,
  })
  return false
}

/**
 * Returns whether to call next(). Sends response on false.
 */
export async function runOwnershipCheck(
  modelName: string,
  paramKey: string,
  req: Request,
  res: Response
): Promise<boolean> {
  if (req.user === undefined) {
    return true
  }
  if (isPrivilegedRole(req.user.role)) {
    return true
  }
  if (modelName === 'appointment') {
    return checkAppointmentOwnership(req, res, paramKey)
  }
  return true
}
