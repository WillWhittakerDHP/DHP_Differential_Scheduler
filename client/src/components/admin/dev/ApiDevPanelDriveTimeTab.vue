<script setup lang="ts">
/**
 * API Dev Panel DriveTime Tab Component
 * 
 * LEARNING: Extracted DriveTime tab content from ApiDevPanel
 * WHY: Reduces main component complexity and file size
 * PATTERN: Sub-component with props for data and handlers
 */

import { formatTTL } from '@/utils/dev/formatDevPanelData'
import type { DevPanelCacheShape, DevPanelCacheEntry } from '@/composables/dev/useApiDevPanelData'

function driveTimeEntryData(entry: DevPanelCacheEntry): Record<string, unknown> | undefined {
  return entry.data as Record<string, unknown> | undefined
}

function eventsEntryData(entry: DevPanelCacheEntry): unknown[] | undefined {
  return Array.isArray(entry.data) ? entry.data : undefined
}

interface Props {
  eventsCache: DevPanelCacheShape | null
  driveTimeCache: DevPanelCacheShape | null
  loading: {
    events: boolean
    drivetime: boolean
  }
  errors: {
    events: string | null
    drivetime: string | null
  }
  onRefreshEvents: () => void
  onRefreshDriveTime: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="pa-3">
    <!-- Data Source Toggle -->
    <div class="mb-4">
      <!-- Phase 8: Drive time data source toggle removed - now controlled server-side -->
      <div class="d-flex gap-2 mb-2">
        <VBtn
          variant="outlined"
          size="small"
          :loading="loading.events"
          @click="onRefreshEvents"
        >
          Refresh Events Cache
        </VBtn>
        <VBtn
          variant="outlined"
          size="small"
          :loading="loading.drivetime"
          @click="onRefreshDriveTime"
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
                    <strong>Events:</strong> {{ eventsEntryData(entry)?.length ?? 0 }}
                  </div>
                  <div class="mb-2">
                    <strong>Age:</strong> {{ Math.round((entry.age ?? 0) / 1000) }}s
                  </div>
                  <div class="mb-2">
                    <strong>TTL:</strong> {{ formatTTL(entry.ttl ?? 0) }}
                  </div>
                  <div v-if="eventsEntryData(entry) && eventsEntryData(entry)!.length > 0">
                    <strong>Sample Events (first 3):</strong>
                    <pre class="mt-2" style="max-height: 200px; overflow-y: auto; font-size: 0.75rem;">{{ JSON.stringify(eventsEntryData(entry)!.slice(0, 3), null, 2) }}</pre>
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
              <li v-if="driveTimeCache.stats?.oldestEntryAge != null">
                Oldest Entry: {{ driveTimeCache.stats?.oldestEntryAge }} minutes old
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
                    <strong>Duration:</strong> {{ driveTimeEntryData(entry)?.durationMinutes }} min ({{ driveTimeEntryData(entry)?.durationSeconds }}s)
                  </div>
                  <div class="mb-2">
                    <strong>Distance:</strong> {{ driveTimeEntryData(entry)?.distanceMiles }} miles ({{ driveTimeEntryData(entry)?.distanceMeters }}m)
                  </div>
                  <div class="mb-2">
                    <strong>Age:</strong> {{ Math.round((entry.age ?? 0) / 1000) }}s ({{ Math.round((entry.age ?? 0) / 60000) }} min)
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
</template>
