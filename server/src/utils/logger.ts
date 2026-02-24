/**
 * Logger: stack/callsite used only when NODE_ENV is not production.
 */
import { isProduction } from './envHelpers.js'
import type { AppLogger, LogLevel, Logger } from '../../../shared/types/loggerTypes.js'

export type { AppLogger, LogLevel, Logger }

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
    cachedDebugScopes = parseDebugScopesList(process.env.DEBUG_SCOPES)
  }
  return cachedDebugScopes
}

function isDebugScopeEnabled(scope: string): boolean {
  if (isProduction()) return false
  const scopes = getDebugScopes()
  if (!scopes) return true
  const normalized = scope.toLowerCase()
  return scopes.has('*') || scopes.has(normalized)
}

export function isScopeExplicitlyEnabled(scope: string): boolean {
  if (isProduction()) return false
  const scopes = getDebugScopes()
  if (!scopes) return false // Require explicit enabling if DEBUG_SCOPES is not set
  const normalized = scope.toLowerCase()
  return scopes.has(normalized)
}

function getConfiguredLogLevel(): LogLevel {
  if (cachedLogLevel === null) {
    const configured = parseLogLevel(process.env.LOG_LEVEL)
    cachedLogLevel = configured || (isProduction() ? 'warn' : 'debug')
  }
  return cachedLogLevel
}

function shouldLog(configured: LogLevel, messageLevel: LogLevel): boolean {
  return levelToNumber(messageLevel) >= levelToNumber(configured)
}

/** Frames we skip when resolving caller (logger internals and safeDefaults). */
const CALLSITE_SKIP_PATTERNS = ['logger.ts', 'safeDefaults.ts']

/**
 * Returns first stack frame that is not from logger/safeDefaults.
 * Only runs when not production and LOG_CALLSITE or VITE_LOG_CALLSITE is set.
 * Same env name as client (VITE_LOG_CALLSITE) so root .env works for both.
 */
function getCallsiteFrame(): string {
  if (isProduction()) return ''
  const raw = process.env.VITE_LOG_CALLSITE ?? process.env.LOG_CALLSITE
  if (!raw || String(raw).trim() === '') return ''
  try {
    const stack = new Error().stack
    if (!stack) return ''
    const lines = stack.split('\n')
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const isInternal = CALLSITE_SKIP_PATTERNS.some((p) => line.includes(p))
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
    // Intentional: swallow any stack parse errors and fall back to no callsite
  } catch {
    /* no-op */
  }
  return ''
}

export function createLogger(scope: string): AppLogger {
  const configuredLevel = getConfiguredLogLevel()
  const prefix = `[${scope}]`
  const callsiteEnabled = Boolean(
    !isProduction() && (process.env.VITE_LOG_CALLSITE?.trim() || process.env.LOG_CALLSITE?.trim())
  )

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
