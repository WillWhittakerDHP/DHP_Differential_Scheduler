/**
 * PATTERN: Façade — Phase 7.3 strategies should import composed session+cookie operations from here
 * (or from `auth/index.ts`) instead of calling `sessionManager` + `sessionCookie` separately.
 * WHY: One place to establish or end a browser session (DB row + Set-Cookie / Clear-Cookie).
 */

import type { Request, Response } from 'express'
import {
  createAuthSession,
  revokeAuthSession,
  type CreatedAuthSession,
} from './sessionManager.js'
import {
  clearSessionCookie,
  getSessionIdFromRequest,
  setSessionCookie,
} from './sessionCookie.js'

/**
 * Creates a persisted session and sets the HttpOnly session cookie on the response.
 * Returns null when persistence fails (no cookie is set).
 */
export async function issueAuthSessionWithCookie(
  res: Response,
  sess: Record<string, unknown>,
  userId?: string | null
): Promise<CreatedAuthSession | null> {
  const created = await createAuthSession(sess, userId)
  if (!created) {
    return null
  }
  setSessionCookie(res, created.sid)
  return created
}

/**
 * Revokes the server session when the request carries a session id; always clears the session cookie.
 */
export async function clearAuthSessionWithCookie(req: Request, res: Response): Promise<void> {
  const sid = getSessionIdFromRequest(req)
  if (sid) {
    await revokeAuthSession(sid)
  }
  clearSessionCookie(res)
}
