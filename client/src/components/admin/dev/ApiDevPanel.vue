<script setup lang="ts">

import { ref, inject } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import { useLocalTime } from '@/utils/time/localTime'
import { useDevPanelTabs } from '@/composables/dev/useDevPanelTabs'
import { useApiDevPanelData } from '@/composables/dev/useApiDevPanelData'
import { useApiDevPanelVisibility } from '@/composables/admin/useApiDevPanelVisibility'
import { computedAvailabilityKey } from '@/keys/bookingInjectionKeys'
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

const computedAvailability = inject(computedAvailabilityKey, null)

const rawApiBase = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = rawApiBase !== undefined && rawApiBase !== null && rawApiBase !== '' ? rawApiBase : ''

const { apiStatus } = useApiCallStatus()

const { formatDateTimeForDisplay, formatTimeForDisplay } = useLocalTime()

const { activeTab } = useDevPanelTabs()

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

useApiDevPanelVisibility({
  visible: () => props.visible,
  isDevMode,
  shouldFetch: () => !oauthStatus.value && !rateLimitStats.value.calendar && !rateLimitStats.value.maps,
  fetch: fetchDevStatus,
})
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
        <span class="text-headline-small">API Dev Panel</span>
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
