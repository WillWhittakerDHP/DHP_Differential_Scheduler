/**
 * WHY: Debug magic-link verify without logging raw tokens (secret in URL).
 * PATTERN: SHA-256 hex prefix correlates with `magic_links.token_hash`; length catches truncation.
 */

import { hashMagicLinkTokenForStorage } from './strategies/magicLinkToken.js'

const SHA256_HEX_PREFIX_LEN = 16

export type MagicLinkTokenDiagnostics = {
  rawCharLength: number
  /** First hex chars of SHA-256(raw); matches DB `token_hash` prefix for the same raw token. */
  sha256HexPrefix: string
}

export function describeMagicLinkTokenForLogs(trimmedRawToken: string): MagicLinkTokenDiagnostics {
  const fullHex = hashMagicLinkTokenForStorage(trimmedRawToken)
  return {
    rawCharLength: trimmedRawToken.length,
    sha256HexPrefix: fullHex.slice(0, SHA256_HEX_PREFIX_LEN),
  }
}
