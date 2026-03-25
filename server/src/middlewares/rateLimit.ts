/**
 * Inbound HTTP rate limiting for internal API routes.
 * Limits requests per IP to protect against abuse.
 * Auth routes share a dedicated limiter (same window as general). A single SPA bootstrap uses two
 * auth calls (CSRF + session/me); the previous cap of 10/15min was exhausted by ~5 reloads.
 *
 * express-rate-limit v8+: IPv6 clients are keyed by subnet (default /56) so limits apply per subnet, not per single address.
 */

import rateLimit from 'express-rate-limit'

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const GENERAL_LIMIT = 100
/** Per-IP cap on `/api/v1/internal/auth/*` (csrf, session/me, magic-link, etc.). */
const AUTH_LIMIT = 100

/** General limiter: 100 requests per 15 minutes per IP. Applied to /api/v1/internal/* */
export const generalRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: GENERAL_LIMIT,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
})

/** Auth limiter: 10 requests per 15 minutes per IP. Applied to /api/v1/internal/auth/* */
export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: AUTH_LIMIT,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
})
