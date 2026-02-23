import type { AppLogger as SharedAppLogger, LogLevel as SharedLogLevel, Logger as SharedLogger } from '@shared/types/loggerTypes'

export type LogLevel = SharedLogLevel
export type AppLogger = SharedAppLogger
export type Logger = SharedLogger

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
    cachedDebugScopes = parseDebugScopesList(import.meta.env.VITE_DEBUG_SCOPES)
  }
  return cachedDebugScopes
}

function isDebugScopeEnabled(scope: string): boolean {
  if (!import.meta.env.DEV) return false
  const scopes = getDebugScopes()
  if (!scopes) return true
  const normalized = scope.toLowerCase()
  return scopes.has('*') || scopes.has(normalized)
}

export function isScopeExplicitlyEnabled(scope: string): boolean {
  if (!import.meta.env.DEV) return false
  const scopes = getDebugScopes()
  if (!scopes) return false // Require explicit enabling if VITE_DEBUG_SCOPES is not set
  const normalized = scope.toLowerCase()
  return scopes.has(normalized)
}

function getConfiguredLogLevel(): LogLevel {
  if (cachedLogLevel === null) {
    const configured = parseLogLevel(import.meta.env.VITE_LOG_LEVEL)
    cachedLogLevel = configured || (import.meta.env.DEV ? 'debug' : 'warn')
  }
  return cachedLogLevel
}

function shouldLog(configured: LogLevel, messageLevel: LogLevel): boolean {
  return levelToNumber(messageLevel) >= levelToNumber(configured)
}

/** Frames we skip when resolving caller (logger internals and known wrappers). */
const CALLSITE_SKIP_PATTERNS = ['logger.ts', 'safeDefaults.ts', 'main.ts']

/**
 * Enable callsite in logs: set VITE_LOG_CALLSITE=1 (or any non-empty value) and
 * VITE_DEBUG_SCOPES=safeDefaults (or *) in .env or when starting dev. Then
 * fallback logs will show caller file:line, e.g. " @ src/.../useDefaultLocation.ts:17:20".
 */

/**
 * Returns first stack frame that is not from logger/safeDefaults/main.
 * Only runs in DEV when VITE_LOG_CALLSITE is set; otherwise returns empty string.
 * Used to append caller file:line to log output so DevTools shows real callsite.
 */
function getCallsiteFrame(): string {
  if (!import.meta.env.DEV) return ''
  const raw = import.meta.env.VITE_LOG_CALLSITE
  if (!raw || String(raw).trim() === '') return ''
  try {
    const stack = new Error().stack
    if (!stack) return ''
    const lines = stack.split('\n')
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const isInternal = CALLSITE_SKIP_PATTERNS.some((p) => line.includes(p))
      if (isInternal) continue
      // Browser stack: "    at fn (url:line:col)" or "    at url:line:col"
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
    // ignore
  }
  return ''
}

export function createLogger(scope: string): AppLogger {
  const configuredLevel = getConfiguredLogLevel()
  const prefix = `[${scope}]`
  const callsiteEnabled = Boolean(import.meta.env.DEV && import.meta.env.VITE_LOG_CALLSITE?.trim())

  const debugEnabled = shouldLog(configuredLevel, 'debug') && isDebugScopeEnabled(scope)
  const infoEnabled = shouldLog(configuredLevel, 'info')
  const warnEnabled = shouldLog(configuredLevel, 'warn')
  const errorEnabled = shouldLog(configuredLevel, 'error')

  const appendCallsite = (args: unknown[]): unknown[] =>
    callsiteEnabled ? [...args, getCallsiteFrame()] : args

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


