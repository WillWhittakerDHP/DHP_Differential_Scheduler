<script setup lang="ts">
/**
 * Dev Panels Container Component
 * 
 * LEARNING: Unified floating container for dev mode debug panels
 * WHY: Provides tabbed interface for switching between different debug panels
 * PATTERN: Teleport to body, fixed positioning, tab interface with VWindow
 */

import { ref, inject, computed, type Ref, type ComputedRef } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import AppointmentDebugPanel from './AppointmentDebugPanel.vue'
import CalendarMockDevPanel from './CalendarMockDevPanel.vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlots, AppointmentResponse } from '@/types/appointment'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const isDevMode = isDevModeEnabled()
const activeTab = ref<'appointment' | 'calendar'>('appointment')

// LEARNING: Inject dev panel data from AvailabilityStep via provide/inject
// WHY: Allows AvailabilityStep to provide data without prop drilling
// PATTERN: Use inject with default values for optional data
const devPanelData = inject<{
  selectedBlockInstances?: BookingBlockInstance[]
  appointmentSlots?: AppointmentSlots
  selectedDate?: string
  selectedTime?: string
  dateRange?: { start: string; end: string } | null
  busyPeriods?: BusyTimeRange[]
  refreshKey?: number | string
}>('devPanelData', {})

// LEARNING: Computed props for AppointmentDebugPanel
// WHY: Extract only needed props from injected data
// PATTERN: Computed properties that provide defaults
const appointmentPanelProps = computed(() => ({
  selectedBlockInstances: devPanelData.selectedBlockInstances || [],
  appointmentSlots: devPanelData.appointmentSlots || [],
  selectedDate: devPanelData.selectedDate,
  selectedTime: devPanelData.selectedTime
}))

// LEARNING: Computed props for CalendarMockDevPanel
// WHY: Extract only needed props from injected data
// PATTERN: Computed properties that provide defaults
const calendarPanelProps = computed(() => ({
  dateRange: devPanelData.dateRange ? {
    start: devPanelData.dateRange.start as RFC3339DateTime,
    end: devPanelData.dateRange.end as RFC3339DateTime
  } : null,
  refreshKey: devPanelData.refreshKey,
  busyPeriods: devPanelData.busyPeriods
}))

// LEARNING: Inject dev panel button functions and state from App.vue
// WHY: DevPanelsContainer is rendered in App.vue, so it injects from app-level provide
// PATTERN: Inject ref that BookingWizard updates, with default value to prevent undefined
const devPanelButtonsRef = inject<Ref<{
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
} | null>>('devPanelButtons', ref(null))

// LEARNING: Computed to access the actual buttons object
// WHY: devPanelButtonsRef is a Ref<object | null>, so we need to unwrap it
// PATTERN: Return null if ref doesn't exist or value is null, ensure reactive updates
const devPanelButtons = computed(() => {
  if (!devPanelButtonsRef || !devPanelButtonsRef.value) {
    return null
  }
  return devPanelButtonsRef.value
})

// LEARNING: Computed to check if buttons are available
// WHY: Provides a safe boolean check for template v-if
// PATTERN: Separate computed for boolean check
const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})

</script>

<template>
  <Teleport to="body">
    <VCard
      v-if="isDevMode && visible"
      class="dev-panels-container"
      variant="outlined"
      color="info"
    >
      <!-- Button Row Above Tabs -->
      <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
        <VRow v-if="devPanelButtons" dense no-gutters>
          <VCol cols="12" class="d-flex gap-2 mb-2">
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
              color="secondary"
              variant="outlined"
              size="small"
              prepend-icon="tabler-refresh"
              @click="devPanelButtons?.handleResetWizard"
            >
              RESET WIZARD
            </VBtn>
            <VBtn
              color="warning"
              variant="outlined"
              size="small"
              prepend-icon="tabler-refresh"
              @click="devPanelButtons?.handleResetMocks"
            >
              RESET MOCKS
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      
      <VTabs v-model="activeTab" density="compact" color="info">
        <VTab value="appointment">
          <VIcon size="small" class="mr-2">tabler-bug</VIcon>
          Appointment Debug
        </VTab>
        <VTab value="calendar">
          <VIcon size="small" class="mr-2">tabler-calendar-off</VIcon>
          Calendar Mock
        </VTab>
      </VTabs>
      
      <VCardText class="pa-0">
        <VWindow v-model="activeTab">
          <VWindowItem value="appointment">
            <AppointmentDebugPanel v-bind="appointmentPanelProps" />
          </VWindowItem>
          <VWindowItem value="calendar">
            <CalendarMockDevPanel v-bind="calendarPanelProps" />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </Teleport>
</template>

<style scoped lang="scss">
.dev-panels-container {
  position: fixed;
  bottom: 80px; /* Above FAB button */
  right: 24px;
  width: 450px;
  max-width: calc(100vw - 48px);
  max-height: 60vh;
  overflow: auto;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 2px dashed rgb(var(--v-theme-info));
  background-color: rgb(var(--v-theme-surface)) !important;
  opacity: 1 !important;
  
  // LEARNING: Ensure all child elements are also opaque
  // WHY: Prevents any transparency from cascading down
  :deep(*) {
    background-color: transparent;
  }
  
  // LEARNING: Ensure VCardText and content areas have solid backgrounds
  // WHY: Makes panel content fully readable
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
</style>
