<script setup lang="ts">
/**
 * Admin API Dev Panel Component
 * 
 * LEARNING: Dev mode panel for viewing cached Google Calendar API responses
 * WHY: Provides visibility into cache state, rate limiter, and OAuth status for debugging
 * PATTERN: Tabbed interface similar to booking wizard dev panel, but for admin API debugging
 */

import { ref, computed, watch, onMounted } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import axios from 'axios'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const activeTab = ref<'oauth' | 'freebusy' | 'events' | 'ratelimit' | 'drivetime'>('oauth')
const panelRef = ref<HTMLElement | null>(null)

// API data state
const oauthStatus = ref<any>(null)
const freeBusyCache = ref<any>(null)
const eventsCache = ref<any>(null)
const rateLimitStats = ref<any>(null)
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

// API base URL for external routes
// LEARNING: Use relative path to go through Vite proxy (configured in vite.config.ts)
// WHY: Proxy handles CORS and routing to backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
  } catch (error: any) {
    errors.value.events = error.response?.data?.message || error.message || 'Failed to fetch events cache'
    console.error('[ApiDevPanel] Error fetching events cache:', error)
  } finally {
    loading.value.events = false
  }
}

/**
 * Fetch rate limit stats
 */
async function fetchRateLimitStats() {
  loading.value.ratelimit = true
  errors.value.ratelimit = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/external/calendar/debug/rate-limit`)
    rateLimitStats.value = response.data
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

// Fetch data when tab changes
const activeTabWatcher = computed(() => activeTab.value)
watch(activeTabWatcher, (newTab) => {
  switch (newTab) {
    case 'oauth':
      if (!oauthStatus.value) fetchOAuthStatus()
      break
    case 'freebusy':
      if (!freeBusyCache.value) fetchFreeBusyCache()
      break
    case 'events':
      if (!eventsCache.value) fetchEventsCache()
      break
    case 'ratelimit':
      if (!rateLimitStats.value) fetchRateLimitStats()
      break
    case 'drivetime':
      if (!driveTimeCache.value) fetchDriveTimeCache()
      break
  }
})

// Fetch OAuth status on mount
onMounted(() => {
  if (isDevMode) {
    fetchOAuthStatus()
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
</script>

<template>
  <Teleport to="body">
    <VCard
      v-if="isDevMode && visible"
      ref="panelRef"
      class="api-dev-panel"
      style="position: fixed; top: 80px; right: 20px; width: 600px; max-height: 80vh; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
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

      <VCardText class="pa-0">
        <!-- Tab Navigation -->
        <VTabs v-model="activeTab" class="px-3">
          <VTab value="oauth">OAuth Status</VTab>
          <VTab value="freebusy">Free-Busy Cache</VTab>
          <VTab value="events">Events Cache</VTab>
          <VTab value="ratelimit">Rate Limiter</VTab>
          <VTab value="drivetime">Drive Time Cache</VTab>
        </VTabs>

        <!-- Tab Content -->
        <VWindow v-model="activeTab" class="pa-3" style="max-height: 60vh; overflow-y: auto;">
          <!-- OAuth Status Tab -->
          <VWindowItem value="oauth">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">OAuth Status</h3>
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
            >
              {{ errors.oauth }}
            </VAlert>

            <VCard v-if="oauthStatus" variant="outlined">
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
          </VWindowItem>

          <!-- Free-Busy Cache Tab -->
          <VWindowItem value="freebusy">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">Free-Busy Cache</h3>
              <VBtn
                size="small"
                :loading="loading.freebusy"
                @click="fetchFreeBusyCache"
              >
                Refresh
              </VBtn>
            </div>

            <VAlert
              v-if="errors.freebusy"
              type="error"
              class="mb-3"
            >
              {{ errors.freebusy }}
            </VAlert>

            <VCard v-if="freeBusyCache" variant="outlined">
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
          </VWindowItem>

          <!-- Events Cache Tab -->
          <VWindowItem value="events">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">Events Cache</h3>
              <VBtn
                size="small"
                :loading="loading.events"
                @click="fetchEventsCache"
              >
                Refresh
              </VBtn>
            </div>

            <VAlert
              v-if="errors.events"
              type="error"
              class="mb-3"
            >
              {{ errors.events }}
            </VAlert>

            <VCard v-if="eventsCache" variant="outlined">
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
          </VWindowItem>

          <!-- Rate Limiter Tab -->
          <VWindowItem value="ratelimit">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">Rate Limiter</h3>
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
            >
              {{ errors.ratelimit }}
            </VAlert>

            <VCard v-if="rateLimitStats" variant="outlined">
              <VCardText>
                <div class="mb-2">
                  <strong>API:</strong> {{ rateLimitStats.apiName }}
                </div>
                <div class="mb-2">
                  <strong>Limit:</strong> {{ rateLimitStats.requestsPerMinute }} requests/minute
                </div>
                <div class="mb-2">
                  <strong>Current Requests:</strong> {{ rateLimitStats.currentRequests }}
                </div>
                <div class="mb-2">
                  <strong>Remaining:</strong> {{ rateLimitStats.remainingRequests }}
                </div>
                <div class="mb-2">
                  <strong>Utilization:</strong> 
                  <VProgressLinear
                    :model-value="rateLimitStats.utilizationPercent"
                    :color="rateLimitStats.utilizationPercent > 80 ? 'error' : rateLimitStats.utilizationPercent > 60 ? 'warning' : 'success'"
                    height="20"
                    class="mt-1"
                  >
                    {{ Math.round(rateLimitStats.utilizationPercent) }}%
                  </VProgressLinear>
                </div>
              </VCardText>
            </VCard>
          </VWindowItem>

          <!-- Drive Time Cache Tab -->
          <VWindowItem value="drivetime">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6">Drive Time Cache</h3>
              <VBtn
                size="small"
                :loading="loading.drivetime"
                @click="fetchDriveTimeCache"
              >
                Refresh
              </VBtn>
            </div>

            <VAlert
              v-if="errors.drivetime"
              type="error"
              class="mb-3"
            >
              {{ errors.drivetime }}
            </VAlert>

            <VCard v-if="driveTimeCache" variant="outlined">
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

<style scoped>
.api-dev-panel {
  font-family: 'Roboto Mono', monospace;
}

pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
