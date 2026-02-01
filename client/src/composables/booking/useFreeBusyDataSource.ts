/**
 * useFreeBusyDataSource Composable
 * 
 * LEARNING: Manages free/busy data source selection and state
 * WHY: Allows switching between real API, mock data, both, or none for testing
 * PATTERN: Shared state composable with persistent refs
 * 
 * Session 2.1.2: Created for Calendar Availability Integration
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { getAvailabilitySettings, getCalendarEmailsArray, type CalendarConfig } from '@/configs/availabilitySettings'

/**
 * Data source modes for free/busy data
 * LEARNING: Different modes for different testing/production scenarios
 * 
 * - 'real': Only fetch from Google Calendar API (production)
 * - 'mock': Only use generated mock data (offline development)
 * - 'both': Merge real API + mock data (test edge cases)
 * - 'none': Return empty array (test "no conflicts" scenario)
 */
export type FreeBusyDataSource = 'real' | 'mock' | 'both' | 'none'

/**
 * Return type for useFreeBusyDataSource composable
 */
export interface UseFreeBusyDataSourceReturn {
  /** Current data source mode */
  dataSource: Ref<FreeBusyDataSource>
  
  /** Calendar emails from settings */
  calendarEmails: ComputedRef<string[]>
  
  /** Whether to skip server cache on next fetch */
  skipCache: Ref<boolean>
  
  /** Trigger for force refresh */
  refreshKey: Ref<number>
  
  /** Trigger a force refresh (increments refreshKey and sets skipCache) */
  forceRefresh: () => void
  
  /** Reset skipCache after use */
  clearSkipCache: () => void
  
  /** Whether calendar integration is enabled in settings */
  isCalendarEnabled: ComputedRef<boolean>
  
  /** Default data source based on calendar settings */
  defaultDataSource: ComputedRef<FreeBusyDataSource>
  
  /** Whether settings have been loaded */
  settingsLoaded: Ref<boolean>
  
  /** Reload settings (for when admin saves new config) */
  reloadSettings: () => Promise<void>
}

// Shared state - persists across component instances
// LEARNING: Module-level refs are shared across all uses of this composable
// WHY: Dev panel selection should affect all components using busy times
const sharedDataSource = ref<FreeBusyDataSource>('mock')
const sharedSkipCache = ref(false)
const sharedRefreshKey = ref(0)

// Cached calendar config from settings (loaded async on first use)
const sharedCalendarConfig = ref<CalendarConfig | null>(null)
const sharedSettingsLoaded = ref(false)

/**
 * Load availability settings and cache calendar config
 * LEARNING: Async initialization for settings that require API call
 */
async function loadCalendarConfig(): Promise<void> {
  if (sharedSettingsLoaded.value) return
  
  try {
    console.log('[useFreeBusyDataSource] Loading calendar config...')
    const settings = await getAvailabilitySettings()
    sharedCalendarConfig.value = settings.calendarConfig ?? null
    sharedSettingsLoaded.value = true
    
    // Log what was loaded for debugging
    console.log('[useFreeBusyDataSource] Loaded calendar config:', {
      enabled: sharedCalendarConfig.value?.enabled,
      provider: sharedCalendarConfig.value?.provider,
      calendars: sharedCalendarConfig.value?.calendars,
      emailsArray: getCalendarEmailsArray(sharedCalendarConfig.value ?? undefined)
    })
  } catch (error) {
    console.error('[useFreeBusyDataSource] Failed to load settings:', error)
    sharedSettingsLoaded.value = true // Don't retry on error
  }
}

/**
 * Force reload settings (for when admin saves new config)
 */
async function reloadCalendarConfig(): Promise<void> {
  sharedSettingsLoaded.value = false
  sharedCalendarConfig.value = null
  await loadCalendarConfig()
}

/**
 * useFreeBusyDataSource composable
 * 
 * LEARNING: Provides shared state for data source selection
 * WHY: Multiple components need consistent data source behavior
 * PATTERN: Composable with shared module-level state
 */
export function useFreeBusyDataSource(): UseFreeBusyDataSourceReturn {
  // Load settings on first use (async, runs in background)
  // Don't use onMounted - this composable may be called outside component context
  if (!sharedSettingsLoaded.value) {
    loadCalendarConfig()
  }
  
  /**
   * Calendar emails from cached settings
   * LEARNING: Reads from cached calendarConfig, returns empty array if not configured
   */
  const calendarEmails = computed<string[]>(() => {
    return getCalendarEmailsArray(sharedCalendarConfig.value ?? undefined)
  })
  
  /**
   * Whether calendar integration is enabled in settings
   */
  const isCalendarEnabled = computed<boolean>(() => {
    return sharedCalendarConfig.value?.enabled ?? false
  })
  
  /**
   * Default data source based on calendar settings
   * LEARNING: Auto-select appropriate mode based on configuration
   * WHY: If calendar is configured and enabled, default to 'real'; otherwise 'mock'
   */
  const defaultDataSource = computed<FreeBusyDataSource>(() => {
    const enabled = isCalendarEnabled.value
    const hasCalendars = calendarEmails.value.length > 0
    
    if (enabled && hasCalendars) {
      return 'real'
    }
    return 'mock'
  })
  
  /**
   * Trigger a force refresh
   * LEARNING: Sets skipCache flag and increments refreshKey
   * WHY: Bypasses server cache and triggers re-fetch in watching composables
   */
  const forceRefresh = (): void => {
    sharedSkipCache.value = true
    sharedRefreshKey.value++
  }
  
  /**
   * Clear skipCache flag after use
   * LEARNING: Called after fetch completes to reset state
   * WHY: skipCache should only apply to immediate next fetch
   */
  const clearSkipCache = (): void => {
    sharedSkipCache.value = false
  }
  
  return {
    dataSource: sharedDataSource,
    calendarEmails,
    skipCache: sharedSkipCache,
    refreshKey: sharedRefreshKey,
    forceRefresh,
    clearSkipCache,
    isCalendarEnabled,
    defaultDataSource,
    settingsLoaded: sharedSettingsLoaded,
    reloadSettings: reloadCalendarConfig
  }
}

/**
 * Initialize data source to default based on settings
 * LEARNING: Call once on app startup to set appropriate default
 * WHY: Ensures data source matches configuration on initial load
 */
export function initializeDataSource(): void {
  const { defaultDataSource, dataSource } = useFreeBusyDataSource()
  dataSource.value = defaultDataSource.value
}
