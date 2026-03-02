/**
 * Shared logger types
 *
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

/** Env-derived config passed to createLoggerFromConfig (client: VITE_*, server: process.env). */
export interface LoggerEnvConfig {
  scope: string
  logLevel: string | undefined
  debugScopes: string | undefined
  logCallsite: string | undefined
  isDev: boolean
  callsiteSkipPatterns: string[]
}
