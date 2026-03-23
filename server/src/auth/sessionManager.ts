/**
 * WHY: DB-backed session lifecycle for Feature 7 — strategies use this; cookies/routes are separate tasks.
 */

import { randomBytes } from 'crypto'
import { models } from '../config/models.js'
import { getAuthConfig } from '../config/authConfig.js'
import { createLogger } from '../utils/logger.js'
import type { Session } from '../db/models/auth/session.js'

const logger = createLogger('auth.sessionManager')

/** Matches `Session.sid` column (VARCHAR 255). */
const SESSION_SID_MAX_LEN = 255

export interface CreatedAuthSession {
  sid: string
  expire: Date
}

function generateSid(): string {
  return randomBytes(32).toString('hex')
}

function isPlausibleSid(sid: string): boolean {
  return sid.length > 0 && sid.length <= SESSION_SID_MAX_LEN
}

/**
 * Persists a new session row. Returns null on failure so callers can map to HTTP errors without unhandled rejects.
 */
export async function createAuthSession(
  sess: Record<string, unknown>,
  userId?: string | null
): Promise<CreatedAuthSession | null> {
  try {
    const { sessionMaxAgeSec } = getAuthConfig()
    const sid = generateSid()
    const expire = new Date(Date.now() + sessionMaxAgeSec * 1000)
    const uid = userId === undefined ? null : userId
    await models.Session.create({
      sid,
      sess,
      expire,
      userId: uid,
    })
    return { sid, expire }
  } catch (error) {
    logger.error('createAuthSession failed:', error)
    return null
  }
}

/**
 * Loads a session by id. Returns null if missing or expired; deletes expired row best-effort.
 */
export async function getAuthSessionBySid(sid: string): Promise<Session | null> {
  if (!isPlausibleSid(sid)) {
    return null
  }
  try {
    const row = await models.Session.findByPk(sid)
    if (!row) {
      return null
    }
    if (row.expire <= new Date()) {
      try {
        await row.destroy()
      } catch (error) {
        logger.warn('destroy expired session failed:', error)
      }
      return null
    }
    return row
  } catch (error) {
    logger.error('getAuthSessionBySid failed:', error)
    return null
  }
}

/** Removes a session row by id. Returns whether a row was deleted. */
export async function revokeAuthSession(sid: string): Promise<boolean> {
  if (!isPlausibleSid(sid)) {
    return false
  }
  try {
    const removed = await models.Session.destroy({ where: { sid } })
    return removed > 0
  } catch (error) {
    logger.error('revokeAuthSession failed:', error)
    return false
  }
}
