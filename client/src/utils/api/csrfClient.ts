import { createLogger } from '@/utils/logger'

const logger = createLogger('csrfClient')

/**
 * CSRF cookie/header names must stay aligned with server `csrfIssuance.ts` / `security.ts`.
 * No env vars — fixed contract for SPA + API.
 */
export const CSRF_COOKIE_NAME = 'csrf_token'
export const CSRF_HEADER_NAME = 'X-CSRF-Token'

/**
 * Reads the double-submit CSRF token from `document.cookie` (non-HttpOnly cookie set by the server).
 * Returns null when not in a browser or when the cookie is absent.
 */
export function readCsrfTokenFromDocumentCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const prefix = `${CSRF_COOKIE_NAME}=`
  const segments = document.cookie.split(';')
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed.startsWith(prefix)) {
      continue
    }
    const raw = trimmed.slice(prefix.length)
    try {
      return decodeURIComponent(raw)
    } catch (err: unknown) {
      logger.debug('CSRF cookie decode failed; using raw segment', { err })
      return raw
    }
  }
  return null
}
