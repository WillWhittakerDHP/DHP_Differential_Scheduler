/**
 * Local dev bypass when AUTH_STRATEGY=none — no magic-link session required.
 * Uses AUTH_DEV_USER_EMAIL (default will@districthomepro.com) to attach req.user.
 */

import { models } from '../config/models.js'
import { createLogger } from '../utils/logger.js'
import type { ResolveAuthUser } from './resolveAuthenticatedUser.js'

const logger = createLogger('auth.devAuthBypass')

const DEFAULT_DEV_EMAIL = 'will@districthomepro.com'

let cachedDevUser: ResolveAuthUser | null = null

export function clearDevAuthBypassCache(): void {
  cachedDevUser = null
}

export async function resolveDevBypassUser(): Promise<ResolveAuthUser | null> {
  if (cachedDevUser !== null) {
    return cachedDevUser
  }

  const email = (process.env.AUTH_DEV_USER_EMAIL ?? DEFAULT_DEV_EMAIL).trim().toLowerCase()
  try {
    const user = await models.User.findOne({ where: { email } })
    if (user === null) {
      logger.warn('devAuthBypass: no user found for AUTH_DEV_USER_EMAIL', { email })
      return null
    }
    const id = user.id
    if (id === null || id === undefined || id === '') {
      logger.warn('devAuthBypass: user row missing id', { email })
      return null
    }
    cachedDevUser = {
      id,
      role: String(user.userRole),
    }
    return cachedDevUser
  } catch (error: unknown) {
    logger.error('devAuthBypass: lookup failed', { email, error })
    return null
  }
}
