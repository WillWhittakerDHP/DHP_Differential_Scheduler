/**
 * Inbound HTTP rate limiting for internal API routes.
 * Limits requests per IP to protect against abuse.
<<<<<<< HEAD
=======
 * Session 8.2.2 will add a stricter limiter for auth routes.
>>>>>>> session-8.2.1
 */

import rateLimit from 'express-rate-limit'

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000
const GENERAL_LIMIT = 100
<<<<<<< HEAD
const AUTH_LIMIT = 10
=======
>>>>>>> session-8.2.1

/** General limiter: 100 requests per 15 minutes per IP. Applied to /api/v1/internal/* */
export const generalRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: GENERAL_LIMIT,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
})
<<<<<<< HEAD

/** Auth limiter: 10 requests per 15 minutes per IP. Applied to /api/v1/internal/auth/* */
export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: AUTH_LIMIT,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
})
=======
>>>>>>> session-8.2.1
