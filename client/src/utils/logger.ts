import { createLoggerFromConfig, isScopeExplicitlyEnabledFromConfig } from '@shared/utils/loggerCore'
import type { AppLogger, LogLevel, Logger } from '@/types/logger'

export type { LogLevel, AppLogger, Logger }

const CALLSITE_SKIP_PATTERNS = ['logger.ts', 'safeDefaults.ts', 'main.ts']

function getConfig() {
  return {
    scope: '',
    logLevel: import.meta.env.VITE_LOG_LEVEL,
    debugScopes: import.meta.env.VITE_DEBUG_SCOPES,
    logCallsite: import.meta.env.VITE_LOG_CALLSITE,
    isDev: import.meta.env.DEV === true,
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
