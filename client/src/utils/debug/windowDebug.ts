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

/**
 * Attach a debug object to the window for debugging purposes
 *
 * LEARNING: Isolates window DOM access behind a utility
 * WHY: Makes composables testable without direct DOM access
 * PATTERN: Object.defineProperty avoids Window index-signature type assertion
 *
 * @param key - The property key on window (e.g., '__useGlobalDebug')
 * @param debugObject - The debug object to attach
 */
export function attachDebugToWindow(
  key: string,
  debugObject: Record<string, unknown>
): void {
  if (!isDevModeEnabled()) {
    return
  }

  if (typeof window === 'undefined') {
    return
  }

  Object.defineProperty(window, key, {
    value: debugObject,
    writable: true,
    configurable: true
  })
}
