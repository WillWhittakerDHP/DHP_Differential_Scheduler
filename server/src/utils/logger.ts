/**
 * Logger: thin adapter over shared logger core; env from process.env.
 */
import { createLoggerFromConfig, isScopeExplicitlyEnabledFromConfig } from '../../../shared/utils/loggerCore.js'
import type { AppLogger, LogLevel, Logger } from '../../../shared/types/loggerTypes.js'
import { isProduction } from './envHelpers.js'

export type { AppLogger, LogLevel, Logger }

const CALLSITE_SKIP_PATTERNS = ['logger.ts', 'safeDefaults.ts']

function getConfig() {
  return {
    scope: '',
    logLevel: process.env.LOG_LEVEL,
    debugScopes: process.env.DEBUG_SCOPES,
    logCallsite: process.env.VITE_LOG_CALLSITE ?? process.env.LOG_CALLSITE,
    isDev: !isProduction(),
    callsiteSkipPatterns: CALLSITE_SKIP_PATTERNS,
  }
}

export function createLogger(scope: string): AppLogger {
  return createLoggerFromConfig({
    ...getConfig(),
    scope,
  })
}

export function isScopeExplicitlyEnabled(scope: string): boolean {
  const config = getConfig()
  return isScopeExplicitlyEnabledFromConfig(
    { debugScopes: config.debugScopes, isDev: config.isDev },
    scope
  )
}
