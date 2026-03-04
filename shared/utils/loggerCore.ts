/**
 * Shared logger core: pure logic for level parsing, scope filtering, and logger construction.
 * WHY: Single source of truth; client and server provide env via LoggerEnvConfig (VITE_* vs process.env).
 */
import type { AppLogger, LogLevel, LoggerEnvConfig } from '../types/loggerTypes.js'

export function parseLogLevel(raw: string | undefined): LogLevel | null {
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

export function levelToNumber(level: LogLevel): number {
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

export function shouldLog(configured: LogLevel, messageLevel: LogLevel): boolean {
  return levelToNumber(messageLevel) >= levelToNumber(configured)
}

export function parseDebugScopesList(raw: string | undefined): Set<string> | null {
  if (!raw) return null
  const scopes = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.toLowerCase())
  return new Set(scopes)
}

/**
 * Build callsite string from stack; no env access. Caller passes raw stack and skip patterns.
 */
export function buildCallsiteFrame(skipPatterns: string[], stack: string | undefined): string {
  if (!stack) return ''
  try {
    const lines = stack.split('\n')
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const isInternal = skipPatterns.some((p) => line.includes(p))
      if (isInternal) continue
      const parenMatch = line.match(/\(([^)]+)\)/)
      if (parenMatch) {
        const pathLineCol = parenMatch[1]
        const short = pathLineCol.replace(/^.*\/(src\/)/, '$1').trim()
        return short ? ` @ ${short}` : ''
      }
      const bareMatch = line.match(/(\S+):(\d+)(?::(\d+))?\s*$/)
      if (bareMatch) {
        const file = bareMatch[1].replace(/^.*\/(src\/)/, '$1')
        return ` @ ${file}:${bareMatch[2]}`
      }
    }
  } catch {
    /* ignore regex/parse errors */
  }
  return ''
}

export function createLoggerFromConfig(config: LoggerEnvConfig): AppLogger {
  const {
    scope,
    logLevel: logLevelRaw,
    debugScopes: debugScopesRaw,
    logCallsite: logCallsiteRaw,
    isDev,
    callsiteSkipPatterns,
  } = config

  const configuredLevel = parseLogLevel(logLevelRaw) ?? (isDev ? 'debug' : 'warn')
  const prefix = `[${scope}]`
  const callsiteRaw = String(logCallsiteRaw ?? '').trim().toLowerCase()
  const callsiteExplicitlyDisabled =
    callsiteRaw === '0' ||
    callsiteRaw === 'false' ||
    callsiteRaw === 'off' ||
    callsiteRaw === 'no'
  // Default to trace-on for all environments unless explicitly disabled.
  const callsiteEnabled = !callsiteExplicitlyDisabled

  const scopesSet = parseDebugScopesList(debugScopesRaw ?? undefined)
  const isDebugScopeEnabled = (s: string): boolean => {
    if (!isDev) return false
    if (!scopesSet) return true
    return scopesSet.has('*') || scopesSet.has(s.toLowerCase())
  }

  const debugEnabled = shouldLog(configuredLevel, 'debug') && isDebugScopeEnabled(scope)
  const infoEnabled = shouldLog(configuredLevel, 'info')
  const warnEnabled = shouldLog(configuredLevel, 'warn')
  const errorEnabled = shouldLog(configuredLevel, 'error')

  const getCallsite = (): string =>
    callsiteEnabled ? buildCallsiteFrame(callsiteSkipPatterns, new Error().stack) : ''
  const appendCallsite = (args: unknown[]): unknown[] =>
    callsiteEnabled ? [...args, getCallsite()] : args

  return {
    debug: (...args: unknown[]): void => {
      if (!debugEnabled) return
      console.log(prefix, ...appendCallsite(args))
    },
    info: (...args: unknown[]): void => {
      if (!infoEnabled) return
      console.log(prefix, ...appendCallsite(args))
    },
    warn: (...args: unknown[]): void => {
      if (!warnEnabled) return
      console.warn(prefix, ...appendCallsite(args))
    },
    error: (...args: unknown[]): void => {
      if (!errorEnabled) return
      console.error(prefix, ...appendCallsite(args))
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

/**
 * Whether the given scope is explicitly enabled via DEBUG_SCOPES (no wildcard).
 * Used when callers need to know if a scope was explicitly listed.
 */
export function isScopeExplicitlyEnabledFromConfig(
  config: Pick<LoggerEnvConfig, 'debugScopes' | 'isDev'>,
  scope: string
): boolean {
  if (!config.isDev) return false
  const scopes = parseDebugScopesList(config.debugScopes ?? undefined)
  if (!scopes) return false
  return scopes.has(scope.toLowerCase())
}
