/**
 * PATTERN: Attendee Quick Select Composable

PATTERN: Composable that fetches busin...
 */
import { ref, computed } from 'vue'
import { getAvailabilitySettings, type AvailabilitySettings } from '@/configs/availabilitySettings'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'
import { ERROR_FETCH_BUSINESS_SETTINGS } from '@/constants/errorMessages'
import type { UseAttendeeQuickSelectReturn } from '@/types/admin/attendeeQuickSelect'


const logger = createLogger('useAttendeeQuickSelect')

export function useAttendeeQuickSelect(): UseAttendeeQuickSelectReturn {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<AvailabilitySettings | null>(null)

  /**
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
      logger.error(err)
      const errorMessage = err instanceof Error ? err.message : ERROR_FETCH_BUSINESS_SETTINGS
      error.value = errorMessage
      logger.error(ERROR_FETCH_BUSINESS_SETTINGS, { error: err })
    } finally {
      isLoading.value = false
    }
  }

  loadSettings()

  const hasMajorAttendees = computed(() => {
    const majorAttendees = settings.value?.differentialPerspectives?.majorAttendees
    return Array.isArray(majorAttendees) && majorAttendees.length > 0
  })

  const hasMinorAttendees = computed(() => {
    const minorAttendees = settings.value?.differentialPerspectives?.minorAttendees
    return Array.isArray(minorAttendees) && minorAttendees.length > 0
  })

  const filterToValidOptions = (attendeeIds: GlobalEntityId[], validOptionIds: string[]): string[] => {
    const validSet = new Set(validOptionIds.map(id => String(id)))
    return attendeeIds
      .map(id => String(id))
      .filter(id => validSet.has(id))
  }

  /**
   * PATTERN: Extract majorAttendees from settings and filter to valid options
   */
  const selectMajor = (validOptionIds: string[]): string[] => {
    if (!hasMajorAttendees.value) {
      return []
    }
    const majorAttendees = asEmptyArray(settings.value?.differentialPerspectives?.majorAttendees)
    return filterToValidOptions(majorAttendees, validOptionIds)
  }

  /**
   * PATTERN: Extract minorAttendees from settings and filter to valid options
   */
  const selectMinor = (validOptionIds: string[]): string[] => {
    if (!hasMinorAttendees.value) {
      return []
    }
    const minorAttendees = asEmptyArray(settings.value?.differentialPerspectives?.minorAttendees)
    return filterToValidOptions(minorAttendees, validOptionIds)
  }

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
