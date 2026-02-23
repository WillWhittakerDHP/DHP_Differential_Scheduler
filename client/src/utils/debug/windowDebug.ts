/**
 * WHY: Debug Window Utility

LEARNING: Isolates DOM access for debug window att...
 */
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * WHY: Attach a debug object to the window for debugging purposes
LEARNING: Iso...
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
