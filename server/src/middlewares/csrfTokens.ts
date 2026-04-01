/**
 * Double-submit CSRF: httpOnly cookie holds secret; client sends token in X-CSRF-Token header.
 * WHY: State-changing routes already use csrfProtection; magic-link POST runs before session exists.
 */

import type { Request, Response } from 'express'
import CSRF from 'csrf'
import { NODE_ENV } from '../constants/appConstants.js'
import { envConfig } from '../config/envConfig.js'

const tokens = new CSRF()

/** Cookie name for CSRF secret (httpOnly). */
const CSRF_SECRET_COOKIE = 'csrf_secret'

function ensureCsrfSecretCookie(req: Request, res: Response): string {
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
