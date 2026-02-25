/**
 * WHY: Centralize browser context capture for feedback/submission with SSR guards.
 * PATTERN: Util only; component does not touch window/navigator directly (audit: component-logic).
 */
export interface BrowserContext {
  pageUrl: string
  browserInfo: string
  screenSize: string
}

/**
 * Returns current page URL, user agent, and viewport size when running in browser; empty strings when window is undefined (SSR).
 */
export function captureBrowserContext(): BrowserContext {
  if (typeof window === 'undefined') {
    return { pageUrl: '', browserInfo: '', screenSize: '' }
  }
  const nav = typeof window.navigator !== 'undefined' ? window.navigator : null
  return {
    pageUrl: window.location.href,
    browserInfo: nav ? nav.userAgent : '',
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
}
