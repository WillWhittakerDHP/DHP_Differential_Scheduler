<script setup lang="ts">
/**
 * API Dev Panel Component
 * 
 * LEARNING: Dev mode panel for viewing API status, caches, and live data
 * WHY: Provides visibility into OAuth, rate limits, API calls, and cached responses for debugging
 * PATTERN: Tabbed interface matching slot dev panel styling, unified API debugging
 */

import { ref, computed, watch, onMounted, inject, type Ref, type ComputedRef } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import axios from 'axios'
// Phase 8: Removed useFreeBusyDataSource and useDriveTimeDataSource - data source now controlled by server request parameter
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'
import { useLocalTime } from '@/composables/useLocalTime'
import { checkOAuthStatus, getOAuthUrl } from '@/services/calendarApiService'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { AppointmentResponse } from '@/types/appointment'
import type { useBookingWizard } from '@/composables/useBookingWizard'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { CalendarEvent as SharedCalendarEvent } from '@shared/types/availabilityTypes'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const activeTab = ref<'status' | 'freebusy' | 'drivetime' | 'computed'>('status')
const panelRef = ref<HTMLElement | null>(null)

// Phase 7: Inject computed availability data for display
const computedAvailability = inject<UseComputedAvailabilityReturn | null>('computedAvailability', null)

// Inject dev panel buttons for appointment loading
const devPanelButtonsRef = inject<Ref<{
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
  updateAppointment: { isPending: Ref<boolean> }
  wizard: ReturnType<typeof useBookingWizard> | null
} | null>>('devPanelButtons', ref(null))

const devPanelButtons = computed(() => {
  if (!devPanelButtonsRef || !devPanelButtonsRef.value) {
    return null
  }
  return devPanelButtonsRef.value
})

const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})

// API data state
const oauthStatus = ref<any>(null)
const freeBusyCache = ref<any>(null)
const eventsCache = ref<any>(null)
const rateLimitStats = ref<{
  calendar: any | null
  maps: any | null
}>({
  calendar: null,
  maps: null
})
const driveTimeCache = ref<any>(null)
const loading = ref({
  oauth: false,
  freebusy: false,
  events: false,
  ratelimit: false,
  drivetime: false
})
const errors = ref({
  oauth: null as string | null,
  freebusy: null as string | null,
  events: null as string | null,
  ratelimit: null as string | null,
  drivetime: null as string | null
})

// API status tracking from shared state
const { apiStatus } = useApiCallStatus()

// API base URL for external routes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Phase 8: Data source toggles removed - now controlled by server request parameter in orchestrator

// Dev panel data for live busy periods
const devPanelData = useDevPanelData()

// Local time formatting
const { formatDateTimeForDisplay, formatTimeForDisplay } = useLocalTime()

// OAuth status for Free/Busy tab
const oauthStatusForFreeBusy = ref<{ authenticated: boolean; authUrl?: string }>({ authenticated: false })
const isCheckingAuth = ref(false)

// Phase 8: Data source options removed - data source now controlled by server request parameter

/**
 * Fetch OAuth status
 */
async function fetchOAuthStatus() {
  loading.value.oauth = true
  errors.value.oauth = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/external/oauth/status`)
    oauthStatus.value = response.data
  } catch (error: any) {
    errors.value.oauth = error.response?.data?.message || error.message || 'Failed to fetch OAuth status'
    console.error('[ApiDevPanel] Error fetching OAuth status:', error)
  } finally {
    loading.value.oauth = false
  }
}

/**
 * Fetch free-busy cache
 */
async function fetchFreeBusyCache() {
  loading.value.freebusy = true
  errors.value.freebusy = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/external/calendar/debug/freebusy-cache`)
    freeBusyCache.value = response.data
    // Note: API status is tracked by actual API calls, not cache fetches
  } catch (error: any) {
    errors.value.freebusy = error.response?.data?.message || error.message || 'Failed to fetch free-busy cache'
    console.error('[ApiDevPanel] Error fetching free-busy cache:', error)
  } finally {
    loading.value.freebusy = false
  }
}

/**
 * Fetch events cache
 */
async function fetchEventsCache() {
  loading.value.events = true
  errors.value.events = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/external/calendar/debug/events-cache`)
    eventsCache.value = response.data
    // Note: API status is tracked by actual API calls, not cache fetches
  } catch (error: any) {
    errors.value.events = error.response?.data?.message || error.message || 'Failed to fetch events cache'
    console.error('[ApiDevPanel] Error fetching events cache:', error)
  } finally {
    loading.value.events = false
  }
}

/**
 * Fetch rate limit stats for both APIs
 */
async function fetchRateLimitStats() {
  loading.value.ratelimit = true
  errors.value.ratelimit = null
  try {
    const [calendarResponse, mapsResponse] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/v1/external/calendar/debug/rate-limit`),
      axios.get(`${API_BASE_URL}/api/v1/external/maps/debug/rate-limit`)
    ])
    
    if (calendarResponse.status === 'fulfilled') {
      rateLimitStats.value.calendar = calendarResponse.value.data
    } else {
      console.error('[ApiDevPanel] Error fetching calendar rate limit:', calendarResponse.reason)
    }
    
    if (mapsResponse.status === 'fulfilled') {
      rateLimitStats.value.maps = mapsResponse.value.data
    } else {
      console.error('[ApiDevPanel] Error fetching maps rate limit:', mapsResponse.reason)
    }
    
    // Set error if both failed
    if (calendarResponse.status === 'rejected' && mapsResponse.status === 'rejected') {
      errors.value.ratelimit = 'Failed to fetch rate limit stats for both APIs'
    }
  } catch (error: any) {
    errors.value.ratelimit = error.response?.data?.message || error.message || 'Failed to fetch rate limit stats'
    console.error('[ApiDevPanel] Error fetching rate limit stats:', error)
  } finally {
    loading.value.ratelimit = false
  }
}

