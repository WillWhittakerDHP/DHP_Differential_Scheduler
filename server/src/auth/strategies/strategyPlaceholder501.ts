/**
 * 501 placeholder response shapes (split from strategyTypes for file-cohesion max-exports).
 */
import { AUTH_FAILURE_CODES } from './strategyTypesCore.js'
import type { AuthRuntimeConfig } from '../../config/authConfig.js'

export type AuthPlaceholder501Meta = AuthRuntimeConfig

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
