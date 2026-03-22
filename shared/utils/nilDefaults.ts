/**
 * Explicit null/undefined handling for values that must default to empty string or array.
 * PATTERN: Deprecation audit flags inline `?? ''`, `?? []`, `?? {}` as easy-to-miss API masking.
 */

import type { LoggerEnvConfig } from '../types/loggerTypes.js'
import { createLoggerFromConfig } from './loggerCore.js'

type GlobalWithOptionalProcess = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> }
}

function readOptionalProcessEnv(key: string): string | undefined {
  const env = (globalThis as GlobalWithOptionalProcess).process?.env
  if (!env) return undefined
  const value = env[key]
  return typeof value === 'string' ? value : undefined
}

function resolveNilDefaultsLoggerConfig(): LoggerEnvConfig {
  const nodeEnv = readOptionalProcessEnv('NODE_ENV')
  const isDev = nodeEnv !== 'production'
  return {
    scope: 'nilDefaults',
    logLevel: readOptionalProcessEnv('LOG_LEVEL') ?? readOptionalProcessEnv('VITE_LOG_LEVEL'),
    debugScopes: readOptionalProcessEnv('DEBUG_SCOPES'),
    logCallsite:
      readOptionalProcessEnv('LOG_CALLSITE') ?? readOptionalProcessEnv('VITE_LOG_CALLSITE'),
    isDev,
    callsiteSkipPatterns: ['loggerCore.ts', 'nilDefaults.ts'],
  }
}

const nilDefaultsLogger = createLoggerFromConfig(resolveNilDefaultsLoggerConfig())

function warnNilDefault(
  handler: 'nilToEmptyString' | 'nilToEmptyArray' | 'nilToEmptyObject'
): void {
  const trace = new Error().stack
  nilDefaultsLogger.warn(
    `${handler}: null or undefined coerced to empty default`,
    trace ?? '(stack unavailable)'
  )
}

export const EMPTY_STRING = ''

export function nilToEmptyString(value: string | null | undefined): string {
  if (value === undefined || value === null) {
    warnNilDefault('nilToEmptyString')
    return EMPTY_STRING
  }
  return value
}

export function nilToEmptyArray<T>(value: readonly T[] | T[] | null | undefined): T[] {
  if (value === undefined || value === null) {
    warnNilDefault('nilToEmptyArray')
    return []
  }
  return value as T[]
}

export function nilToEmptyObject<T extends Record<string, unknown>>(value: T | null | undefined): T {
  if (value === undefined || value === null) {
    warnNilDefault('nilToEmptyObject')
    return {} as T
  }
  return value
}
