/**
 * WHY: Cookie → Session → User resolution in one place so `requireAuth` stays within complexity thresholds.
 */

import type { Request } from 'express'
import { models } from '../config/models.js'
import { getAuthConfig } from '../config/authConfig.js'
import { createLogger } from '../utils/logger.js'
import { resolveDevBypassUser } from './devAuthBypass.js'
import { getAuthSessionBySid } from './sessionManager.js'
import { getSessionIdFromRequest } from './sessionCookie.js'

const logger = createLogger('auth.resolveAuthenticatedUser')

export type ResolveAuthUser = {
  id: string
  role: string
}

export type ResolveAuthenticatedUserResult =
  | { status: 'ok'; user: ResolveAuthUser }
  | { status: 'unauthorized' }
  | { status: 'internal_error' }

export async function resolveAuthenticatedUserForRequest(
  req: Request
): Promise<ResolveAuthenticatedUserResult> {
  try {
    if (getAuthConfig().strategy === 'none') {
      const devUser = await resolveDevBypassUser()
      if (devUser !== null) {
        return { status: 'ok', user: devUser }
      }
      logger.warn('resolveAuthenticatedUserForRequest: AUTH_STRATEGY=none but dev bypass user unavailable')
      return { status: 'unauthorized' }
    }

    const sid = getSessionIdFromRequest(req)
    if (sid === null) {
      return { status: 'unauthorized' }
    }
    const session = await getAuthSessionBySid(sid)
    if (session === null) {
      return { status: 'unauthorized' }
    }
    const userId = session.userId
    if (userId === null || userId === undefined || userId === '') {
      return { status: 'unauthorized' }
    }
    const user = await models.User.findByPk(userId)
    if (user === null) {
      return { status: 'unauthorized' }
    }
    const id = user.id
    if (id === null || id === undefined || id === '') {
      return { status: 'unauthorized' }
    }
    return {
      status: 'ok',
      user: {
        id,
        role: String(user.userRole),
      },
    }
  } catch (error) {
    logger.error('resolveAuthenticatedUserForRequest failed:', error)
    return { status: 'internal_error' }
  }
}
