/**
 * Attendee Quick Select Composable
 * 
 * LEARNING: Provides quick-select functionality for attendee assignment fields
 * WHY: Allows users to quickly select major/minor attendees from business settings instead of picking one by one
 * PATTERN: Composable that fetches business settings and provides selection functions
 * 
 * This composable handles:
 * - Fetching business settings with differentialPerspectives configuration
 * - Extracting majorAttendees and minorAttendees arrays
 * - Filtering attendees to only include valid options
 * - Providing selection functions: selectMajor(), selectMinor(), selectAll()
 */

import { ref, computed, type Ref } from 'vue'
import { getAvailabilitySettings, type AvailabilitySettings } from '@/configs/availabilitySettings'
import type { GlobalEntityId } from '@/types/entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAttendeeQuickSelect')

export interface UseAttendeeQuickSelectReturn {
  isLoading: Ref<boolean>
  
  error: Ref<string | null>
  
  hasMajorAttendees: Ref<boolean>
  
  hasMinorAttendees: Ref<boolean>
  
  selectMajor: (validOptionIds: string[]) => string[]
  
  selectMinor: (validOptionIds: string[]) => string[]
  
  selectAll: (validOptionIds: string[]) => string[]
}

/**
 * Attendee Quick Select Composable
 * 
 * LEARNING: Provides quick-select functions for attendee assignment fields
 * WHY: Fetches business settings and provides filtered attendee IDs for quick selection
 * PATTERN: Composable with async settings fetch and selection functions
 */
export function useAttendeeQuickSelect(): UseAttendeeQuickSelectReturn {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<AvailabilitySettings | null>(null)

  /**
   * LEARNING: Fetch business settings on initialization
   * WHY: Need differentialPerspectives config to determine major/minor attendees
   * PATTERN: Async fetch with loading and error states
   */
  const loadSettings = async (): Promise<void> => {
    if (settings.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const fetchedSettings = await getAvailabilitySettings()
      settings.value = fetchedSettings
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load business settings'
      error.value = errorMessage
      logger.error('Failed to fetch business settings', { error: err })
    } finally {
      isLoading.value = false
    }
  }

  loadSettings()

  /**
   * LEARNING: Check if major attendees are configured
   * WHY: Need to know if major attendees button should be enabled
   * PATTERN: Check differentialPerspectives.majorAttendees array
   */
  const hasMajorAttendees = computed(() => {
    const majorAttendees = settings.value?.differentialPerspectives?.majorAttendees
    return Array.isArray(majorAttendees) && majorAttendees.length > 0
  })

  /**
   * LEARNING: Check if minor attendees are configured
   * WHY: Need to know if minor attendees button should be enabled
   * PATTERN: Check differentialPerspectives.minorAttendees array
   */
  const hasMinorAttendees = computed(() => {
    const minorAttendees = settings.value?.differentialPerspectives?.minorAttendees
    return Array.isArray(minorAttendees) && minorAttendees.length > 0
  })

  /**
   * LEARNING: Filter attendee IDs to only include valid options
   * WHY: Some configured attendees might not be in the current select options
   * PATTERN: Filter array to only include IDs present in validOptionIds
   */
  const filterToValidOptions = (attendeeIds: GlobalEntityId[], validOptionIds: string[]): string[] => {
    const validSet = new Set(validOptionIds.map(id => String(id)))
    return attendeeIds
      .map(id => String(id))
      .filter(id => validSet.has(id))
  }

  /**
   * LEARNING: Get major attendee IDs filtered to valid options
   * WHY: Returns only attendees that are actually available in the select field
   * PATTERN: Extract majorAttendees from settings and filter to valid options
   */
  const selectMajor = (validOptionIds: string[]): string[] => {
    if (!hasMajorAttendees.value) {
      return []
    }
    const majorAttendees = settings.value?.differentialPerspectives?.majorAttendees || []
    return filterToValidOptions(majorAttendees, validOptionIds)
  }

  /**
   * LEARNING: Get minor attendee IDs filtered to valid options
   * WHY: Returns only attendees that are actually available in the select field
   * PATTERN: Extract minorAttendees from settings and filter to valid options
   */
  const selectMinor = (validOptionIds: string[]): string[] => {
    if (!hasMinorAttendees.value) {
      return []
    }
    const minorAttendees = settings.value?.differentialPerspectives?.minorAttendees || []
    return filterToValidOptions(minorAttendees, validOptionIds)
  }

  /**
   * LEARNING: Get all attendee IDs (major + minor) filtered to valid options
   * WHY: Combines both major and minor attendees for "Select All" functionality
   * PATTERN: Combine major and minor arrays, deduplicate, filter to valid options
   */
  const selectAll = (validOptionIds: string[]): string[] => {
    const majorIds = selectMajor(validOptionIds)
    const minorIds = selectMinor(validOptionIds)
    
    const allIds = [...majorIds, ...minorIds]
    const uniqueIds = Array.from(new Set(allIds))
    
    return uniqueIds
  }

  return {
    isLoading,
    error,
    hasMajorAttendees,
    hasMinorAttendees,
    selectMajor,
    selectMinor,
    selectAll
  }
}
