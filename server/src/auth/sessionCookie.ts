/**
 * WHY: HttpOnly session cookie I/O — strategies use with sessionManager in Task 7.2.2.3; no sid in JSON bodies.
 */

import type { Request, Response } from 'express'
import { getAuthConfig } from '../config/authConfig.js'
import { envConfig } from '../config/envConfig.js'
import { NODE_ENV } from '../constants/appConstants.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('auth.sessionCookie')

/** Matches `Session.sid` column and `sessionManager` validation. */
const SESSION_SID_MAX_LEN = 255

function isPlausibleSid(value: string): boolean {
  return value.length > 0 && value.length <= SESSION_SID_MAX_LEN
}

function cookieSecurityOptions(): {
  httpOnly: true
  secure: boolean
  sameSite: 'lax'
  path: string
} {
  return {
    httpOnly: true,
    secure: envConfig.NODE_ENV === NODE_ENV.PRODUCTION,
    sameSite: 'lax',
    path: '/',
  }
}

/** Reads configured session cookie from `req.cookies` (requires `cookieParser()` in app). */
export function getSessionIdFromRequest(req: Request): string | null {
  const { sessionCookieName } = getAuthConfig()
  const raw = req.cookies?.[sessionCookieName]
  if (typeof raw !== 'string') {
    return null
  }
  if (!isPlausibleSid(raw)) {
    logger.warn('session cookie rejected: invalid sid shape (length or empty)')
    return null
  }
  return raw
}

/** Sets session cookie; no-op if `sid` fails length validation. */
export function setSessionCookie(res: Response, sid: string): void {
  if (!isPlausibleSid(sid)) {
    logger.warn('setSessionCookie refused: invalid sid shape')
    return
  }
  const { sessionCookieName, sessionMaxAgeSec } = getAuthConfig()
  const security = cookieSecurityOptions()
  res.cookie(sessionCookieName, sid, {
    ...security,
    maxAge: sessionMaxAgeSec * 1000,
  })
}

/** Clears session cookie with options aligned to `setSessionCookie`. */
export function clearSessionCookie(res: Response): void {
  const { sessionCookieName } = getAuthConfig()
  const security = cookieSecurityOptions()
  res.clearCookie(sessionCookieName, {
    path: security.path,
    secure: security.secure,
    sameSite: security.sameSite,
    httpOnly: security.httpOnly,
  })
}
