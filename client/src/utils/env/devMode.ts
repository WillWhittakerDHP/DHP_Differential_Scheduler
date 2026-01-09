/**
 * Development Mode Utility
 * 
 * LEARNING: Centralized devMode detection for feature flags and dev-only UI
 * WHY: Provides single source of truth for devMode checks across the application
 * PATTERN: Function-based export that checks both Vite dev server and explicit env flag
 * 
 * Behavior:
 * - Returns true when running in Vite dev server (import.meta.env.DEV)
 * - Returns true when VITE_INCLUDE_DEV_FLAGS is set to 'true' (allows enabling in staging/prod builds)
 * - Returns false otherwise
 */

/**
 * Check if development mode is enabled
 * 
 * LEARNING: Centralized devMode check
 * WHY: Allows enabling dev features via VITE_INCLUDE_DEV_FLAGS in staging/prod builds
 * PATTERN: Checks both Vite dev server flag and explicit env variable
 * 
 * @returns true if devMode is enabled, false otherwise
 */
export function isDevModeEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_INCLUDE_DEV_FLAGS === 'true'
}

