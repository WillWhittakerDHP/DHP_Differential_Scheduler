<script setup lang="ts">
/**
 * API Dev Panel Computed Tab Component
 * 
 * LEARNING: Extracted Computed Data tab content from ApiDevPanel
 * WHY: Reduces main component complexity and file size
 * PATTERN: Sub-component with props for computed availability data
 */

import { computed } from 'vue'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import type { CalendarEvent as SharedCalendarEvent } from '@shared/types/availabilityTypes'
import type { RFC3339DateTime } from '@/types/datetime'

interface Props {
  computedAvailability: UseComputedAvailabilityReturn | null
  formatDateTimeForDisplay: (date: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
  formatTimeForDisplay: (date: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
}

const props = defineProps<Props>()

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

// Slots by day summary (server-computed slots cache)
const slotsByDaySummary = computed(() => {
  if (!props.computedAvailability) return { dayCount: 0, totalSlots: 0, sample: [] as [string, number][] }
  const map = props.computedAvailability.slotsByDay.value
  let totalSlots = 0
  const sample: [string, number][] = []
  let count = 0
  for (const [day, slots] of map) {
    totalSlots += slots.length
    if (count < 10) {
      sample.push([day, slots.length])
      count++
    }
  }
  return { dayCount: map.size, totalSlots, sample }
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

        <!-- Slots by day (server-computed) -->
        <div class="mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            Slots by day
            <VChip size="small" class="ml-2">{{ slotsByDaySummary.dayCount }} days</VChip>
            <VChip size="small" class="ml-2">{{ slotsByDaySummary.totalSlots }} total slots</VChip>
          </h3>
          <VCard variant="outlined" class="pa-2" style="max-height: 200px; overflow-y: auto;">
            <div v-if="slotsByDaySummary.dayCount === 0" class="text-center pa-2 text-caption text-medium-emphasis">
              No slots cached yet
            </div>
            <div v-else>
              <div
                v-for="([day, count], idx) in slotsByDaySummary.sample"
                :key="idx"
                class="mb-1 text-caption"
              >
                {{ day }}: {{ count }} slots
              </div>
              <div v-if="slotsByDaySummary.dayCount > 10" class="text-center pa-2 text-caption text-medium-emphasis">
                ... and {{ slotsByDaySummary.dayCount - 10 }} more days
              </div>
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