/**
 * Fetch drive time cache
 */
async function fetchDriveTimeCache() {
  loading.value.drivetime = true
  errors.value.drivetime = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/external/maps/debug/drive-time-cache`)
    driveTimeCache.value = response.data
    // Note: API status is tracked by actual API calls, not cache fetches
  } catch (error: any) {
    errors.value.drivetime = error.response?.data?.message || error.message || 'Failed to fetch drive time cache'
    console.error('[ApiDevPanel] Error fetching drive time cache:', error)
  } finally {
    loading.value.drivetime = false
  }
}

/**
 * Fetch all data
 */
async function fetchAll() {
  await Promise.all([
    fetchOAuthStatus(),
    fetchFreeBusyCache(),
    fetchEventsCache(),
    fetchRateLimitStats(),
    fetchDriveTimeCache()
  ])
}

// Phase 8: OAuth check simplified - always check (data source now controlled server-side)
const checkAuth = async () => {
  isCheckingAuth.value = true
  try {
    oauthStatusForFreeBusy.value = await checkOAuthStatus()
  } catch (error) {
    oauthStatusForFreeBusy.value = { authenticated: false, authUrl: getOAuthUrl() }
  } finally {
    isCheckingAuth.value = false
  }
}

// Fetch data when tab changes
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'status':
      if (!oauthStatus.value) fetchOAuthStatus()
      if (!rateLimitStats.value) fetchRateLimitStats()
      break
    case 'freebusy':
      if (!freeBusyCache.value) fetchFreeBusyCache()
      checkAuth()
      break
    case 'drivetime':
      if (!eventsCache.value) fetchEventsCache()
      if (!driveTimeCache.value) fetchDriveTimeCache()
      break
  }
})

// Phase 8: Removed watch on freeBusyDataSource - data source now controlled server-side

// Fetch OAuth status on mount
onMounted(() => {
  if (isDevMode) {
    fetchOAuthStatus()
    fetchRateLimitStats()
  }
})

// Format timestamp for display
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

// Format TTL for display
function formatTTL(ttl: number): string {
  const minutes = Math.floor(ttl / (60 * 1000))
  return `${minutes} min`
}

// Get busy periods from dev panel data
const calendarData = computed(() => {
  const data = devPanelData.value
  
  const dateRangeRef = data.dateRange
  let dateRangeValue: { start: RFC3339DateTime; end: RFC3339DateTime } | null = null
  
  if (dateRangeRef) {
    if (typeof dateRangeRef === 'object' && 'value' in dateRangeRef) {
      const value = dateRangeRef.value
      if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
        dateRangeValue = value as { start: RFC3339DateTime; end: RFC3339DateTime }
      }
    } else if (dateRangeRef && typeof dateRangeRef === 'object' && 'start' in dateRangeRef && 'end' in dateRangeRef) {
      dateRangeValue = dateRangeRef as { start: RFC3339DateTime; end: RFC3339DateTime }
    }
  }
  
  const busyPeriodsRef = data.busyPeriods
  let busyPeriodsValue: BusyTimeRange[] = []
  if (busyPeriodsRef) {
    if (typeof busyPeriodsRef === 'object' && 'value' in busyPeriodsRef) {
      const value = busyPeriodsRef.value
      if (Array.isArray(value)) {
        busyPeriodsValue = value as BusyTimeRange[]
      }
    } else if (Array.isArray(busyPeriodsRef)) {
      busyPeriodsValue = busyPeriodsRef as BusyTimeRange[]
    }
  }
  
  return {
    dateRange: dateRangeValue,
    busyPeriods: busyPeriodsValue
  }
})

const busyPeriods = computed(() => {
  // Phase 9: Removed getMockBusyTimesSync fallback - all busy times come from server-side orchestrator
  // WHY: Busy times are now fetched server-side via ComputedAvailabilityData
  if (!calendarData.value.dateRange) {
    return []
  }
  
  // Return busy periods from orchestrator if available
  return calendarData.value.busyPeriods || []
})

const formatBusyPeriod = (period: { start: RFC3339DateTime; end: RFC3339DateTime }): string => {
  const start = new Date(period.start)
  const end = new Date(period.end)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  
  const startStr = formatDateTimeForDisplay(period.start as any, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  const endStr = formatTimeForDisplay(period.end as any, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${startStr} - ${endStr} (${durationMinutes} min)`
}

const totalBlockedMinutes = computed(() => {
  return busyPeriods.value.reduce((total, period) => {
    const start = new Date(period.start)
    const end = new Date(period.end)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    return total + duration
  }, 0)
})

const totalBlockedHours = computed(() => {
  return Math.round((totalBlockedMinutes.value / 60) * 10) / 10
})

// API status chip color
function getApiStatusColor(status: 'hit' | 'error' | 'not_called'): string {
  switch (status) {
    case 'hit': return 'success'
    case 'error': return 'error'
    case 'not_called': return 'default'
  }
}

