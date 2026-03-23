/**
 * LEARNING: Magic-link raw tokens are high-entropy secrets; only a one-way hash is stored (see `magic_links.token_hash`).
 * WHY: Feature 7.3.1.1 — shared helpers for 7.3.1.2 (persistence) and 7.3.1.3 (strategy); no HTTP or Sequelize here.
 */

import { createHash, randomBytes } from 'node:crypto'
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('MagicLinkToken')

/** Raw token length in bytes before base64url encoding. */
const RAW_TOKEN_BYTE_LENGTH = 32

/** Default magic-link lifetime when `MAGIC_LINK_TTL_SECONDS` is unset or invalid (15 minutes). */
export const DEFAULT_MAGIC_LINK_TTL_SECONDS = 900

/** Default `purpose` for new rows when callers do not override (audit / filtering). */
export const DEFAULT_MAGIC_LINK_PURPOSE = 'login'

let loggedInvalidTtlEnv = false

/**
 * Cryptographically random URL-safe token. Never persist this string — use {@link hashMagicLinkTokenForStorage}.
 */
export function generateRawMagicLinkToken(): string {
  return randomBytes(RAW_TOKEN_BYTE_LENGTH).toString('base64url')
}

/**
 * SHA-256 hex digest of the raw token for storage and lookup. Stable for a given raw token.
 */
export function hashMagicLinkTokenForStorage(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex')
}

/**
 * TTL in seconds from `MAGIC_LINK_TTL_SECONDS` or {@link DEFAULT_MAGIC_LINK_TTL_SECONDS}.
 * Invalid or non-positive values log once per process at warn and fall back to the default.
 */
export function getMagicLinkTtlSeconds(): number {
  const raw = process.env.MAGIC_LINK_TTL_SECONDS
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_MAGIC_LINK_TTL_SECONDS
  }
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    if (!loggedInvalidTtlEnv) {
      loggedInvalidTtlEnv = true
      logger.warn(
        'MAGIC_LINK_TTL_SECONDS is invalid or non-positive; using DEFAULT_MAGIC_LINK_TTL_SECONDS',
        { raw, defaultSeconds: DEFAULT_MAGIC_LINK_TTL_SECONDS }
      )
    }
    return DEFAULT_MAGIC_LINK_TTL_SECONDS
  }
  return parsed
}

/**
 * `expiresAt` for a new magic link row created at `fromUtcMs`.
 */
export function computeMagicLinkExpiresAt(fromUtcMs: number): Date {
  return new Date(fromUtcMs + getMagicLinkTtlSeconds() * 1000)
}
