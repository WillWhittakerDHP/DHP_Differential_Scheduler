<script setup lang="ts">
/**
 * API Dev Panel Component
 * 
 * LEARNING: Dev mode panel for viewing API status, caches, and live data
 * WHY: Provides visibility into OAuth, rate limits, API calls, and cached responses for debugging
 * PATTERN: Tabbed interface matching slot dev panel styling, unified API debugging
 * 
 * REFACTORED: Extracted sub-components, composables, and utilities to reduce complexity
 */

import { ref, watch, inject } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import { useLocalTime } from '@/composables/useLocalTime'
import { useDevPanelTabs } from '@/composables/dev/useDevPanelTabs'
import { useApiDevPanelData } from '@/composables/dev/useApiDevPanelData'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import DevPanelButtons from '@/components/dev/DevPanelButtons.vue'
import ApiDevPanelStatusTab from './ApiDevPanelStatusTab.vue'
import ApiDevPanelDriveTimeTab from './ApiDevPanelDriveTimeTab.vue'
import ApiDevPanelComputedTab from './ApiDevPanelComputedTab.vue'

import type { DevPanelVisibleProps } from './devPanelTypes'

type Props = DevPanelVisibleProps

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const panelRef = ref<HTMLElement | null>(null)
void panelRef.value // ref used by template

// Phase 7: Inject computed availability data for display
const computedAvailability = inject<UseComputedAvailabilityReturn | null>('computedAvailability', null)

// API base URL for external routes
// LEARNING: Fixed deprecation pattern - use nullish coalescing instead of ||
// WHY: Addresses deprecation audit finding
const rawApiBase = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = rawApiBase !== undefined && rawApiBase !== null && rawApiBase !== '' ? rawApiBase : ''

// API status tracking from shared state
const { apiStatus } = useApiCallStatus()

// Local time formatting
const { formatDateTimeForDisplay, formatTimeForDisplay } = useLocalTime()

// Tab management
const { activeTab } = useDevPanelTabs()

// API data management
const {
  oauthStatus,
  eventsCache,
  rateLimitStats,
  driveTimeCache,
  loading,
  errors,
  fetchDevStatus,
  fetchEventsCache,
  fetchDriveTimeCache,
  fetchAll,
} = useApiDevPanelData(API_BASE_URL)

// Fetch dev status only when panel becomes visible (not on mount)
// WHY: Prevents unnecessary API calls when panel is hidden, improves page load performance
watch(() => props.visible, (isVisible) => {
  if (isVisible && isDevMode) {
    // Only fetch if data hasn't been loaded yet (lazy loading)
    if (!oauthStatus.value && !rateLimitStats.value.calendar && !rateLimitStats.value.maps) {
      fetchDevStatus()
    }
  }
}, { immediate: false })
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
      <DevPanelButtons />

      <VCardText class="pa-0">
        <!-- Tab Navigation -->
        <VTabs v-model="activeTab" density="compact" color="info" class="flexible-tabs px-3">
          <VTab value="status">
            <VIcon size="small" class="mr-2">tabler-api</VIcon>
            Status
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
            <ApiDevPanelStatusTab
              :oauth-status="oauthStatus"
              :rate-limit-stats="rateLimitStats"
              :api-status="apiStatus"
              :loading="loading"
              :errors="errors"
              :on-refresh="fetchDevStatus"
            />
          </VWindowItem>

          <!-- DriveTime Tab -->
          <VWindowItem value="drivetime">
            <ApiDevPanelDriveTimeTab
              :events-cache="eventsCache"
              :drive-time-cache="driveTimeCache"
              :loading="loading"
              :errors="errors"
              :on-refresh-events="fetchEventsCache"
              :on-refresh-drive-time="fetchDriveTimeCache"
            />
          </VWindowItem>

          <!-- Computed Data Tab -->
          <VWindowItem value="computed">
            <ApiDevPanelComputedTab
              :computed-availability="computedAvailability"
              :format-date-time-for-display="formatDateTimeForDisplay"
              :format-time-for-display="formatTimeForDisplay"
            />
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

<style scoped lang="scss" src="./ApiDevPanel.scss"></style>
