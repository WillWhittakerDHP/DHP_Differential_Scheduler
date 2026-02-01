/**
 * Debug Window Utility
 * 
 * LEARNING: Isolates DOM access for debug window attachment
 * WHY: Keeps DOM access out of composables for better testability
 * PATTERN: Pure utility function that handles SSR safety and dev mode checks
 * 
 * This utility attaches debug objects to the window object in dev mode only.
 * Used by composables that need to expose debugging information.
 */

import { isDevModeEnabled } from '@/utils/env/devMode'

interface WindowWithDebug extends Window {
  [key: string]: unknown
}

/**
 * Attach a debug object to the window for debugging purposes
 * 
 * LEARNING: Isolates window DOM access behind a utility
 * WHY: Makes composables testable without direct DOM access
 * PATTERN: Check dev mode and SSR safety before accessing window
 * 
 * @param key - The property key on window (e.g., '__useGlobalDebug')
 * @param debugObject - The debug object to attach
 */
export function attachDebugToWindow(
  key: string,
  debugObject: Record<string, unknown>
): void {
  // PATTERN: Check dev mode flag before proceeding
  if (!isDevModeEnabled()) {
    return
  }

  // PATTERN: Check typeof window before accessing it
  if (typeof window === 'undefined') {
    return
  }

  // PATTERN: Use interface extension and type assertion via unknown
  const windowWithDebug = window as unknown as WindowWithDebug
  windowWithDebug[key] = debugObject
}
