/**
 * Resolves wizard logo URL for <img src> in the booking app.
 * WHY: API may return root-relative paths (served via same-origin proxy or static route).
 */

/** Absolute http(s) or root-relative paths become a loadable href; empty → null. */
export function resolveBookingWizardLogoUrl(raw: string | null | undefined): string | null {
  if (raw == null) {
    return null
  }
  const u = String(raw).trim()
  if (u === '') {
    return null
  }
  if (/^https?:\/\//i.test(u)) {
    return u
  }
  if (u.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${u}`
    }
    return u
  }
  return u
}
