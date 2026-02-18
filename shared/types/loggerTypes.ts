/**
 * Shared logger types
 *
 * LEARNING: AppLogger shape shared between client and server (Phase 1.3 type-similarity UNIFY)
 * WHY: Same contract for createLogger return type; implementations stay separate (Vite vs Node env)
 * PATTERN: Types in shared; createLogger/parseLogLevel remain in client/server
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
