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

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import { isDevModeEnabled } from '@/utils/env/devMode'

interface Props {
  dateRange: { start: string; end: string } | null
}

const props = defineProps<Props>()
const isDevMode = isDevModeEnabled()
const isExpanded = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

// LEARNING: Get current busy periods from mock calendar
// WHY: Shows what times are blocked for testing slot filtering
// PATTERN: Computed property that calls getCalendarAvailability when dateRange changes
const busyPeriods = computed(() => {
  if (!props.dateRange) return []
  return getCalendarAvailability(props.dateRange)
})

// LEARNING: Format busy period for human-readable display
// WHY: Makes it easy to see what times are blocked at a glance
// PATTERN: Convert ISO timestamps to localized time strings with duration
const formatBusyPeriod = (period: { start: string; end: string }): string => {
  const start = new Date(period.start)
  const end = new Date(period.end)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  
  const startStr = start.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  const endStr = end.toLocaleTimeString('en-US', {
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

// LEARNING: Calculate panel position to prevent overflow
// WHY: Ensures panel stays within viewport when expanded
// PATTERN: Check if panel would overflow right edge, adjust transform
const panelTransform = ref('translateX(0)')

const updatePanelPosition = (): void => {
  if (!isExpanded.value || !panelRef.value || !wrapperRef.value) {
    return
  }

  // LEARNING: Wait for DOM to update before calculating
  // WHY: Panel dimensions may not be available immediately
  // PATTERN: Use requestAnimationFrame for accurate measurements
  requestAnimationFrame(() => {
    if (!panelRef.value || !wrapperRef.value) return

    const wrapperRect = wrapperRef.value.getBoundingClientRect()
    const panelWidth = panelRef.value.offsetWidth || 400
    const viewportWidth = window.innerWidth
    const rightEdge = wrapperRect.right + panelWidth
    const padding = 24 // Viewport padding

    // LEARNING: If panel would overflow right edge, shift it left
    // WHY: Keeps panel visible when expanded
    // PATTERN: Calculate transform to shift left if needed
    if (rightEdge > viewportWidth - padding) {
      const overflow = rightEdge - (viewportWidth - padding)
      panelTransform.value = `translateX(-${overflow}px)`
    } else {
      panelTransform.value = 'translateX(0)'
    }
  })
}

// LEARNING: Watch for expansion changes and window resize
// WHY: Recalculate position when panel expands or window resizes
// PATTERN: Watch isExpanded and window resize events
const handleResize = (): void => {
  if (isExpanded.value) {
    updatePanelPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// LEARNING: Update position when expansion state changes
// WHY: Recalculate position when panel expands/collapses
// PATTERN: Watch isExpanded and call update function after transition
const handleExpansionChange = (): void => {
  if (isExpanded.value) {
    // LEARNING: Wait for expand transition to complete before calculating
    // WHY: Panel dimensions are accurate after transition
    // PATTERN: Use setTimeout to wait for VExpandTransition (300ms)
    setTimeout(() => {
      updatePanelPosition()
    }, 350)
  } else {
    panelTransform.value = 'translateX(0)'
  }
}
</script>

<template>
  <div ref="wrapperRef" class="calendar-mock-dev-panel-wrapper-inner">
    <VCard
      v-if="isDevMode"
      ref="panelRef"
      class="calendar-mock-dev-panel"
      :class="{ 'calendar-mock-dev-panel--expanded': isExpanded }"
      :style="{ transform: isExpanded ? panelTransform : 'none' }"
      variant="outlined"
      color="warning"
    >
      <VCardTitle
        class="d-flex align-center justify-space-between cursor-pointer pa-2"
        @click="() => { isExpanded = !isExpanded; handleExpansionChange() }"
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
  background-color: rgb(var(--v-theme-surface));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  /* LEARNING: Prevent panel from going off-screen */
  /* WHY: Ensures panel stays visible when expanded */
  /* PATTERN: Use transform to shift left if panel would overflow right edge */
  /* The JavaScript will calculate and apply the transform */
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
