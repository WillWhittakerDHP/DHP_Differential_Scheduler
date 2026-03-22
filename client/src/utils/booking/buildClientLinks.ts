/**
 * Client-facing URL builders for reschedule, quote, and cancel flows.
 *
 * Base URL source:
 * - Client runtime: uses `window.location.origin` when available.
 * - Server-side (invite templates, Task 6.5.4.5): pass explicit baseUrl or use
 *   VITE_APP_BASE_URL env var when building links for calendar invites.
 */

import { nilToEmptyString } from '@shared/utils/nilDefaults'

const BOOKING_PATH = '/booking'
const CANCEL_PATH = '/cancel'

/** Resolve base URL for link building. Client uses origin; server/invites pass explicit base. */
function getBaseUrl(baseUrl?: string): string {
  if (baseUrl !== undefined && baseUrl !== '') return baseUrl
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return nilToEmptyString(import.meta.env?.VITE_APP_BASE_URL)
}

/**
 * Build full URL for reschedule flow.
 * @param appointmentId - Appointment ID
 * @param baseUrl - Optional override (for server-side invite templates)
 */
export function buildRescheduleLink(appointmentId: string, baseUrl?: string): string {
  const base = getBaseUrl(baseUrl)
  const path = `${BOOKING_PATH}?mode=reschedule&appointmentId=${encodeURIComponent(appointmentId)}`
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}

/**
 * Build full URL for quote flow.
 * @param appointmentId - Appointment ID
 * @param baseUrl - Optional override (for server-side invite templates)
 */
export function buildQuoteLink(appointmentId: string, baseUrl?: string): string {
  const base = getBaseUrl(baseUrl)
  const path = `${BOOKING_PATH}?mode=quote&appointmentId=${encodeURIComponent(appointmentId)}`
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}

/**
 * Build full URL for cancel flow.
 * @param appointmentId - Appointment ID
 * @param baseUrl - Optional override (for server-side invite templates)
 */
export function buildCancelLink(appointmentId: string, baseUrl?: string): string {
  const base = getBaseUrl(baseUrl)
  const path = `${CANCEL_PATH}?appointmentId=${encodeURIComponent(appointmentId)}`
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}
