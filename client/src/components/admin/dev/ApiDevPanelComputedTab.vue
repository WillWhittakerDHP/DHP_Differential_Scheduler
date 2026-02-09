<script setup lang="ts">
/**
 * API Dev Panel Computed Tab Component
 * 
 * LEARNING: Extracted Computed Data tab content from ApiDevPanel
 * WHY: Reduces main component complexity and file size
 * PATTERN: Sub-component with props for computed availability data
 */

import { computed } from 'vue'
import { formatBusyPeriod } from '@/utils/dev/formatDevPanelData'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { CalendarEvent as SharedCalendarEvent } from '@shared/types/availabilityTypes'

interface Props {
  computedAvailability: UseComputedAvailabilityReturn | null
  formatDateTimeForDisplay: (date: any, options?: any) => string
  formatTimeForDisplay: (date: any, options?: any) => string
}

const props = defineProps<Props>()

function formatBusyPeriodLocal(period: { start: any; end: any }): string {
  return formatBusyPeriod(period, props.formatDateTimeForDisplay, props.formatTimeForDisplay)
}

// Extract scheduled hours from enriched capacity constraints (grouped by key)
const scheduledHoursByKey = computed(() => {
  if (!props.computedAvailability) return {}
  
  const result: Record<string, number> = {}
  for (const constraint of props.computedAvailability.constraints.value) {
    if (constraint.category === 'capacity' && constraint.scheduledHours) {
      for (const [key, hours] of Object.entries(constraint.scheduledHours)) {
        result[key] = hours
      }
    }
  }
  return result
})

// Extract drive times from busy periods (grouped by placeId)
const driveTimesByPlaceId = computed(() => {
  if (!props.computedAvailability) return {}
  
  const result: Record<string, { driveTimeTo?: number; driveTimeFrom?: number }> = {}
  
  for (const busy of props.computedAvailability.busyTimes.value) {
    if (!busy.placeId) continue
    if (busy.driveTimeTo === undefined && busy.driveTimeFrom === undefined) continue
    
    // Use first occurrence's drive times per placeId (they should all be the same)
    if (!result[busy.placeId]) {
      result[busy.placeId] = {
        driveTimeTo: busy.driveTimeTo,
        driveTimeFrom: busy.driveTimeFrom,
      }
    }
  }
  
  return result
})
</script>

<template>
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
            <div class="d-flex justify-space-between">
              <span>Total Constraints:</span>
              <VChip size="small" color="primary">{{ computedAvailability.constraints.value.length }}</VChip>
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
                {{ formatBusyPeriodLocal(period) }}
              </div>
              <div v-if="computedAvailability.busyTimes.value.length > 10" class="text-center pa-2 text-caption text-medium-emphasis">
                ... and {{ computedAvailability.busyTimes.value.length - 10 }} more
              </div>
            </div>
          </VCard>
        </div>

        <!-- Drive Times -->
        <div class="mb-4" v-if="Object.keys(driveTimesByPlaceId).length > 0">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            Pre-computed Drive Times
            <VChip size="small" class="ml-2">{{ Object.keys(driveTimesByPlaceId).length }} placeIds</VChip>
          </h3>
          <VCard variant="outlined" class="pa-2" style="max-height: 150px; overflow-y: auto;">
            <div
              v-for="(driveTimes, placeId) in driveTimesByPlaceId"
              :key="placeId"
              class="mb-1 text-caption"
            >
              <strong>{{ placeId }}:</strong>
              <span v-if="driveTimes.driveTimeTo"> To: {{ driveTimes.driveTimeTo }}min</span>
              <span v-if="driveTimes.driveTimeFrom"> From: {{ driveTimes.driveTimeFrom }}min</span>
            </div>
          </VCard>
        </div>

        <!-- Capacity Hours (extracted from enriched constraints) -->
        <div class="mb-4" v-if="Object.keys(scheduledHoursByKey).length > 0">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            Scheduled Hours (from Capacity Constraints)
            <VChip size="small" class="ml-2">{{ Object.keys(scheduledHoursByKey).length }} keys</VChip>
          </h3>
          <VCard variant="outlined" class="pa-2" style="max-height: 150px; overflow-y: auto;">
            <div
              v-for="(hours, key) in scheduledHoursByKey"
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
</template>
