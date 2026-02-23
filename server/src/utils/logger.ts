
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
