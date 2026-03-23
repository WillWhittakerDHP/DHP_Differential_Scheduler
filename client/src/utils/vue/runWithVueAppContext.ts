import type { ComponentInternalInstance } from 'vue'

/**
 * Runs a callback inside Vue's app context when the current instance supports it (SSR-safe fallback).
 */
export function runWithVueAppContextIfAvailable(
  capturedInstance: ComponentInternalInstance | null,
  fn: () => void
): void {
  const app = capturedInstance?.appContext.app
  if (capturedInstance && app?.runWithContext) {
    app.runWithContext(fn)
    return
  }
  fn()
}
