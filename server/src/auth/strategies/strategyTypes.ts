/**
 * LEARNING: Shared auth strategy contract for Feature 7 — strategies plug in here; routes stay thin.
 * WHY: Magic-link and password flows share one boundary so Phase 7.3+ does not reshape Express handlers.
 */

/** Stable codes for strategy failures and for HTTP JSON bodies until full mapping exists. */
export const AUTH_FAILURE_CODES = {
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  VALIDATION: 'VALIDATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Role / permission denial (HTTP 403). */
  FORBIDDEN: 'FORBIDDEN',
  /** Server-side failure during auth resolution (e.g. DB); not a client credential error. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type AuthFailureCode = (typeof AUTH_FAILURE_CODES)[keyof typeof AUTH_FAILURE_CODES]

/** Result of an auth strategy operation (success path may carry ids once sessions exist). */
export type AuthOpResult =
  | { ok: true; userId?: string; sessionId?: string }
  | { ok: false; code: AuthFailureCode; message: string }

export type AuthStrategyName = 'magic_link' | 'password' | 'none'

/** Minimal context passed into strategies — expand in later tasks; avoid coupling to full Express app. */
export interface AuthRequestContext {
  requestId?: string
}

export interface RequestLoginInput {
  email: string
}

export interface VerifyTokenInput {
  token: string
}

/**
 * Pluggable auth strategy. Optional methods allow incremental implementation (magic link first, password later).
 */
export interface AuthStrategy {
  readonly name: AuthStrategyName
  requestLogin?(ctx: AuthRequestContext, input: RequestLoginInput): Promise<AuthOpResult>
  verifyToken?(ctx: AuthRequestContext, input: VerifyTokenInput): Promise<AuthOpResult>
}

/** Read-only auth env surfaced on 501 responses for observability until real auth ships. */
export interface AuthPlaceholder501Meta {
  strategy: AuthStrategyName
  sessionCookieName: string
  sessionMaxAgeSec: number
}

/** JSON body for 501 placeholder responses from auth routes (aligned with failure shape). */
export interface AuthPlaceholder501Json extends AuthPlaceholder501Meta {
  code: typeof AUTH_FAILURE_CODES.NOT_IMPLEMENTED
  message: string
}

export function buildAuthPlaceholder501Body(
  message: string,
  meta: AuthPlaceholder501Meta
): AuthPlaceholder501Json {
  return {
    code: AUTH_FAILURE_CODES.NOT_IMPLEMENTED,
    message,
    ...meta,
  }
}
