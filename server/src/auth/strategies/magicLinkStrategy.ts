/**
 * WHY: `AuthStrategy` for magic-link verify + issue helper for request-link routes (Feature 7.3.1.3).
 * PATTERN: Maps persistence outcomes to `AuthOpResult`; no session/cookie here.
 */

import type {
  AuthOpResult,
  AuthRequestContext,
  AuthStrategy,
  VerifyTokenInput,
} from './strategyTypes.js'
import { AUTH_FAILURE_CODES } from './strategyTypes.js'
import { consumeMagicLinkByRawToken, createPendingMagicLink } from '../magicLinkPersistence.js'
import {
  computeMagicLinkExpiresAt,
  DEFAULT_MAGIC_LINK_PURPOSE,
  generateRawMagicLinkToken,
  hashMagicLinkTokenForStorage,
} from './magicLinkToken.js'

export type IssueMagicLinkForEmailInput = {
  email: string
  userId?: string | null
  purpose?: string | null
}

export type IssueMagicLinkForEmailResult = {
  rawToken: string
  magicLinkId: string
}

async function verifyMagicLinkToken(rawToken: string | undefined): Promise<AuthOpResult> {
  const trimmed = String(rawToken ?? '').trim()
  if (!trimmed) {
    return {
      ok: false,
      code: AUTH_FAILURE_CODES.VALIDATION,
      message: 'Magic link token is required',
    }
  }
  const result = await consumeMagicLinkByRawToken(trimmed)
  if (result.status === 'ok') {
    if (result.userId) {
      return { ok: true, userId: result.userId }
    }
    return {
      ok: false,
      code: AUTH_FAILURE_CODES.UNAUTHORIZED,
      message: 'Magic link is not bound to a user',
    }
  }
  if (result.status === 'not_found' || result.status === 'expired') {
    return {
      ok: false,
      code: AUTH_FAILURE_CODES.UNAUTHORIZED,
      message: 'Invalid or expired magic link',
    }
  }
  return {
    ok: false,
    code: AUTH_FAILURE_CODES.INTERNAL_ERROR,
    message: 'Magic link verification failed',
  }
}

/**
 * Creates a pending magic link row and returns the raw token for delivery (e.g. session 7.3.2).
 * Returns `null` if email is empty or persistence fails. Does not log the raw token.
 */
export async function issueMagicLinkForEmail(
  input: IssueMagicLinkForEmailInput
): Promise<IssueMagicLinkForEmailResult | null> {
  const email = input.email.trim()
  if (!email) {
    return null
  }
  const rawToken = generateRawMagicLinkToken()
  const tokenHash = hashMagicLinkTokenForStorage(rawToken)
  const expiresAt = computeMagicLinkExpiresAt(Date.now())
  const row = await createPendingMagicLink({
    tokenHash,
    expiresAt,
    email,
    userId: input.userId ?? null,
    purpose: input.purpose ?? DEFAULT_MAGIC_LINK_PURPOSE,
  })
  if (!row) {
    return null
  }
  return { rawToken, magicLinkId: row.id }
}

export function createMagicLinkStrategy(): AuthStrategy {
  return {
    name: 'magic_link',
    async verifyToken(_ctx: AuthRequestContext, input: VerifyTokenInput): Promise<AuthOpResult> {
      return verifyMagicLinkToken(input?.token)
    },
  }
}

/** Singleton for routers that prefer a shared instance. */
export const magicLinkStrategy: AuthStrategy = createMagicLinkStrategy()
