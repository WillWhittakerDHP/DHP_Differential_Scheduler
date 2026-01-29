/**
 * USEAVAILABILITYSETTINGS TESTS
 * 
 * Unit tests for useAvailabilitySettings composable.
 * Tests availability settings loading, caching, and refresh logic.
 * 
 * What it covers:
 * - settings: Reactive availability settings
 * - isLoading: Loading state tracking
 * - error: Error state tracking
 * - hasError: Computed error state
 * - refresh: Manual refresh functionality
 * 
 * How it works:
 * - Tests initial settings loading via watchEffect
 * - Tests providing initial settings to skip fetching
 * - Tests manual refresh of settings
 * - Tests error handling during fetch
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed/watchEffect for reactive state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAvailabilitySettings } from '../useAvailabilitySettings'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

vi.mock('@/configs/availabilitySettings', () => ({
  getAvailabilitySettings: vi.fn(),
}))

describe('useAvailabilitySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial settings', () => {
    it('should use provided initial settings without fetching', async () => {
      const mockSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '09:00', end: '17:00' },
          1: { start: '09:00', end: '17:00' },
          2: { start: '09:00', end: '17:00' },
          3: { start: '09:00', end: '17:00' },
          4: { start: '09:00', end: '17:00' },
          5: { start: '09:00', end: '17:00' },
          6: { start: '09:00', end: '17:00' },
        },
        timeSlotIncrement: 30,
        timezone: 'America/New_York',
      } as AvailabilitySettings

      const { settings, isLoading } = useAvailabilitySettings(mockSettings)

      await nextTick()

      expect(settings.value).toEqual(mockSettings)
      expect(isLoading.value).toBe(false)
      expect(getAvailabilitySettings).not.toHaveBeenCalled()
    })
  })

  describe('settings loading', () => {
    it('should load settings when not provided initially', async () => {
      const mockSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '09:00', end: '17:00' },
          1: { start: '09:00', end: '17:00' },
          2: { start: '09:00', end: '17:00' },
          3: { start: '09:00', end: '17:00' },
          4: { start: '09:00', end: '17:00' },
          5: { start: '09:00', end: '17:00' },
          6: { start: '09:00', end: '17:00' },
        },
        timeSlotIncrement: 30,
        timezone: 'America/New_York',
      } as AvailabilitySettings

      vi.mocked(getAvailabilitySettings).mockResolvedValue(mockSettings)

      const { settings, isLoading } = useAvailabilitySettings()

      // Wait for watchEffect to run
      await nextTick()
      // Wait for async fetch to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(getAvailabilitySettings).toHaveBeenCalled()
      expect(settings.value).toEqual(mockSettings)
      expect(isLoading.value).toBe(false)
    })

    it('should handle loading state during fetch', async () => {
      const mockSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '09:00', end: '17:00' },
          1: { start: '09:00', end: '17:00' },
          2: { start: '09:00', end: '17:00' },
          3: { start: '09:00', end: '17:00' },
          4: { start: '09:00', end: '17:00' },
          5: { start: '09:00', end: '17:00' },
          6: { start: '09:00', end: '17:00' },
        },
        timeSlotIncrement: 30,
        timezone: 'America/New_York',
      } as AvailabilitySettings

      let resolvePromise: (value: AvailabilitySettings) => void
      const promise = new Promise<AvailabilitySettings>(resolve => {
        resolvePromise = resolve
      })

      vi.mocked(getAvailabilitySettings).mockReturnValue(promise)

      const { isLoading } = useAvailabilitySettings()

      await nextTick()

      // Loading should be true while fetching
      expect(isLoading.value).toBe(true)

      resolvePromise!(mockSettings)
      await promise
      await nextTick()

      expect(isLoading.value).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle errors during settings fetch', async () => {
      const mockError = new Error('Failed to fetch settings')
      vi.mocked(getAvailabilitySettings).mockRejectedValue(mockError)

      const { error, hasError } = useAvailabilitySettings()

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(error.value).toBeInstanceOf(Error)
      expect(hasError.value).toBe(true)
    })
  })

  describe('refresh', () => {
    it('should refresh settings manually', async () => {
      const initialSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '09:00', end: '17:00' },
          1: { start: '09:00', end: '17:00' },
          2: { start: '09:00', end: '17:00' },
          3: { start: '09:00', end: '17:00' },
          4: { start: '09:00', end: '17:00' },
          5: { start: '09:00', end: '17:00' },
          6: { start: '09:00', end: '17:00' },
        },
        timeSlotIncrement: 30,
        timezone: 'America/New_York',
      } as AvailabilitySettings

      const updatedSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '10:00', end: '18:00' },
          1: { start: '10:00', end: '18:00' },
          2: { start: '10:00', end: '18:00' },
          3: { start: '10:00', end: '18:00' },
          4: { start: '10:00', end: '18:00' },
          5: { start: '10:00', end: '18:00' },
          6: { start: '10:00', end: '18:00' },
        },
        timeSlotIncrement: 60,
        timezone: 'America/Los_Angeles',
      } as AvailabilitySettings

      vi.mocked(getAvailabilitySettings).mockResolvedValue(updatedSettings)

      const { settings, refresh, isLoading } = useAvailabilitySettings(initialSettings)

      await refresh()

      expect(getAvailabilitySettings).toHaveBeenCalled()
      expect(settings.value).toEqual(updatedSettings)
      expect(isLoading.value).toBe(false)
    })

    it('should handle errors during refresh', async () => {
      const initialSettings: AvailabilitySettings = {
        businessHours: {
          0: { start: '09:00', end: '17:00' },
          1: { start: '09:00', end: '17:00' },
          2: { start: '09:00', end: '17:00' },
          3: { start: '09:00', end: '17:00' },
          4: { start: '09:00', end: '17:00' },
          5: { start: '09:00', end: '17:00' },
          6: { start: '09:00', end: '17:00' },
        },
        timeSlotIncrement: 30,
        timezone: 'America/New_York',
      } as AvailabilitySettings

      const mockError = new Error('Failed to refresh')
      vi.mocked(getAvailabilitySettings).mockRejectedValue(mockError)

      const { refresh, error } = useAvailabilitySettings(initialSettings)

      await expect(refresh()).rejects.toThrow()
      expect(error.value).toBeInstanceOf(Error)
    })
  })
})