// API status label
function getApiStatusLabel(status: 'hit' | 'error' | 'not_called'): string {
  switch (status) {
    case 'hit': return 'Hit'
    case 'error': return 'Error'
    case 'not_called': return 'Not Called'
  }
}
</script>

<template>
  <Teleport to="body">
    <VCard
      v-if="isDevMode && visible"
      ref="panelRef"
      class="api-dev-panel"
      variant="outlined"
      color="info"
    >
      <VCardTitle class="d-flex justify-space-between align-center pa-3">
        <span class="text-h6">API Dev Panel</span>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="emit('close')"
        />
      </VCardTitle>

      <!-- Button Row Above Tabs -->
      <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
        <VRow v-if="devPanelButtons" dense no-gutters>
          <VCol cols="12" class="d-flex gap-2 mb-2 align-center">
            <VBtn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="tabler-file-upload"
              :loading="(devPanelButtons?.fetchAll?.isLoading?.value || devPanelButtons?.isLoadingAppointment?.value) ?? false"
              @click="devPanelButtons?.handleLoadAppointment('random')"
            >
              LOAD RANDOM APPOINTMENT
            </VBtn>
            <VBtn
              color="success"
              variant="outlined"
              size="small"
              prepend-icon="tabler-device-floppy"
              :loading="devPanelButtons?.updateAppointment?.isPending?.value ?? false"
              :disabled="(devPanelButtons?.updateAppointment?.isPending?.value || !devPanelButtons?.loadedAppointmentId?.value) ?? false"
              @click="devPanelButtons?.handleUpdateAppointment"
            >
              UPDATE APPOINTMENT
            </VBtn>
            <VBtn
              color="secondary"
              variant="outlined"
              size="small"
              prepend-icon="tabler-refresh"
              @click="devPanelButtons?.handleResetWizard"
            >
              RESET WIZARD
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="pa-0">
        <!-- Tab Navigation -->
        <VTabs v-model="activeTab" density="compact" color="info" class="flexible-tabs px-3">
          <VTab value="status">
            <VIcon size="small" class="mr-2">tabler-api</VIcon>
            Status
          </VTab>
          <VTab value="freebusy">
            <VIcon size="small" class="mr-2">tabler-calendar-event</VIcon>
            Free/Busy
          </VTab>
          <VTab value="drivetime">
            <VIcon size="small" class="mr-2">tabler-route</VIcon>
            DriveTime
          </VTab>
          <VTab value="computed" :disabled="!computedAvailability">
            <VIcon size="small" class="mr-2">tabler-calculator</VIcon>
            Computed Data
          </VTab>
        </VTabs>

        <!-- Tab Content -->
        <VWindow v-model="activeTab">
          <!-- Status Tab -->
          <VWindowItem value="status">
            <div class="pa-3">
              <!-- OAuth Status -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <h3 class="text-subtitle-1 font-weight-bold">OAuth Status</h3>
                  <VBtn
                    size="small"
                    :loading="loading.oauth"
                    @click="fetchOAuthStatus"
                  >
                    Refresh
                  </VBtn>
                </div>
                
                <VAlert
                  v-if="errors.oauth"
                  type="error"
                  class="mb-3"
                  density="compact"
                >
                  {{ errors.oauth }}
                </VAlert>

                <VCard v-if="oauthStatus" variant="outlined" density="compact">
                  <VCardText>
                    <div class="mb-2">
                      <strong>Authenticated:</strong> 
                      <VChip
                        :color="oauthStatus.authenticated ? 'success' : 'error'"
                        size="small"
                        class="ml-2"
                      >
                        {{ oauthStatus.authenticated ? 'Yes' : 'No' }}
                      </VChip>
                    </div>
                    <div v-if="oauthStatus.authenticated" class="mb-2">
                      <strong>Has Refresh Token:</strong> {{ oauthStatus.hasRefreshToken ? 'Yes' : 'No' }}
                    </div>
                    <div v-if="oauthStatus.expiryDate" class="mb-2">
                      <strong>Expires:</strong> {{ formatTimestamp(oauthStatus.expiryDate) }}
                    </div>
                    <div v-if="!oauthStatus.authenticated && oauthStatus.authUrl" class="mt-3">
                      <VBtn
                        :href="oauthStatus.authUrl"
                        target="_blank"
                        color="primary"
                        size="small"
                      >
                        Authenticate
                      </VBtn>
                    </div>
                  </VCardText>
                </VCard>
              </div>

              <VDivider class="my-4" />

              <!-- Rate Limits -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <h3 class="text-subtitle-1 font-weight-bold">Rate Limits</h3>
                  <VBtn
                    size="small"
                    :loading="loading.ratelimit"
                    @click="fetchRateLimitStats"
                  >
                    Refresh
                  </VBtn>
                </div>

                <VAlert
                  v-if="errors.ratelimit"
                  type="error"
                  class="mb-3"
                  density="compact"
                >
                  {{ errors.ratelimit }}
                </VAlert>

                <!-- Calendar API Rate Limits -->
                <VCard v-if="rateLimitStats.calendar" variant="outlined" density="compact" class="mb-3">
                  <VCardTitle class="text-subtitle-2 pa-2">Google Calendar API</VCardTitle>
                  <VCardText>
                    <div class="mb-2">
                      <strong>Limit:</strong> {{ rateLimitStats.calendar.requestsPerMinute }} requests/minute
                    </div>
                    <div class="mb-2">
                      <strong>Current Requests:</strong> {{ rateLimitStats.calendar.currentRequests }}
                    </div>
                    <div class="mb-2">
                      <strong>Remaining:</strong> {{ rateLimitStats.calendar.remainingRequests }}
                    </div>
                    <div class="mb-2">
                      <strong>Utilization:</strong> 
                      <VProgressLinear
                        :model-value="rateLimitStats.calendar.utilizationPercent"
                        :color="rateLimitStats.calendar.utilizationPercent > 80 ? 'error' : rateLimitStats.calendar.utilizationPercent > 60 ? 'warning' : 'success'"
                        height="20"
                        class="mt-1"
                      >
                        {{ Math.round(rateLimitStats.calendar.utilizationPercent) }}%
                      </VProgressLinear>
                    </div>
                  </VCardText>
                </VCard>

                <!-- Maps API Rate Limits -->
                <VCard v-if="rateLimitStats.maps" variant="outlined" density="compact">
                  <VCardTitle class="text-subtitle-2 pa-2">Google Maps API</VCardTitle>
                  <VCardText>
                    <div class="mb-2">
                      <strong>Limit:</strong> {{ rateLimitStats.maps.requestsPerMinute }} requests/minute
                    </div>
                    <div class="mb-2">
                      <strong>Current Requests:</strong> {{ rateLimitStats.maps.currentRequests }}
                    </div>
                    <div class="mb-2">
                      <strong>Remaining:</strong> {{ rateLimitStats.maps.remainingRequests }}
                    </div>
                    <div class="mb-2">
                      <strong>Utilization:</strong> 
                      <VProgressLinear
                        :model-value="rateLimitStats.maps.utilizationPercent"
                        :color="rateLimitStats.maps.utilizationPercent > 80 ? 'error' : rateLimitStats.maps.utilizationPercent > 60 ? 'warning' : 'success'"
                        height="20"
                        class="mt-1"
                      >
                        {{ Math.round(rateLimitStats.maps.utilizationPercent) }}%
                      </VProgressLinear>
                    </div>
                  </VCardText>
                </VCard>

                <VAlert
                  v-if="!rateLimitStats.calendar && !rateLimitStats.maps && !loading.ratelimit"
                  type="info"
                  density="compact"
                  class="mt-3"
                >
                  No rate limit data available. Click Refresh to load.
                </VAlert>
              </div>

              <VDivider class="my-4" />

              <!-- API Status Flags -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">API Call Status</h3>
                <VList density="compact">
                  <VListItem>
                    <VListItemTitle class="text-body-2">Free/Busy</VListItemTitle>
                    <template #append>
                      <VChip
                        :color="getApiStatusColor(apiStatus.freeBusy)"
                        size="small"
                      >
                        {{ getApiStatusLabel(apiStatus.freeBusy) }}
                      </VChip>
                    </template>
                  </VListItem>
                  <VListItem>
                    <VListItemTitle class="text-body-2">Events</VListItemTitle>
                    <template #append>
                      <VChip
                        :color="getApiStatusColor(apiStatus.events)"
                        size="small"
                      >
                        {{ getApiStatusLabel(apiStatus.events) }}
                      </VChip>
                    </template>
                  </VListItem>
                  <VListItem>
                    <VListItemTitle class="text-body-2">Routes</VListItemTitle>
                    <template #append>
                      <VChip
                        :color="getApiStatusColor(apiStatus.routes)"
                        size="small"
                      >
                        {{ getApiStatusLabel(apiStatus.routes) }}
                      </VChip>
                    </template>
                  </VListItem>
                  <VListItem>
                    <VListItemTitle class="text-body-2">Places</VListItemTitle>
                    <template #append>
                      <VChip
                        :color="getApiStatusColor(apiStatus.places)"
                        size="small"
                      >
                        {{ getApiStatusLabel(apiStatus.places) }}
                      </VChip>
                    </template>
                  </VListItem>
                </VList>
              </div>
            </div>
          </VWindowItem>

          <!-- Free/Busy Tab -->
          <VWindowItem value="freebusy">
            <div class="pa-3">
              <!-- Phase 8: Data source toggle removed - now controlled server-side -->
              <div class="mb-4">
                <div class="d-flex gap-2">
                  <VBtn
                    variant="outlined"
                    size="small"
                    :loading="loading.freebusy"
                    @click="fetchFreeBusyCache"
                  >
                    Refresh Cache
                  </VBtn>
                </div>
              </div>

              <!-- OAuth Warning -->
              <VAlert
                v-if="!oauthStatusForFreeBusy.authenticated && !isCheckingAuth"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon>tabler-alert-triangle</VIcon>
                </template>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption">Not connected to Google Calendar</span>
                  <VBtn
                    variant="text"
                    size="small"
                    color="warning"
                    :href="oauthStatusForFreeBusy.authUrl || getOAuthUrl()"
                    target="_blank"
                  >
                    Connect
                  </VBtn>
                </div>
              </VAlert>

              <!-- Auth Checking Indicator -->
              <div v-if="isCheckingAuth" class="d-flex align-center mb-4">
                <VProgressCircular indeterminate size="16" class="mr-2" />
                <span class="text-caption">Checking authentication...</span>
              </div>

              <VDivider class="my-3" />

              <!-- Debugging Information -->
              <VExpansionPanels variant="accordion" class="mb-4">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    <VIcon class="mr-2">tabler-bug</VIcon>
                    Debugging Information
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <VList density="compact">
                      <!-- Phase 8: Data source and calendar emails removed - now controlled server-side -->
                      <VListItem v-if="calendarData.dateRange">
                        <VListItemTitle class="text-caption text-medium-emphasis">Date Range (UTC)</VListItemTitle>
                        <VListItemSubtitle>
                          {{ calendarData.dateRange.start }} → {{ calendarData.dateRange.end }}
                        </VListItemSubtitle>
                      </VListItem>
                      <VListItem v-else>
                        <VListItemTitle class="text-caption text-medium-emphasis">Date Range</VListItemTitle>
                        <VListItemSubtitle class="text-warning">Not set - select a date in booking wizard</VListItemSubtitle>
                      </VListItem>
                      <VListItem>
                        <VListItemTitle class="text-caption text-medium-emphasis">Orchestrator Status</VListItemTitle>
                        <VListItemSubtitle>
                          <VChip
                            :color="devPanelData.dateRange ? 'success' : 'warning'"
                            size="small"
                            variant="tonal"
                          >
                            {{ devPanelData.dateRange ? 'Date range available' : 'Waiting for date range' }}
                          </VChip>
                        </VListItemSubtitle>
                      </VListItem>
                      <VListItem>
                        <VListItemTitle class="text-caption text-medium-emphasis">Free-Busy Fetch Status</VListItemTitle>
                        <VListItemSubtitle class="text-caption">
                          <span v-if="!calendarData.dateRange" class="text-warning">
                            ⚠️ No date range - select a date in booking wizard
                          </span>
                          <span v-else class="text-success">
                            ✓ Free-busy fetched automatically by orchestrator
                          </span>
                        </VListItemSubtitle>
                      </VListItem>
                      <VListItem>
                        <VListItemTitle class="text-caption text-medium-emphasis">Note</VListItemTitle>
                        <VListItemSubtitle class="text-caption">
                          Free-busy queries don't require placeId. Calendar events require placeId for geocoding. Check browser console for detailed logs.
                        </VListItemSubtitle>
                      </VListItem>
                    </VList>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>

              <!-- Live Busy Periods -->
              <div v-if="!calendarData.dateRange" class="text-body-2 text-medium-emphasis mb-4">
                Select a date to see busy periods
              </div>

              <template v-else>
                <!-- Summary Statistics -->
                <VRow class="mb-4">
                  <VCol cols="12" sm="6">
                    <VCard variant="tonal" color="warning">
                      <VCardText class="py-2">
                        <div class="text-caption text-medium-emphasis">Blocked Periods</div>
                        <div class="text-h6">{{ busyPeriods.length }}</div>
                      </VCardText>
                    </VCard>
                  </VCol>
                  <VCol cols="12" sm="6">
                    <VCard variant="tonal" color="warning">
                      <VCardText class="py-2">
                        <div class="text-caption text-medium-emphasis">Total Blocked Time</div>
                        <div class="text-h6">{{ totalBlockedHours }} hours</div>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>

                <!-- Busy Periods List -->
                <div v-if="busyPeriods.length === 0" class="text-body-2 text-medium-emphasis mb-4">
                  <VAlert type="info" variant="tonal" density="compact" class="mb-2">
                    <template #prepend>
                      <VIcon>tabler-info-circle</VIcon>
                    </template>
                      <div>
                        <div class="text-body-2 mb-1">No busy periods for this date range</div>
                        <div class="text-caption">
                          Check browser console for API logs. Orchestrator may be waiting for placeId.
                        </div>
                      </div>
                  </VAlert>
                </div>

                <VList v-else density="compact" class="mb-4">
                  <VListSubheader>
                    Blocked Time Periods ({{ busyPeriods.length }})
                  </VListSubheader>
                  <VListItem
                    v-for="(period, index) in busyPeriods"
                    :key="index"
                    :title="formatBusyPeriod(period)"
                    prepend-icon="tabler-clock-x"
                    color="warning"
                  >
                    <template #subtitle>
                      <div class="d-flex flex-column gap-1 mt-1">
                        <span class="text-caption">
                          UTC: {{ new Date(period.start).toISOString() }} → {{ new Date(period.end).toISOString() }}
                        </span>
                        <span class="text-caption text-medium-emphasis">
                          Duration: {{ Math.round((new Date(period.end).getTime() - new Date(period.start).getTime()) / (1000 * 60)) }} minutes
                        </span>
                      </div>
                    </template>
                  </VListItem>
                </VList>
              </template>

              <VDivider class="my-3" />

              <!-- Cache Stats -->
              <div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <h3 class="text-subtitle-1 font-weight-bold">Free/Busy Cache</h3>
                </div>

                <VAlert
                  v-if="errors.freebusy"
                  type="error"
                  class="mb-3"
                  density="compact"
                >
                  {{ errors.freebusy }}
                </VAlert>

                <VCard v-if="freeBusyCache" variant="outlined" density="compact">
                  <VCardText>
                    <div class="mb-3">
                      <strong>Cache Stats:</strong>
                      <ul>
                        <li>Total Entries: {{ freeBusyCache.stats?.totalEntries || 0 }}</li>
                        <li>Memory Usage: ~{{ Math.round((freeBusyCache.stats?.memoryUsage || 0) / 1024) }} KB</li>
                      </ul>
                    </div>
                    
                    <div v-if="freeBusyCache.entries && freeBusyCache.entries.length > 0">
                      <strong>Cached Entries ({{ freeBusyCache.entries.length }}):</strong>
                      <VExpansionPanels class="mt-2">
                        <VExpansionPanel
                          v-for="(entry, index) in freeBusyCache.entries"
                          :key="index"
                        >
                          <VExpansionPanelTitle>
                            {{ entry.key }}
                            <VChip
                              :color="entry.expired ? 'error' : 'success'"
                              size="small"
                              class="ml-2"
                            >
                              {{ entry.expired ? 'Expired' : 'Valid' }}
                            </VChip>
                          </VExpansionPanelTitle>
                          <VExpansionPanelText>
                            <div class="mb-2">
                              <strong>Age:</strong> {{ Math.round(entry.age / 1000) }}s
                            </div>
                            <div class="mb-2">
                              <strong>TTL:</strong> {{ formatTTL(entry.ttl) }}
                            </div>
                            <div>
                              <strong>Data:</strong>
                              <pre class="mt-2" style="max-height: 200px; overflow-y: auto; font-size: 0.75rem;">{{ JSON.stringify(entry.data, null, 2) }}</pre>
                            </div>
                          </VExpansionPanelText>
                        </VExpansionPanel>
                      </VExpansionPanels>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      No cached entries
                    </div>
                  </VCardText>
                </VCard>
              </div>
            </div>
          </VWindowItem>

          <!-- DriveTime Tab -->
          <VWindowItem value="drivetime">
            <div class="pa-3">
              <!-- Data Source Toggle -->
              <div class="mb-4">
                <!-- Phase 8: Drive time data source toggle removed - now controlled server-side -->
                <div class="d-flex gap-2 mb-2">
                  <VBtn
                    variant="outlined"
                    size="small"
                    :loading="loading.events"
                    @click="fetchEventsCache"
                  >
                    Refresh Events Cache
                  </VBtn>
                  <VBtn
                    variant="outlined"
                    size="small"
                    :loading="loading.drivetime"
                    @click="fetchDriveTimeCache"
                  >
                    Refresh DriveTime Cache
                  </VBtn>
                </div>
              </div>

              <VDivider class="my-3" />

              <!-- Events Cache Section -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Events Cache</h3>

                <VAlert
                  v-if="errors.events"
                  type="error"
                  class="mb-3"
                  density="compact"
                >
                  {{ errors.events }}
                </VAlert>

                <VCard v-if="eventsCache" variant="outlined" density="compact">
                  <VCardText>
                    <div class="mb-3">
                      <strong>Cache Stats:</strong>
                      <ul>
                        <li>Total Entries: {{ eventsCache.stats?.totalEntries || 0 }}</li>
                        <li>Memory Usage: ~{{ Math.round((eventsCache.stats?.memoryUsage || 0) / 1024) }} KB</li>
                      </ul>
                    </div>
                    
                    <div v-if="eventsCache.entries && eventsCache.entries.length > 0">
                      <strong>Cached Entries ({{ eventsCache.entries.length }}):</strong>
                      <VExpansionPanels class="mt-2">
                        <VExpansionPanel
                          v-for="(entry, index) in eventsCache.entries"
                          :key="index"
                        >
                          <VExpansionPanelTitle>
                            {{ entry.key }}
                            <VChip
                              :color="entry.expired ? 'error' : 'success'"
                              size="small"
                              class="ml-2"
                            >
                              {{ entry.expired ? 'Expired' : 'Valid' }}
                            </VChip>
                          </VExpansionPanelTitle>
                          <VExpansionPanelText>
                            <div class="mb-2">
                              <strong>Events:</strong> {{ entry.data?.length || 0 }}
                            </div>
                            <div class="mb-2">
                              <strong>Age:</strong> {{ Math.round(entry.age / 1000) }}s
                            </div>
                            <div class="mb-2">
                              <strong>TTL:</strong> {{ formatTTL(entry.ttl) }}
                            </div>
                            <div v-if="entry.data && entry.data.length > 0">
                              <strong>Sample Events (first 3):</strong>
                              <pre class="mt-2" style="max-height: 200px; overflow-y: auto; font-size: 0.75rem;">{{ JSON.stringify(entry.data.slice(0, 3), null, 2) }}</pre>
                            </div>
                          </VExpansionPanelText>
                        </VExpansionPanel>
                      </VExpansionPanels>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      No cached entries
                    </div>
                  </VCardText>
                </VCard>
              </div>

              <VDivider class="my-3" />

              <!-- DriveTime Cache Section -->
              <div>
                <h3 class="text-subtitle-1 font-weight-bold mb-3">DriveTime Cache</h3>

                <VAlert
                  v-if="errors.drivetime"
                  type="error"
                  class="mb-3"
                  density="compact"
                >
                  {{ errors.drivetime }}
                </VAlert>

                <VCard v-if="driveTimeCache" variant="outlined" density="compact">
                  <VCardText>
                    <div class="mb-3">
                      <strong>Cache Stats:</strong>
                      <ul>
                        <li>Total Entries: {{ driveTimeCache.stats?.totalEntries || 0 }}</li>
                        <li>Memory Usage: ~{{ Math.round((driveTimeCache.stats?.memoryUsage || 0) / 1024) }} KB</li>
                        <li v-if="driveTimeCache.stats?.oldestEntryAge !== null">
                          Oldest Entry: {{ driveTimeCache.stats.oldestEntryAge }} minutes old
                        </li>
                      </ul>
                    </div>
                    
                    <div v-if="driveTimeCache.entries && driveTimeCache.entries.length > 0">
                      <strong>Cached Entries ({{ driveTimeCache.entries.length }}):</strong>
                      <VExpansionPanels class="mt-2">
                        <VExpansionPanel
                          v-for="(entry, index) in driveTimeCache.entries"
                          :key="index"
                        >
                          <VExpansionPanelTitle>
                            <span style="font-size: 0.85rem; word-break: break-all;">
                              {{ entry.key.length > 60 ? entry.key.substring(0, 60) + '...' : entry.key }}
                            </span>
                            <VChip
                              :color="entry.expired ? 'error' : 'success'"
                              size="small"
                              class="ml-2"
                            >
                              {{ entry.expired ? 'Expired' : 'Valid' }}
                            </VChip>
                          </VExpansionPanelTitle>
                          <VExpansionPanelText>
                            <div class="mb-2">
                              <strong>Duration:</strong> {{ entry.data.durationMinutes }} min ({{ entry.data.durationSeconds }}s)
                            </div>
                            <div class="mb-2">
                              <strong>Distance:</strong> {{ entry.data.distanceMiles }} miles ({{ entry.data.distanceMeters }}m)
                            </div>
                            <div class="mb-2">
                              <strong>Age:</strong> {{ Math.round(entry.age / 1000) }}s ({{ Math.round(entry.age / 60000) }} min)
                            </div>
                            <div class="mb-2">
                              <strong>TTL:</strong> 24 hours
                            </div>
                            <div>
                              <strong>Full Key:</strong>
                              <pre class="mt-2" style="max-height: 100px; overflow-y: auto; font-size: 0.75rem;">{{ entry.key }}</pre>
                            </div>
                          </VExpansionPanelText>
                        </VExpansionPanel>
                      </VExpansionPanels>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      No cached entries
                    </div>
                  </VCardText>
                </VCard>
              </div>
            </div>
          </VWindowItem>

          <!-- Phase 7: Computed Data Tab -->
          <VWindowItem value="computed">
            <div class="pa-3">
              <div v-if="!computedAvailability" class="text-center pa-4">
                <VIcon size="large" color="warning" class="mb-2">tabler-alert-circle</VIcon>
                <p class="text-body-2">API Orchestrator not available. This tab is only available in the booking wizard.</p>
              </div>
              
              <div v-else>
                <!-- Loading State -->
                <div v-if="computedAvailability.isLoading.value" class="text-center pa-4">
                  <VProgressCircular indeterminate color="primary" />
                  <p class="text-body-2 mt-2">Loading computed availability data...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="computedAvailability.error.value" class="text-center pa-4">
                  <VIcon size="large" color="error" class="mb-2">tabler-alert-circle</VIcon>
                  <p class="text-body-2 text-error">{{ computedAvailability.error.value.message }}</p>
                </div>

                <!-- Computed Data Display -->
                <div v-else>
                  <!-- Constraints Summary -->
                  <div class="mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">Constraints</h3>
                    <VCard variant="outlined" class="pa-2">
                      <div class="d-flex justify-space-between mb-1">
                        <span>Range Constraints:</span>
                        <VChip size="small" color="primary">{{ computedAvailability.rangeConstraints.value.length }}</VChip>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Overlap Constraints:</span>
                        <VChip size="small" color="secondary">{{ computedAvailability.overlapConstraints.value.length }}</VChip>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Capacity Constraints:</span>
                        <VChip size="small" color="info">{{ computedAvailability.capacityConstraints.value.length }}</VChip>
                      </div>
                    </VCard>
                  </div>

                  <!-- Calendar Events -->
                  <div class="mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      Calendar Events
                      <VChip size="small" class="ml-2">{{ computedAvailability.calendarEvents.value.length }}</VChip>
                    </h3>
                    <VCard variant="outlined" class="pa-2" style="max-height: 200px; overflow-y: auto;">
                      <div v-if="computedAvailability.calendarEvents.value.length === 0" class="text-center pa-2 text-caption text-medium-emphasis">
                        No calendar events
                      </div>
                      <div v-else>
                        <div
                          v-for="(event, idx) in computedAvailability.calendarEvents.value.slice(0, 10)"
                          :key="idx"
                          class="mb-2 pa-2"
                          style="border-left: 3px solid rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.05);"
                        >
                          <div class="text-caption font-weight-bold">{{ event.summary || '(No title)' }}</div>
                          <div class="text-caption text-medium-emphasis">
                            {{ formatDateTimeForDisplay(event.start as any) }} - {{ formatTimeForDisplay(event.end as any) }}
                          </div>
                          <div v-if="event.placeId" class="text-caption text-medium-emphasis">
                            📍 Place ID: {{ event.placeId.substring(0, 20) }}...
                          </div>
                          <VChip v-if="(event as SharedCalendarEvent).eventType === 'outOfOffice'" size="x-small" color="warning" class="mt-1">
                            Out of Office
                          </VChip>
                        </div>
                        <div v-if="computedAvailability.calendarEvents.value.length > 10" class="text-center pa-2 text-caption text-medium-emphasis">
                          ... and {{ computedAvailability.calendarEvents.value.length - 10 }} more
                        </div>
                      </div>
                    </VCard>
                  </div>

                  <!-- Out-of-Office Events -->
                  <div class="mb-4" v-if="computedAvailability.calendarEvents.value.some((e: SharedCalendarEvent) => e.eventType === 'outOfOffice')">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      Out-of-Office Events
                      <VChip size="small" color="warning" class="ml-2">
                        {{ computedAvailability.calendarEvents.value.filter((e: SharedCalendarEvent) => e.eventType === 'outOfOffice').length }}
                      </VChip>
                    </h3>
                    <VCard variant="outlined" class="pa-2" style="max-height: 150px; overflow-y: auto;">
                      <div
                        v-for="(event, idx) in computedAvailability.calendarEvents.value.filter((e: SharedCalendarEvent) => e.eventType === 'outOfOffice')"
                        :key="idx"
                        class="mb-2 pa-2"
                        style="border-left: 3px solid rgb(var(--v-theme-warning)); background: rgba(var(--v-theme-warning), 0.05);"
                      >
                        <div class="text-caption font-weight-bold">{{ event.summary || '(No title)' }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDateTimeForDisplay(event.start as any) }} - {{ formatTimeForDisplay(event.end as any) }}
                        </div>
                      </div>
                    </VCard>
                  </div>

                  <!-- Busy Periods -->
                  <div class="mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      Busy Periods
                      <VChip size="small" class="ml-2">{{ computedAvailability.busyTimes.value.length }}</VChip>
                    </h3>
                    <VCard variant="outlined" class="pa-2" style="max-height: 200px; overflow-y: auto;">
                      <div v-if="computedAvailability.busyTimes.value.length === 0" class="text-center pa-2 text-caption text-medium-emphasis">
                        No busy periods
                      </div>
                      <div v-else>
                        <div
                          v-for="(period, idx) in computedAvailability.busyTimes.value.slice(0, 10)"
                          :key="idx"
                          class="mb-1 text-caption"
                        >
                          {{ formatBusyPeriod(period) }}
                        </div>
                        <div v-if="computedAvailability.busyTimes.value.length > 10" class="text-center pa-2 text-caption text-medium-emphasis">
                          ... and {{ computedAvailability.busyTimes.value.length - 10 }} more
                        </div>
                      </div>
                    </VCard>
                  </div>

                  <!-- Drive Times -->
                  <div class="mb-4" v-if="Object.keys(computedAvailability.driveTimesByDate.value).length > 0">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      Pre-computed Drive Times
                      <VChip size="small" class="ml-2">{{ Object.keys(computedAvailability.driveTimesByDate.value).length }} dates</VChip>
                    </h3>
                    <VCard variant="outlined" class="pa-2" style="max-height: 150px; overflow-y: auto;">
                      <div
                        v-for="(driveTimes, date) in computedAvailability.driveTimesByDate.value"
                        :key="date"
                        class="mb-1 text-caption"
                      >
                        <strong>{{ date }}:</strong>
                        <span v-if="driveTimes.driveTimeTo"> To: {{ driveTimes.driveTimeTo }}min</span>
                        <span v-if="driveTimes.driveTimeFrom"> From: {{ driveTimes.driveTimeFrom }}min</span>
                      </div>
                    </VCard>
                  </div>

                  <!-- Capacity Hours -->
                  <div class="mb-4" v-if="Object.keys(computedAvailability.scheduledHoursByKey.value).length > 0">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">
                      Pre-computed Capacity Hours
                      <VChip size="small" class="ml-2">{{ Object.keys(computedAvailability.scheduledHoursByKey.value).length }} keys</VChip>
                    </h3>
                    <VCard variant="outlined" class="pa-2" style="max-height: 150px; overflow-y: auto;">
                      <div
                        v-for="(hours, key) in computedAvailability.scheduledHoursByKey.value"
                        :key="key"
                        class="mb-1 text-caption"
                      >
                        <strong>{{ key }}:</strong> {{ hours.toFixed(2) }} hours
                      </div>
                    </VCard>
                  </div>
                </div>
              </div>
            </div>
          </VWindowItem>
        </VWindow>
      </VCardText>

      <VCardActions class="pa-3">
        <VBtn
          size="small"
          variant="outlined"
          @click="fetchAll"
        >
          Refresh All
        </VBtn>
        <VSpacer />
        <VBtn
          size="small"
          variant="text"
          @click="emit('close')"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </Teleport>
