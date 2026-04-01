/**
 * In-memory preflight token store for dependency-aware delete (v1).
 *
 * WHY single-process only: no Redis/session backing yet — tokens are lost on restart
 * and are invalid across multiple Node workers. Documented limitation for 6.17.2; revisit
 * if the API is served horizontally scaled.
 */

import { randomBytes } from 'crypto'

const TTL_MS = 15 * 60 * 1000

export type PreflightTokenPayload = {
  entityType: string
  entityId: string
  canDirectDelete: boolean
  issuedAtMs: number
}

const store = new Map<string, PreflightTokenPayload>()

function isExpired(rec: PreflightTokenPayload): boolean {
  return Date.now() - rec.issuedAtMs > TTL_MS
}

/**
 * Create a token and store metadata for later resolve/finalize validation.
 */
export function issueDeleteContractPreflightToken(
  payload: Pick<PreflightTokenPayload, 'entityType' | 'entityId' | 'canDirectDelete'>
): string {
  const token = randomBytes(24).toString('base64url')
  store.set(token, { ...payload, issuedAtMs: Date.now() })
  return token
}

/**
 * Validate token (TTL + URL match). Does **not** remove — use for resolve.
 */
export function getDeleteContractPreflightToken(
  token: string | undefined,
  entityType: string,
  entityId: string
): PreflightTokenPayload | null {
  if (token === undefined || token === '') {
    return null
  }
  const rec = store.get(token)
  if (!rec) {
    return null
  }
  if (isExpired(rec)) {
    store.delete(token)
    return null
  }
  if (rec.entityType !== entityType || rec.entityId !== entityId) {
    return null
  }
  return rec
}

/**
 * Validate and **remove** token — use once for finalize so the token cannot be reused.
 */
export function consumeDeleteContractPreflightToken(
  token: string | undefined,
  entityType: string,
  entityId: string
): PreflightTokenPayload | null {
  if (token === undefined || token === '') {
    return null
  }
  const rec = store.get(token)
  if (!rec) {
    return null
  }
  if (isExpired(rec)) {
    store.delete(token)
    return null
  }
  if (rec.entityType !== entityType || rec.entityId !== entityId) {
    return null
  }
  store.delete(token)
  return rec
}
