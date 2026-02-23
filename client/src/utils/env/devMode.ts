/**
 * Development Mode Utility
 * 
 * 
 * Behavior:
 * - Returns true when running in Vite dev server (import.meta.env.DEV)
 * - Returns true when VITE_INCLUDE_DEV_FLAGS is set to 'true' (allows enabling in staging/prod builds)
 * - Returns false otherwise
 */

/**
 * Check if development mode is enabled
 * 
 * 
 * @returns true if devMode is enabled, false otherwise
 */
export function isDevModeEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_INCLUDE_DEV_FLAGS === 'true'
}

