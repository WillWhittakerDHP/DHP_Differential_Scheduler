<script setup lang="ts">
/**
 * Calendar Mock Dev Panel Component
 * 
 * LEARNING: Dev mode UI for viewing mock Google Calendar busy periods
 * WHY: Enables developers to see what dates/times are blocked and understand slot filtering
 * PATTERN: Collapsible panel with busy period display, following BookingWizard dev mode pattern
 * 
 * This component is only visible in dev mode and provides:
 * - Visual display of blocked time periods
 * - Summary statistics (total blocked periods, total blocked time)
 * - Formatted time display for easy reading
 */

import { computed, ref } from 'vue'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'
import { usePanelPosition } from '@/composables/booking/dev/usePanelPosition'

interface Props {
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime } | null
  refreshKey?: number | string
  busyPeriods?: BusyTimeRange[]  // Optional: if provided, use these instead of generating from dateRange
}

const props = defineProps<Props>()
const isDevMode = isDevModeEnabled()
const isExpanded = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

// LEARNING: Use panel position composable for DOM operations
// WHY: Extracts DOM manipulation logic from component to composable
// PATTERN: Composable handles all panel positioning concerns
const {
  panelTransform,
  isTransitioning,
  handleToggle: handlePanelToggle
} = usePanelPosition({
  wrapperRef,
  panelRef,
  isExpanded,
  expectedPanelWidth: 400
})

// LEARNING: Use useLocalTime composable for UI-boundary formatting
// WHY: All local time conversions must go through useLocalTime composable
const { formatDateTimeForDisplay, formatTimeForDisplay } = useLocalTime()

// LEARNING: Get current busy periods from mock calendar
// WHY: Shows what times are blocked for testing slot filtering
// PATTERN: Use provided busyPeriods if available, otherwise generate from dateRange
// WHY: Ensures mock panel shows exactly the same busy periods used by slot generation
const busyPeriods = computed(() => {
  // LEARNING: If busyPeriods prop is provided, use it directly
  // WHY: Ensures mock panel shows exactly what slot generation uses
  // PATTERN: Prefer prop over generated values for consistency
  if (props.busyPeriods && props.busyPeriods.length > 0) {
    return props.busyPeriods
  }
  
  // LEARNING: Fall back to generating from dateRange if no busyPeriods provided
  // WHY: Maintains backward compatibility
  // PATTERN: Generate busy periods from dateRange when prop not provided
  if (!props.dateRange) {
    return []
  }
  
  // LEARNING: Include refreshKey in dependency to force recalculation
  // WHY: Changing refreshKey forces mock data regeneration
  // PATTERN: Reference refreshKey in computed to trigger recalculation
  void props.refreshKey // Force dependency tracking
  
  const result = getCalendarAvailability(props.dateRange)
  
  return result
})

// LEARNING: Format busy period for human-readable display
// WHY: Makes it easy to see what times are blocked at a glance
// PATTERN: Use composable for UI-boundary formatting
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

// LEARNING: Calculate total blocked time across all periods
// WHY: Provides summary metric for understanding how much time is blocked
// PATTERN: Sum durations of all busy periods
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

// LEARNING: Handle expansion toggle click
// WHY: Delegates to composable for positioning logic, then updates local state
// PATTERN: Call composable handleToggle, then update isExpanded
const handleToggle = async (): Promise<void> => {
  const willExpand = !isExpanded.value
  await handlePanelToggle(willExpand)
  isExpanded.value = willExpand
}
</script>

<template>
  <div ref="wrapperRef" class="calendar-mock-dev-panel-wrapper-inner">
    <VCard
      v-if="isDevMode"
      ref="panelRef"
      class="calendar-mock-dev-panel"
      :class="{ 'calendar-mock-dev-panel--expanded': isExpanded }"
      :style="{ 
        transform: panelTransform,
        transition: isTransitioning ? 'none' : 'transform 0.3s ease'
      }"
      variant="outlined"
      color="warning"
    >
      <VCardTitle
        class="d-flex align-center justify-space-between cursor-pointer pa-2"
        @click="handleToggle"
      >
      <div class="d-flex align-center">
        <VIcon class="mr-2" size="small" color="warning">tabler-calendar-off</VIcon>
        <span class="text-caption">Mock Calendar (Dev)</span>
      </div>
      <VIcon size="small">{{ isExpanded ? 'tabler-chevron-up' : 'tabler-chevron-down' }}</VIcon>
    </VCardTitle>

    <VExpandTransition>
      <VCardText v-if="isExpanded" class="calendar-mock-dev-panel-content">
        <div v-if="!dateRange" class="text-body-2 text-medium-emphasis mb-4">
          Select a date to see mock calendar busy periods
        </div>

        <template v-else>
          <!-- LEARNING: Summary Statistics -->
          <!-- WHY: Quick overview of blocked time -->
          <!-- PATTERN: Display key metrics in cards -->
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

          <!-- LEARNING: Busy Periods List -->
          <!-- WHY: Shows exactly what times are blocked -->
          <!-- PATTERN: List display with formatted times and icons -->
          <div v-if="busyPeriods.length === 0" class="text-body-2 text-medium-emphasis mb-4">
            No busy periods generated for this date range
          </div>

          <VList v-else density="compact">
            <VListSubheader>Blocked Time Periods</VListSubheader>
            <VListItem
              v-for="(period, index) in busyPeriods"
              :key="index"
              :title="formatBusyPeriod(period)"
              prepend-icon="tabler-clock-x"
              color="warning"
            >
              <template #subtitle>
                <span class="text-caption">
                  {{ new Date(period.start).toISOString() }} → 
                  {{ new Date(period.end).toISOString() }}
                </span>
              </template>
            </VListItem>
          </VList>

          <!-- LEARNING: Info Message -->
          <!-- WHY: Explains that busy periods are randomly generated -->
          <!-- PATTERN: Alert component for informational messages -->
          <VAlert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <template #prepend>
              <VIcon>tabler-info-circle</VIcon>
            </template>
            <div class="text-caption">
              Busy periods are randomly generated each time slots are calculated. 
              Change the selected date or modify service selections to regenerate.
            </div>
          </VAlert>
        </template>
      </VCardText>
    </VExpandTransition>
  </VCard>
  </div>
</template>

<style scoped lang="scss">
.calendar-mock-dev-panel {
  border: 2px dashed rgb(var(--v-theme-warning));
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  background-color: rgb(var(--v-theme-surface)) !important;
  opacity: 1 !important;
}

.calendar-mock-dev-panel--expanded {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  z-index: 100;
  min-width: 350px;
  width: 400px;
  max-width: min(500px, calc(100vw - 48px));
  max-height: 70vh;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background-color: rgb(var(--v-theme-surface)) !important;
  opacity: 1 !important;
  transition: box-shadow 0.3s ease;
  
  /* LEARNING: Prevent panel from going off-screen */
  /* WHY: Ensures panel stays visible when expanded */
  /* PATTERN: Use transform to shift left if panel would overflow right edge */
  /* Transform transition is controlled by JavaScript to prevent hops */
}

.calendar-mock-dev-panel-content {
  max-height: calc(70vh - 100px);
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 960px) {
  .calendar-mock-dev-panel--expanded {
    right: 0;
    left: 0;
    min-width: auto;
    max-width: calc(100vw - 32px);
    width: calc(100vw - 32px);
  }
}
</style>
