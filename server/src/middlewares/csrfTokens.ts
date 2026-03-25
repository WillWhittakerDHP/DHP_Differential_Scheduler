/**
 * Double-submit CSRF: httpOnly cookie holds secret; client sends token in X-CSRF-Token header.
 * WHY: State-changing routes already use csrfProtection; magic-link POST runs before session exists.
 */

import type { Request, Response } from 'express'
import CSRF from 'csrf'
import { createLogger } from '../utils/logger.js'
import { NODE_ENV } from '../constants/appConstants.js'
import { envConfig } from '../config/envConfig.js'

const logger = createLogger('middleware.csrf')
const tokens = new CSRF()

/** Cookie name for CSRF secret (httpOnly). */
export const CSRF_SECRET_COOKIE = 'csrf_secret'

export function ensureCsrfSecretCookie(req: Request, res: Response): string {
  const existing = req.cookies?.[CSRF_SECRET_COOKIE]
  if (typeof existing === 'string' && existing.length > 0) {
    return existing
  }
  const secret = tokens.secretSync()
  res.cookie(CSRF_SECRET_COOKIE, secret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: envConfig.NODE_ENV === NODE_ENV.PRODUCTION,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  })
  return secret
}

/** Create a token for the current secret cookie (may set cookie first). */
export function createCsrfTokenForRequest(req: Request, res: Response): string {
  const secret = ensureCsrfSecretCookie(req, res)
  return tokens.create(secret)
}

/** Verify header/body token against secret cookie. */
export function verifyCsrfToken(req: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true
  }
  const secret = req.cookies?.[CSRF_SECRET_COOKIE]
  const headerToken =
    typeof req.get('x-csrf-token') === 'string' ? req.get('x-csrf-token') : undefined
  const bodyToken =
    req.body && typeof req.body === 'object' && typeof (req.body as { _csrf?: string })._csrf === 'string'
      ? (req.body as { _csrf: string })._csrf
      : undefined
  const token = headerToken ?? bodyToken
  if (typeof secret !== 'string' || secret.length === 0 || typeof token !== 'string' || token.length === 0) {
    logger.warn('csrf verify failed: missing secret or token')
    return false
  }
  return tokens.verify(secret, token)
}