</template>

<style scoped lang="scss">
.api-dev-panel {
  position: fixed;
  bottom: 80px; /* Above FAB button */
  right: 24px;
  width: 450px;
  max-width: calc(100vw - 48px);
  max-height: 60vh;
  overflow: auto;
  z-index: 1001; /* Higher than slot panel to appear on top */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 2px dashed rgb(var(--v-theme-error));
  background-color: rgb(var(--v-theme-surface)) !important;
  opacity: 1 !important;
  
  :deep(*) {
    background-color: transparent;
  }
  
  :deep(.v-card-text),
  :deep(.v-window-item) {
    background-color: rgb(var(--v-theme-surface));
  }
  
  @media (max-width: 960px) {
    right: 12px;
    left: 12px;
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }
}

// Flexible and responsive tab spacing
:deep(.flexible-tabs) {
  .v-tab {
    min-width: auto;
    flex: 0 1 auto;
    padding: 0 8px !important;
    margin: 0 1px !important;
    white-space: nowrap;
  }
  
  .v-tabs__wrapper {
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .v-tabs__container {
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  // Responsive spacing - tighter on smaller screens
  @media (max-width: 600px) {
    .v-tab {
      padding: 0 6px !important;
      margin: 0 !important;
      font-size: 0.75rem;
      
      .v-icon {
        margin-right: 4px !important;
      }
    }
  }
  
  // More space on larger screens
  @media (min-width: 960px) {
    .v-tab {
      padding: 0 12px !important;
      margin: 0 2px !important;
    }
  }
}

pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
}
</style>
