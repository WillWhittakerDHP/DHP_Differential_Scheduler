/**
 * Server Logger Utility
 *
 * WHY: Centralizes logging so we can control noise, keep production clean, and avoid scattered `console.*`.
 * PATTERN: Scoped logger + level gating via Node.js env vars.
 *
 * Controls:
 * - `LOG_LEVEL`: debug | info | warn | error | silent
 * - `DEBUG_SCOPES`: comma-separated scopes (or `*`) to allow debug logs in DEV
 *
 * Defaults:
 * - DEV: debug
 * - PROD: warn
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export type AppLogger = {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  groupCollapsed: (title: string, ...args: unknown[]) => void
  groupEnd: () => void
}

export type Logger = AppLogger

function parseLogLevel(raw: string | undefined): LogLevel | null {
  if (!raw) return null
  const normalized = raw.trim().toLowerCase()
  if (
    normalized === 'debug' ||
    normalized === 'info' ||
    normalized === 'warn' ||
    normalized === 'error' ||
    normalized === 'silent'
  ) {
    return normalized
  }
  return null
}

function levelToNumber(level: LogLevel): number {
  switch (level) {
    case 'debug':
      return 10
    case 'info':
      return 20
    case 'warn':
      return 30
    case 'error':
      return 40
    case 'silent':
      return 100
  }
}

// Cache parsed config to avoid re-parsing on every logger creation
let cachedLogLevel: LogLevel | null = null
let cachedDebugScopes: Set<string> | null | undefined = undefined // undefined = not parsed yet

function parseDebugScopesList(raw: string | undefined): Set<string> | null {
  if (!raw) return null
  const scopes = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.toLowerCase())
  return new Set(scopes)
}

function getDebugScopes(): Set<string> | null {
  if (cachedDebugScopes === undefined) {
    cachedDebugScopes = parseDebugScopesList(process.env.DEBUG_SCOPES)
  }
  return cachedDebugScopes
}

function isDebugScopeEnabled(scope: string): boolean {
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) return false
  const scopes = getDebugScopes()
  if (!scopes) return true
  const normalized = scope.toLowerCase()
  return scopes.has('*') || scopes.has(normalized)
}

/**
 * Check if a scope is explicitly enabled in DEBUG_SCOPES
 * WHY: Some scopes should be opt-in only (require explicit enabling, not via wildcard)
 * PATTERN: Returns true only if DEBUG_SCOPES is set and explicitly contains the scope (not via *)
 */
export function isScopeExplicitlyEnabled(scope: string): boolean {
  const isDev = process.env.NODE_ENV !== 'production'
  if (!isDev) return false
  const scopes = getDebugScopes()
  if (!scopes) return false // Require explicit enabling if DEBUG_SCOPES is not set
  const normalized = scope.toLowerCase()
  return scopes.has(normalized)
}

function getConfiguredLogLevel(): LogLevel {
  if (cachedLogLevel === null) {
    const configured = parseLogLevel(process.env.LOG_LEVEL)
    const isDev = process.env.NODE_ENV !== 'production'
    cachedLogLevel = configured || (isDev ? 'debug' : 'warn')
  }
  return cachedLogLevel
}

function shouldLog(configured: LogLevel, messageLevel: LogLevel): boolean {
  return levelToNumber(messageLevel) >= levelToNumber(configured)
}

export function createLogger(scope: string): AppLogger {
  const configuredLevel = getConfiguredLogLevel()
  const prefix = `[${scope}]`

  const debugEnabled = shouldLog(configuredLevel, 'debug') && isDebugScopeEnabled(scope)
  const infoEnabled = shouldLog(configuredLevel, 'info')
  const warnEnabled = shouldLog(configuredLevel, 'warn')
  const errorEnabled = shouldLog(configuredLevel, 'error')

  return {
    debug: (...args: unknown[]): void => {
      if (!debugEnabled) return
      console.log(prefix, ...args)
    },
    info: (...args: unknown[]): void => {
      if (!infoEnabled) return
      console.log(prefix, ...args)
    },
    warn: (...args: unknown[]): void => {
      if (!warnEnabled) return
      console.warn(prefix, ...args)
    },
    error: (...args: unknown[]): void => {
      if (!errorEnabled) return
      console.error(prefix, ...args)
    },
    groupCollapsed: (title: string, ...args: unknown[]): void => {
      if (!debugEnabled && !infoEnabled) return
      console.groupCollapsed(`${prefix} ${title}`, ...args)
    },
    groupEnd: (): void => {
      if (!debugEnabled && !infoEnabled) return
      console.groupEnd()
    },
  }
}
