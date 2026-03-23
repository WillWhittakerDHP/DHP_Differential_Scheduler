/**
 * WHY: Synchronizer-token CSRF — store secret in `Session.sess.csrfToken`, mirror in a **non-HttpOnly**
 * cookie so the Vue app (Session 8.6.2) can read it and send `X-CSRF-Token` on mutating requests.
 * Validation remains in `csrfProtection` (Task 8.6.1.2).
 */

import { randomBytes } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { getAuthSessionBySid } from '../auth/sessionManager.js'
import { getSessionIdFromRequest } from '../auth/sessionCookie.js'
import { getAuthConfig } from '../config/authConfig.js'
import { envConfig } from '../config/envConfig.js'
import { NODE_ENV } from '../constants/appConstants.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('middleware.csrfIssuance')

/** Readable cookie name — SPA reads this; must match docs and client (8.6.2). */
export const CSRF_TOKEN_COOKIE_NAME = 'csrf_token'

/** Header the client must send on POST/PUT/PATCH/DELETE (validation in 8.6.1.2). */
export const CSRF_HEADER_NAME = 'X-CSRF-Token'

/** Key inside `Session.sess` JSONB (server-authoritative value). */
export const CSRF_SESS_KEY = 'csrfToken'

const CSRF_TOKEN_BYTE_LEN = 32
const MIN_STORED_TOKEN_LEN = CSRF_TOKEN_BYTE_LEN * 2

function normalizeSess(sess: unknown): Record<string, unknown> {
  if (sess !== null && typeof sess === 'object' && !Array.isArray(sess)) {
    return { ...(sess as Record<string, unknown>) }
  }
  return {}
}

/** Server-side token from `Session.sess` for `csrfProtection` (Task 8.6.1.2). */
export function readStoredCsrfToken(sess: unknown): string | null {
  const existing = normalizeSess(sess)
  const current = existing[CSRF_SESS_KEY]
  if (typeof current === 'string' && current.length >= MIN_STORED_TOKEN_LEN) {
    return current
  }
  return null
}

function setReadableCsrfCookie(res: Response, token: string): void {
  const { sessionMaxAgeSec } = getAuthConfig()
  res.cookie(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false,
    secure: envConfig.NODE_ENV === NODE_ENV.PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAgeSec * 1000,
  })
}

/**
 * Ensures `Session.sess.csrfToken` exists and sets the readable `csrf_token` cookie.
 * Skips when there is no session cookie or session row (anonymous / expired).
 */
export function ensureCsrfTokenAttached(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const sid = getSessionIdFromRequest(req)
      if (sid === null) {
        next()
        return
      }
      const session = await getAuthSessionBySid(sid)
      if (session === null) {
        logger.debug('CSRF issuance skipped: no session row for cookie sid')
        next()
        return
      }
      const existing = normalizeSess(session.sess)
      const current = existing[CSRF_SESS_KEY]
      if (typeof current === 'string' && current.length >= MIN_STORED_TOKEN_LEN) {
        setReadableCsrfCookie(res, current)
        next()
        return
      }
      const token = randomBytes(CSRF_TOKEN_BYTE_LEN).toString('hex')
      await session.update({ sess: { ...existing, [CSRF_SESS_KEY]: token } })
      setReadableCsrfCookie(res, token)
      next()
    } catch (error: unknown) {
      logger.error('ensureCsrfTokenAttached failed:', error)
      next(error)
    }
  })()
}
