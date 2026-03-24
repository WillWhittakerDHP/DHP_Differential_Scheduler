/**
 * Core auth strategy types and failure codes (split from strategyTypes for file-cohesion max-exports).
 */

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

export type AuthOpResult =
  | { ok: true; userId?: string; sessionId?: string }
  | { ok: false; code: AuthFailureCode; message: string }

export type AuthStrategyName = 'magic_link' | 'password' | 'none'

export interface AuthRequestContext {
  requestId?: string
}

export interface RequestLoginInput {
  email: string
}

export interface VerifyTokenInput {
  token: string
}

export interface AuthStrategy {
  readonly name: AuthStrategyName
  requestLogin?(ctx: AuthRequestContext, input: RequestLoginInput): Promise<AuthOpResult>
  verifyToken?(ctx: AuthRequestContext, input: VerifyTokenInput): Promise<AuthOpResult>
}
