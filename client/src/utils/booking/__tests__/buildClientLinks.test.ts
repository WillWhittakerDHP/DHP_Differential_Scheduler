/**
 * Unit tests for buildClientLinks — URL scheme for reschedule, quote, cancel.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildRescheduleLink, buildQuoteLink, buildCancelLink } from '../buildClientLinks'

describe('buildClientLinks', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    vi.stubGlobal('window', undefined)
  })

  afterEach(() => {
    vi.stubGlobal('window', originalWindow)
  })

  describe('with explicit baseUrl', () => {
    it('buildRescheduleLink returns full URL', () => {
      expect(buildRescheduleLink('apt-123', 'https://example.com')).toBe(
        'https://example.com/booking?mode=reschedule&appointmentId=apt-123'
      )
    })

    it('buildQuoteLink returns full URL', () => {
      expect(buildQuoteLink('apt-456', 'https://example.com')).toBe(
        'https://example.com/booking?mode=quote&appointmentId=apt-456'
      )
    })

    it('buildCancelLink returns full URL', () => {
      expect(buildCancelLink('apt-789', 'https://example.com')).toBe(
        'https://example.com/cancel?appointmentId=apt-789'
      )
    })

    it('strips trailing slash from baseUrl', () => {
      expect(buildRescheduleLink('apt-1', 'https://example.com/')).toBe(
        'https://example.com/booking?mode=reschedule&appointmentId=apt-1'
      )
    })

    it('encodes appointmentId', () => {
      expect(buildRescheduleLink('apt/with/slashes', 'https://example.com')).toBe(
        'https://example.com/booking?mode=reschedule&appointmentId=apt%2Fwith%2Fslashes'
      )
    })
  })

  describe('without baseUrl (path-only fallback)', () => {
    it('returns path when no window and no env', () => {
      expect(buildRescheduleLink('apt-1')).toBe('/booking?mode=reschedule&appointmentId=apt-1')
      expect(buildQuoteLink('apt-2')).toBe('/booking?mode=quote&appointmentId=apt-2')
      expect(buildCancelLink('apt-3')).toBe('/cancel?appointmentId=apt-3')
    })
  })
})
