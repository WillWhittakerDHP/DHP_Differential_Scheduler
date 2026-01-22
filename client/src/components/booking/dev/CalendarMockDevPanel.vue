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

import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'

interface Props {
  dateRange: { start: string; end: string } | null
  refreshKey?: number | string
  busyPeriods?: BusyTimeRange[]  // Optional: if provided, use these instead of generating from dateRange
}

const props = defineProps<Props>()
const isDevMode = isDevModeEnabled()
const isExpanded = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

// LEARNING: Get current busy periods from mock calendar
// WHY: Shows what times are blocked for testing slot filtering
// PATTERN: Use provided busyPeriods if available, otherwise generate from dateRange
// WHY: Ensures mock panel shows exactly the same busy periods used by slot generation
const busyPeriods = computed(() => {
  // LEARNING: If busyPeriods prop is provided, use it directly
  // WHY: Ensures mock panel shows exactly what slot generation uses
  // PATTERN: Prefer prop over generated values for consistency
  if (props.busyPeriods && props.busyPeriods.length > 0) {
    console.log('[CalendarMockDevPanel] Using provided busyPeriods:', {
      count: props.busyPeriods.length,
      periods: props.busyPeriods.slice(0, 3).map(p => ({
        start: p.start,
        end: p.end
      }))
    })
    return props.busyPeriods
  }
  
  // LEARNING: Fall back to generating from dateRange if no busyPeriods provided
  // WHY: Maintains backward compatibility
  // PATTERN: Generate busy periods from dateRange when prop not provided
  if (!props.dateRange) {
    console.log('[CalendarMockDevPanel] No dateRange prop')
    return []
  }
  
  // LEARNING: Include refreshKey in dependency to force recalculation
  // WHY: Changing refreshKey forces mock data regeneration
  // PATTERN: Reference refreshKey in computed to trigger recalculation
  void props.refreshKey // Force dependency tracking
  
  console.log('[CalendarMockDevPanel] Computing busyPeriods with dateRange:', {
    start: props.dateRange.start,
    end: props.dateRange.end,
    startDate: new Date(props.dateRange.start).toISOString(),
    endDate: new Date(props.dateRange.end).toISOString(),
    refreshKey: props.refreshKey
  })
  
  const result = getCalendarAvailability(props.dateRange)
  
  console.log('[CalendarMockDevPanel] getCalendarAvailability returned:', {
    count: result.length,
    periods: result.slice(0, 3).map(p => ({
      start: p.start,
      end: p.end
    }))
  })
  
  return result
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
const isTransitioning = ref(false)

// LEARNING: Calculate transform using expected panel dimensions
// WHY: Panel should be positioned correctly from the start of expansion
// PATTERN: Calculate using expected width before DOM update
const calculatePanelPosition = (): string => {
  if (!wrapperRef.value) {
    return 'translateX(0)'
  }

  const wrapperRect = wrapperRef.value.getBoundingClientRect()
  const panelWidth = 400 // Expected panel width (matches CSS width: 400px)
  const viewportWidth = window.innerWidth
  const rightEdge = wrapperRect.right + panelWidth
  const padding = 24 // Viewport padding

  // LEARNING: If panel would overflow right edge, shift it left
  // WHY: Keeps panel visible when expanded
  // PATTERN: Calculate transform to shift left if needed
  if (rightEdge > viewportWidth - padding) {
    const overflow = rightEdge - (viewportWidth - padding)
    return `translateX(-${overflow}px)`
  }
  return 'translateX(0)'
}

// LEARNING: Refine position after DOM update for accurate measurements
// WHY: Initial calculation uses expected width, this refines with actual width
// PATTERN: Use requestAnimationFrame for accurate measurements after expansion
const updatePanelPosition = (): void => {
  if (!isExpanded.value || !panelRef.value || !wrapperRef.value) {
    return
  }

  // LEARNING: Wait for DOM to update before calculating
  // WHY: Panel dimensions may not be available immediately
  // PATTERN: Use requestAnimationFrame for accurate measurements
  requestAnimationFrame(() => {
    if (!panelRef.value || !wrapperRef.value || !isExpanded.value) return

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

// LEARNING: Handle expansion toggle click
// WHY: Calculates transform before state change to prevent visual hop
// PATTERN: Calculate transform synchronously, apply it, then toggle state
const handleToggle = async (): Promise<void> => {
  const willExpand = !isExpanded.value
  
  if (willExpand) {
    // LEARNING: Calculate transform BEFORE toggling expansion state
    // WHY: Ensures transform is ready before Vue applies the expanded class
    // PATTERN: Calculate synchronously, disable transitions, apply transform, then toggle state
    const calculatedTransform = calculatePanelPosition()
    
    // LEARNING: Set transition flag to prevent transform animation during initial positioning
    // WHY: Initial positioning should be instant, not animated
    isTransitioning.value = true
    
    // LEARNING: Apply transform immediately (synchronously)
    // WHY: Ensures transform is set before Vue processes the class change
    // PATTERN: Set transform value synchronously
    panelTransform.value = calculatedTransform
    
    // LEARNING: Wait for nextTick to ensure transform is in DOM
    // WHY: Ensures transform is applied before Vue processes the class change
    // PATTERN: Use nextTick to ensure DOM update happens before state change
    await nextTick()
    
    // LEARNING: Toggle expansion state after transform is in DOM
    // WHY: Transform is already applied, so panel won't hop when class changes
    // PATTERN: Toggle state after DOM update
    isExpanded.value = true
    
    // LEARNING: Use nextTick to refine position after DOM update
    // WHY: Panel dimensions are now accurate after class change
    // PATTERN: Use nextTick then requestAnimationFrame for precise timing
    nextTick(() => {
      requestAnimationFrame(() => {
        // LEARNING: Allow transform transitions after initial positioning
        // WHY: Subsequent position refinements can be animated smoothly
        isTransitioning.value = false
        
        // LEARNING: Refine position with actual panel dimensions
        // WHY: Initial calculation used expected width, now use actual width
        // PATTERN: Use requestAnimationFrame for accurate measurements
        updatePanelPosition()
      })
    })
    
    // LEARNING: Final refinement after expand transition completes
    // WHY: Panel content may change size during expansion
    // PATTERN: Use setTimeout to wait for VExpandTransition (300ms)
    setTimeout(() => {
      updatePanelPosition()
    }, 350)
  } else {
    // LEARNING: Collapse panel
    // WHY: User clicked to collapse
    // PATTERN: Toggle state, keep transform during collapse
    isExpanded.value = false
    
    // LEARNING: Keep transform during collapse, reset after animation completes
    // WHY: Prevents panel from hopping right before collapsing
    // PATTERN: Wait for collapse transition (300ms) before resetting transform
    setTimeout(() => {
      panelTransform.value = 'translateX(0)'
      isTransitioning.value = false
    }, 350)
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
