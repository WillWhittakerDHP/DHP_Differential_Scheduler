<script setup lang="ts">
/**
 * Dev Panels Container Component
 * 
 * LEARNING: Unified floating container for dev mode debug panels
 * WHY: Provides tabbed interface for switching between different debug panels
 * PATTERN: Teleport to body, fixed positioning, tab interface with VWindow
 */

import { ref, inject, computed, onMounted, onUnmounted, watch, type Ref, type ComputedRef, type ComponentPublicInstance } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'
import type { AppointmentResponse, AppointmentShape, SlotShape } from '@/types/appointment'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { getMockBusyTimesSync } from '@/utils/timeSlotCalculations'
import type { AppointmentSlot } from '@/types/appointment'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { EventShape } from '@/types/events'
import type { useBookingWizard } from '@/composables/useBookingWizard'
import { toBoolean } from '@/utils/ternary/ternaryUtils'
import { useGlobal } from '@/composables/useGlobal'
import { useDevPanelsComputed } from '@/composables/booking/useDevPanelsComputed'
import { useFreeBusyDataSource, type FreeBusyDataSource } from '@/composables/booking/useFreeBusyDataSource'
import { checkOAuthStatus, getOAuthUrl } from '@/services/calendarApiService'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const activeTab = ref<'slotShape' | 'finalizedParts' | 'services' | 'constraints' | 'calendar'>('slotShape')
const panelRef = ref<HTMLElement | null>(null)

// WHY: AvailabilityStep updates shared state, DevPanelsContainer reads it
// PATTERN: Use shared ref pattern instead of provide/inject for cross-tree access
const devPanelData = useDevPanelData()

// WHY: Access ComputedRef.value inside computed to ensure reactivity tracking
interface AppointmentData {
  selectedBlockInstances: BookingBlockInstance[]
  appointmentSlots: AppointmentSlot[]
  appointmentShape: AppointmentShape | null
  selectedDate: string | undefined
  selectedTime: string | undefined
}

const appointmentData = computed<AppointmentData>(() => {
  // LEARNING: Access shared ref first to establish dependency
  const data = devPanelData.value
  
  // LEARNING: Access ComputedRef values inside computed to ensure reactivity
  // PATTERN: Unwrap all ComputedRefs inside the computed function, accessing each one explicitly
  // WHY: Access each ComputedRef separately to ensure Vue tracks each dependency
  const appointmentSlotsRef = data.appointmentSlots
  const appointmentShapeRef = data.appointmentShape
  const selectedBlockInstancesRef = data.selectedBlockInstances
  const selectedDateRef = data.selectedDate
  const selectedTimeRef = data.selectedTime
  
  // LEARNING: Unwrap ComputedRefs - accessing .value establishes reactivity tracking
  // WHY: Each .value access tells Vue to track that ComputedRef as a dependency
  // PATTERN: Check if it's a ComputedRef by checking for .value property, otherwise use directly
  const slots: AppointmentSlot[] = (appointmentSlotsRef && typeof appointmentSlotsRef === 'object' && 'value' in appointmentSlotsRef)
    ? (appointmentSlotsRef.value as AppointmentSlot[])
    : (Array.isArray(appointmentSlotsRef) ? (appointmentSlotsRef as AppointmentSlot[]) : [])
  
  const appointmentShape: AppointmentShape | null = (appointmentShapeRef && typeof appointmentShapeRef === 'object' && 'value' in appointmentShapeRef)
    ? (appointmentShapeRef.value as AppointmentShape | null)
    : (appointmentShapeRef as AppointmentShape | null | undefined) ?? null
  
  const selectedBlockInstances: BookingBlockInstance[] = (selectedBlockInstancesRef && typeof selectedBlockInstancesRef === 'object' && 'value' in selectedBlockInstancesRef)
    ? (selectedBlockInstancesRef.value as BookingBlockInstance[])
    : (Array.isArray(selectedBlockInstancesRef) ? (selectedBlockInstancesRef as BookingBlockInstance[]) : [])
  
  // PATTERN: Check if ComputedRef exists before accessing .value
  let selectedDate: string | undefined = undefined
  if (selectedDateRef && typeof selectedDateRef === 'object' && 'value' in selectedDateRef) {
    const computedRef = selectedDateRef as ComputedRef<string | undefined>
    selectedDate = computedRef.value
  }
  
  let selectedTime: string | undefined = undefined
  if (selectedTimeRef && typeof selectedTimeRef === 'object' && 'value' in selectedTimeRef) {
    const computedRef = selectedTimeRef as ComputedRef<string | undefined>
    selectedTime = computedRef.value
  }
  
  return {
    selectedBlockInstances,
    appointmentSlots: slots,
    appointmentShape,
    selectedDate,
    selectedTime
  }
})

// LEARNING: Use useLocalTime composable for UI-boundary formatting
// WHY: All local time conversions must go through useLocalTime composable
const { formatDateTimeForDisplay, formatTimeForDisplay } = useLocalTime()

const { settings: availabilitySettings } = useAvailabilitySettings()

const availabilitySettingsValue = computed(() => availabilitySettings?.value ?? null)

interface ServiceSummary {
  name: string
  differential: TernaryBoolean // LEARNING: Changed from boolean to TernaryBoolean to match BookingBlockInstance.differential
  bookingMode: string
  baseSqFt: number
  partCount: number
}

const servicesSummary = computed<ServiceSummary[]>(() => {
  const instances = appointmentData.value.selectedBlockInstances
  if (!instances || !Array.isArray(instances)) return []
  return instances.map((block: BookingBlockInstance) => ({
    name: block.name,
    differential: block.differential,
    bookingMode: block.bookingMode,
    baseSqFt: block.baseSqFt,
    partCount: block.partInstances?.length || 0
  }))
})

const finalizedParts = computed<PartFinal[]>(() => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.finalizedParts) {
    return []
  }
  return shape.finalizedParts
})

const slotShapeTotals = computed<SlotShape>(() => {
  const shape = appointmentData.value.appointmentShape
  
  if (!shape || !shape.slotShape) {
    return {
      rawDuration: 0,
      roundedDuration: 0,
      eventFinals: [],
      rawDifferentialOffset: 0,
      roundedDifferentialOffset: 0
    }
  }
  
  return shape.slotShape
})

const timeSlotResults = computed(() => {
  const slots = appointmentData.value.appointmentSlots
  const selectedTime = appointmentData.value.selectedTime
  
  if (slots.length === 0 || !selectedTime) {
    return {
      majorArrival: null,
      minorArrival: null,
      appointmentEnd: null
    }
  }
  
  const slot = slots[0]
  
  const majorArrival = slot.totalTimeRange?.startTime || null
  
  const minorEventName = 'Minor' // TODO: Get from availabilitySettings
  const minorEventTimeRange = slot.eventTimeRanges?.[minorEventName]
  const minorArrival = minorEventTimeRange?.startTime || slot.totalTimeRange?.startTime || null
  
  const appointmentEnd = slot.totalTimeRange?.endTime || null
  
  return {
    majorArrival,
    minorArrival,
    appointmentEnd
  }
})

// WHY: Converts ISO strings to readable format
const formatTime = (isoString: string | null): string => {
  if (!isoString) return 'N/A'
  return formatDateTimeForDisplay(isoString as any, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// WHY: Converts minutes to readable format
const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0 min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

const handleClickOutside = (event: MouseEvent): void => {
  if (!props.visible || !panelRef.value) return
  
  // PATTERN: Check if click target is within toggle button element
  const target = event.target as HTMLElement | null
  if (target?.closest('.dev-panel-toggle')) {
    return
  }
  
  // PATTERN: Use $el to get actual HTMLElement for contains() check
  const panelEl = (panelRef.value as unknown as ComponentPublicInstance).$el as HTMLElement | null
  
  if (panelEl && !panelEl.contains(target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// WHY: Access ComputedRef.value inside computed to ensure reactivity tracking
const calendarData = computed(() => {
  // LEARNING: Access shared ref first to establish dependency
  const data = devPanelData.value
  
  // LEARNING: Access dateRange ComputedRef to establish dependency tracking
  const dateRangeRef = data.dateRange
  
  // PATTERN: Check if dateRange exists and unwrap it, handling both ComputedRef and direct values
  // WHY: Access .value inside computed to ensure Vue tracks the ComputedRef as a dependency
  let dateRangeValue: { start: RFC3339DateTime; end: RFC3339DateTime } | null = null
  
  if (dateRangeRef) {
    if (typeof dateRangeRef === 'object' && 'value' in dateRangeRef) {
      const value = dateRangeRef.value
      if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
        dateRangeValue = value as { start: RFC3339DateTime; end: RFC3339DateTime }
      }
    } else if (dateRangeRef && typeof dateRangeRef === 'object' && 'start' in dateRangeRef && 'end' in dateRangeRef) {
      dateRangeValue = dateRangeRef as { start: RFC3339DateTime; end: RFC3339DateTime }
    }
  }
  
  // LEARNING: Access busyPeriods ComputedRef to establish dependency tracking
  const busyPeriodsRef = data.busyPeriods
  
  let busyPeriodsValue: BusyTimeRange[] = []
  if (busyPeriodsRef) {
    if (typeof busyPeriodsRef === 'object' && 'value' in busyPeriodsRef) {
      const value = busyPeriodsRef.value
      if (Array.isArray(value)) {
        busyPeriodsValue = value as BusyTimeRange[]
      }
    } else if (Array.isArray(busyPeriodsRef)) {
      busyPeriodsValue = busyPeriodsRef as BusyTimeRange[]
    }
  }
  
  // LEARNING: Access refreshKey to establish dependency tracking
  // PATTERN: refreshKey is a Ref<number> | undefined, so access .value directly
  const refreshKeyRef = data.refreshKey
  let refreshKeyValue: number | undefined = undefined
  if (refreshKeyRef && typeof refreshKeyRef === 'object' && 'value' in refreshKeyRef) {
    const ref = refreshKeyRef as Ref<number>
    refreshKeyValue = ref.value
  }
  
  return {
    dateRange: dateRangeValue,
    refreshKey: refreshKeyValue,
    busyPeriods: busyPeriodsValue
  }
})

// Session 2.1.2: Free/busy data source management
const { 
  dataSource: freeBusyDataSource, 
  calendarEmails: configuredCalendarEmails,
  forceRefresh: triggerForceRefresh,
  settingsLoaded: calendarSettingsLoaded
} = useFreeBusyDataSource()

// Data source options for radio group
const dataSourceOptions: { title: string; value: FreeBusyDataSource }[] = [
  { title: 'Real API', value: 'real' },
  { title: 'Mock Data', value: 'mock' },
  { title: 'Both (Merged)', value: 'both' },
  { title: 'None', value: 'none' }
]

// OAuth status for showing auth prompt
const oauthStatus = ref<{ authenticated: boolean; authUrl?: string }>({ authenticated: false })
const isCheckingAuth = ref(false)

// Check OAuth status when component mounts or data source changes to 'real' or 'both'
const checkAuth = async () => {
  if (freeBusyDataSource.value === 'real' || freeBusyDataSource.value === 'both') {
    isCheckingAuth.value = true
    try {
      oauthStatus.value = await checkOAuthStatus()
    } catch (error) {
      oauthStatus.value = { authenticated: false, authUrl: getOAuthUrl() }
    } finally {
      isCheckingAuth.value = false
    }
  }
}

// Check auth on mount
onMounted(() => {
  checkAuth()
})

// Watch data source changes
watch(freeBusyDataSource, () => {
  checkAuth()
})

const busyPeriods = computed(() => {
  // PATTERN: Prefer prop over generated values for consistency
  if (calendarData.value.busyPeriods && calendarData.value.busyPeriods.length > 0) {
    return calendarData.value.busyPeriods
  }
  
  // PATTERN: Generate busy periods from dateRange when prop not provided
  if (!calendarData.value.dateRange) {
    return []
  }
  
  // LEARNING: Include refreshKey in dependency to force recalculation
  // PATTERN: Reference refreshKey in computed to trigger recalculation
  void calendarData.value.refreshKey // Force dependency tracking
  
  // Session 2.1.2: Use mock sync version for dev panel display
  // The actual async fetch happens in useBusyTimes which updates devPanelData.busyPeriods
  const result = getMockBusyTimesSync(calendarData.value.dateRange)
  
  return result
})

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

const devPanelButtonsRef = inject<Ref<{
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
  updateAppointment: { isPending: Ref<boolean> }
  wizard: ReturnType<typeof useBookingWizard> | null
} | null>>('devPanelButtons', ref(null))

const devPanelButtons = computed(() => {
  if (!devPanelButtonsRef || !devPanelButtonsRef.value) {
    return null
  }
  return devPanelButtonsRef.value
})

const hasDevPanelButtons = computed(() => {
  return devPanelButtons.value !== null
})

const wizard = computed(() => {
  return devPanelButtons.value?.wizard ?? null
})

// LEARNING: allActiveServiceTypes and serviceTypeOptions are provided by useDevPanelsComputed composable
// WHY: Extracted to composable to reduce component complexity
const { allActiveServiceTypes, serviceTypeOptions } = useDevPanelsComputed({
  appointmentData
})

const selectedServiceTypeId = computed(() => {
  const wizardInstance = wizard.value
  if (!wizardInstance) return null
  const selected = wizardInstance.selectedServiceTypeBlocks?.value
  if (!selected || !Array.isArray(selected) || selected.length === 0) return null
  return selected[0].id
})

const handleServiceTypeChange = (serviceId: string | null): void => {
  const wizardInstance = wizard.value
  if (!wizardInstance || !serviceId) return
  
  const serviceInstance = allActiveServiceTypes.value.find(s => s.id === serviceId)
  if (serviceInstance) {
    wizardInstance.toggleServiceTypeBlock(serviceInstance)
  }
}

const { getGlobalEntities } = useGlobal()

const eventShapes = computed<EventShape[]>(() => {
  return getGlobalEntities('eventShape') as EventShape[]
})

/**
 * LEARNING: Use the same isEffectivelyDifferential value that the grid uses
 * WHY: Ensures dev panel flag matches what the grid actually shows - single source of truth
 * PATTERN: Read from shared dev panel data instead of duplicating logic
 */
const isSelectedServiceDifferential = computed(() => {
  const data = devPanelData.value
  const isEffectivelyDifferentialRef = data.isEffectivelyDifferential
  if (!isEffectivelyDifferentialRef) {
    return false
  }
  // Unwrap ComputedRef to get the actual boolean value
  // LEARNING: Type guard to check if it's a ComputedRef
  if (typeof isEffectivelyDifferentialRef === 'object' && 'value' in isEffectivelyDifferentialRef) {
    return (isEffectivelyDifferentialRef as { value: boolean }).value
  }
  return false
})

const hasEventForPart = (partShapeName: string, eventShape: EventShape): boolean => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.eventAssignmentsByPartShape) return false
  
  const events = shape.eventAssignmentsByPartShape[partShapeName] || []
  if (events.length === 0) return false
  
  const allEventShapes = getGlobalEntities('eventShape') as EventShape[]
  const eventShapeById = new Map(allEventShapes.map(es => [es.id, es]))
  
  const matchingEvent = events.find(ei => {
    const es = eventShapeById.get(ei.eventShapeRef)
    return es?.id === eventShape.id
  })
  
  if (!matchingEvent) return false
  
  if (eventShape.isTernary) {
    const ternaryValue = eventShape.ternaryDefault
    if (ternaryValue === null) {
      console.error(`[Event Error] Cannot determine ternary value for event shape "${eventShape.name}" (${eventShape.id})`)
      return false // Graceful failure
    }
    return toBoolean(ternaryValue, 'strict')
  }
  
  return true
}

</script>

<template>
  <Teleport to="body">
    <VCard
      v-if="isDevMode && visible"
      ref="panelRef"
      class="dev-panels-container"
      variant="outlined"
      color="info"
    >
      <!-- Button Row Above Tabs -->
      <VCardText v-if="hasDevPanelButtons" class="pa-2 pb-1">
        <VRow v-if="devPanelButtons" dense no-gutters>
          <VCol cols="12" class="d-flex gap-2 mb-2 align-center">
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
              color="success"
              variant="outlined"
              size="small"
              prepend-icon="tabler-device-floppy"
              :loading="devPanelButtons?.updateAppointment?.isPending?.value ?? false"
              :disabled="(devPanelButtons?.updateAppointment?.isPending?.value || !devPanelButtons?.loadedAppointmentId?.value) ?? false"
              @click="devPanelButtons?.handleUpdateAppointment"
            >
              UPDATE APPOINTMENT
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
          </VCol>
        </VRow>
      </VCardText>
      
      <VTabs v-model="activeTab" density="compact" color="info" class="flexible-tabs">
        <VTab value="slotShape">
          <VIcon size="small" class="mr-2">tabler-chart-bar</VIcon>
          Durations
        </VTab>
        <VTab value="finalizedParts">
          <VIcon size="small" class="mr-2">tabler-package</VIcon>
          Part
        </VTab>
        <VTab value="services">
          <VIcon size="small" class="mr-2">tabler-settings</VIcon>
          Services
        </VTab>
        <VTab value="constraints">
          <VIcon size="small" class="mr-2">tabler-lock</VIcon>
          Constraints
        </VTab>
        <VTab value="calendar">
          <VIcon size="small" class="mr-2">tabler-calendar-event</VIcon>
          Free/Busy
        </VTab>
      </VTabs>
      
      <VCardText class="pa-0">
        <VWindow v-model="activeTab">
          <!-- Tab 1: SlotShape Totals -->
          <VWindowItem value="slotShape">
            <div class="pa-3">
              <div v-if="appointmentData.appointmentShape" class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  SlotShape Totals
                </VCardTitle>
                <!-- First row: Duration and Differential Offset boxes -->
                <VRow dense class="ma-0 mb-2">
                  <VCol cols="6">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis font-weight-bold mb-1">
                        Duration
                      </div>
                      <div class="text-body-2 mb-1">
                        <div>Raw: {{ formatDuration(slotShapeTotals.rawDuration) }}</div>
                        <div>Rounded: {{ formatDuration(slotShapeTotals.roundedDuration) }}</div>
                      </div>
                    </VCard>
                  </VCol>
                  <VCol cols="6">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis font-weight-bold mb-1">
                        Differential Offset
                      </div>
                      <div class="text-body-2 mb-1">
                        <div>Raw: {{ formatDuration(slotShapeTotals.rawDifferentialOffset) }}</div>
                        <div>Rounded: {{ formatDuration(slotShapeTotals.roundedDifferentialOffset) }}</div>
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
                <!-- Third row: Event boxes showing both raw and rounded durations -->
                <VRow v-if="slotShapeTotals.eventFinals.length > 0" dense class="ma-0">
                  <VCol 
                    v-for="eventFinal in slotShapeTotals.eventFinals" 
                    :key="eventFinal.eventShape.id"
                    :cols="12 / slotShapeTotals.eventFinals.length"
                  >
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">{{ eventFinal.eventShape.name }}</div>
                      <div class="text-body-2 font-weight-medium">
                        Raw: {{ formatDuration(eventFinal.rawDuration) }}
                      </div>
                      <div class="text-body-2 font-weight-medium">
                        Rounded: {{ formatDuration(eventFinal.roundedDuration) }}
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
              </div>
              <div v-else class="text-center pa-4 text-medium-emphasis">
                No appointment shape available
              </div>
            </div>
          </VWindowItem>

          <!-- Tab 2: Finalized Parts -->
          <VWindowItem value="finalizedParts">
            <div class="pa-3">
              <div v-if="finalizedParts.length > 0" class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Finalized Parts
                </VCardTitle>
                <VRow dense class="ma-0">
                  <VCol
                    v-for="(part, index) in finalizedParts"
                    :key="index"
                    :cols="12 / finalizedParts.length"
                  >
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis font-weight-bold mb-1">
                        {{ part.partShape }}
                      </div>
                      <div class="text-body-2 mb-1">
                        <div>Time: {{ formatDuration(part.baseTime) }}</div>
                        <div>Fee: ${{ part.baseFee.toFixed(2) }}</div>
                      </div>
                      <div class="d-flex flex-wrap gap-2 mt-2">
                        <!-- LEARNING: Read events from AppointmentShape.eventAssignmentsByPartShape -->
                        <!-- WHY: Events are appointment-level features, not part properties -->
                        <!-- PATTERN: Iterate through all event shapes dynamically instead of hard-coded names -->
                        <template v-if="appointmentData.appointmentShape">
                          <div 
                            v-for="eventShape in eventShapes" 
                            :key="eventShape.id"
                            class="d-flex align-center gap-1"
                          >
                            <VIcon 
                              size="x-small" 
                              :color="hasEventForPart(part.partShape, eventShape) ? 'success' : 'default'"
                            >
                              {{ hasEventForPart(part.partShape, eventShape) ? 'tabler-check' : 'tabler-x' }}
                            </VIcon>
                            <span class="text-caption">{{ eventShape.name }}</span>
                          </div>
                        </template>
                        <div class="d-flex align-center gap-1">
                          <VIcon size="x-small" :color="part.zeroOutPart ? 'warning' : 'default'">
                            {{ part.zeroOutPart ? 'tabler-check' : 'tabler-x' }}
                          </VIcon>
                          <span class="text-caption">Zeroed</span>
                        </div>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        Source Parts: {{ part.sourcePartInstances.length }}
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
              </div>
              <div v-else class="text-center pa-4 text-medium-emphasis">
                No finalized parts available
              </div>
            </div>
          </VWindowItem>

          <!-- Tab 3: Selected Services -->
          <VWindowItem value="services">
            <div class="pa-3">
              <!-- Service Type Dropdown -->
              <div class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Change Service Type
                </VCardTitle>
                <VSelect
                  :model-value="selectedServiceTypeId"
                  :items="serviceTypeOptions"
                  item-title="title"
                  item-value="value"
                  label="Service Type"
                  density="compact"
                  variant="outlined"
                  :disabled="!wizard"
                  @update:model-value="handleServiceTypeChange"
                >
                  <template #prepend-inner>
                    <VIcon size="small">tabler-settings</VIcon>
                  </template>
                </VSelect>
              </div>
              
              <!-- Differential Service Indicator -->
              <div class="mb-4">
                <VChip
                  :color="isSelectedServiceDifferential ? 'success' : 'default'"
                  variant="outlined"
                  size="default"
                  prepend-icon="tabler-toggle-left"
                  class="d-flex align-center"
                >
                  {{ isSelectedServiceDifferential ? 'Differential' : 'Non-Differential' }}
                </VChip>
              </div>
              
              <!-- Selected Services Summary -->
              <div v-if="servicesSummary.length > 0" class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Selected Services
                </VCardTitle>
                <VList density="compact">
                  <VListItem
                    v-for="(service, index) in servicesSummary"
                    :key="index"
                  >
                    <VListItemTitle class="text-body-2">
                      {{ service.name }}
                    </VListItemTitle>
                    <VListItemSubtitle class="text-caption">
                      Differential: {{ service.differential ? 'Yes' : 'No' }} | 
                      Mode: {{ service.bookingMode }} | 
                      Base SqFt: {{ service.baseSqFt }} | 
                      Parts: {{ service.partCount }}
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </div>

              <!-- Time Slot Results -->
              <div v-if="appointmentData.selectedTime" class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Time Slot Results
                </VCardTitle>
                <VList density="compact">
                  <VListItem>
                    <VListItemTitle class="text-body-2">Major Arrival</VListItemTitle>
                    <VListItemSubtitle class="text-caption">
                      {{ formatTime(timeSlotResults.majorArrival) }}
                    </VListItemSubtitle>
                  </VListItem>
                  <VListItem>
                    <VListItemTitle class="text-body-2">Minor Arrival</VListItemTitle>
                    <VListItemSubtitle class="text-caption">
                      {{ formatTime(timeSlotResults.minorArrival) }}
                    </VListItemSubtitle>
                  </VListItem>
                  <VListItem>
                    <VListItemTitle class="text-body-2">Appointment End</VListItemTitle>
                    <VListItemSubtitle class="text-caption">
                      {{ formatTime(timeSlotResults.appointmentEnd) }}
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </div>
            </div>
          </VWindowItem>

          <!-- Tab 4: Active Constraints -->
          <VWindowItem value="constraints">
            <div class="pa-3">
              <div class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Active Constraints
                </VCardTitle>
                <VRow dense class="ma-0">
                  <VCol cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Business Hours</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue?.rangeConstraints?.businessHours?.enforcement || 'hard' }}
                      </div>
                    </VCard>
                  </VCol>
                  <VCol cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Lead Time</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue?.rangeConstraints?.leadTime?.config && availabilitySettingsValue.rangeConstraints.leadTime.type === 'leadTime' && 'minutes' in availabilitySettingsValue.rangeConstraints.leadTime.config
                          ? `${(availabilitySettingsValue.rangeConstraints.leadTime.config as { minutes: number }).minutes} min` 
                          : 'Not configured' }}
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue?.rangeConstraints?.leadTime?.enforcement || 'off' }})
                      </div>
                    </VCard>
                  </VCol>
                  <VCol v-if="availabilitySettingsValue?.buffers?.appointment" cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Appointment Buffer</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue.buffers.appointment.minutes }} min
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue.buffers.appointment.placement }}, 
                        {{ availabilitySettingsValue.buffers.appointment.enforcement }})
                      </div>
                    </VCard>
                  </VCol>
                  <VCol v-if="availabilitySettingsValue?.buffers?.driveTime" cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Drive Time Buffer</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue.buffers.driveTime.minutes }} min
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue.buffers.driveTime.placement }}, 
                        {{ availabilitySettingsValue.buffers.driveTime.enforcement }})
                      </div>
                    </VCard>
                  </VCol>
                  <VCol v-if="availabilitySettingsValue?.buffers?.lunch" cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Lunch Buffer</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue.buffers.lunch.minutes }} min
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue.buffers.lunch.placement }}, 
                        {{ availabilitySettingsValue.buffers.lunch.enforcement }})
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
              </div>
            </div>
          </VWindowItem>

          <!-- Tab 5: Free/Busy Data Source -->
          <!-- Session 2.1.2: Updated with data source toggle -->
          <VWindowItem value="calendar">
            <div class="pa-3">
              <!-- Data Source Selection -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Data Source</div>
                <VRadioGroup
                  v-model="freeBusyDataSource"
                  inline
                  density="compact"
                  hide-details
                >
                  <VRadio
                    v-for="option in dataSourceOptions"
                    :key="option.value"
                    :label="option.title"
                    :value="option.value"
                  />
                </VRadioGroup>
                
                <!-- Force Refresh and Reset Mocks Buttons -->
                <div class="d-flex gap-2 mt-2">
                  <VBtn
                    variant="outlined"
                    size="small"
                    color="primary"
                    prepend-icon="tabler-refresh"
                    @click="triggerForceRefresh"
                  >
                    Force Refresh
                  </VBtn>
                  <VBtn
                    v-if="devPanelButtons"
                    variant="outlined"
                    size="small"
                    color="warning"
                    prepend-icon="tabler-refresh"
                    @click="devPanelButtons.handleResetMocks"
                  >
                    Reset Mocks
                  </VBtn>
                </div>
              </div>
              
              <!-- OAuth Status Warning (when using real API) -->
              <VAlert
                v-if="(freeBusyDataSource === 'real' || freeBusyDataSource === 'both') && !oauthStatus.authenticated && !isCheckingAuth"
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon>tabler-alert-triangle</VIcon>
                </template>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption">Not connected to Google Calendar</span>
                  <VBtn
                    variant="text"
                    size="small"
                    color="warning"
                    :href="oauthStatus.authUrl || getOAuthUrl()"
                    target="_blank"
                  >
                    Connect
                  </VBtn>
                </div>
              </VAlert>
              
              <!-- Auth Checking Indicator -->
              <div v-if="isCheckingAuth" class="d-flex align-center mb-4">
                <VProgressCircular indeterminate size="16" class="mr-2" />
                <span class="text-caption">Checking authentication...</span>
              </div>
              
              <!-- Calendar Configuration Info -->
              <VAlert
                v-if="freeBusyDataSource !== 'mock' && freeBusyDataSource !== 'none'"
                :type="configuredCalendarEmails.length > 0 ? 'success' : (calendarSettingsLoaded ? 'info' : 'warning')"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon v-if="!calendarSettingsLoaded">tabler-loader</VIcon>
                  <VIcon v-else-if="configuredCalendarEmails.length > 0">tabler-check</VIcon>
                  <VIcon v-else>tabler-info-circle</VIcon>
                </template>
                <div class="text-caption">
                  <template v-if="!calendarSettingsLoaded">
                    Loading calendar settings...
                  </template>
                  <template v-else-if="configuredCalendarEmails.length > 0">
                    <strong>Configured calendars:</strong> {{ configuredCalendarEmails.join(', ') }}
                  </template>
                  <template v-else>
                    No calendars configured. Go to Admin → Controls → Calendar → Integration to add calendars.
                  </template>
                </div>
              </VAlert>
              
              <VDivider class="my-3" />

              <div v-if="!calendarData.dateRange" class="text-body-2 text-medium-emphasis mb-4">
                Select a date to see busy periods
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
                  No busy periods for this date range
                  <span v-if="freeBusyDataSource === 'none'" class="text-caption">(data source is "None")</span>
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
                <!-- WHY: Explains the data source behavior -->
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
                    <template v-if="freeBusyDataSource === 'mock'">
                      Busy periods are randomly generated mock data. Change the selected date to regenerate.
                    </template>
                    <template v-else-if="freeBusyDataSource === 'real'">
                      Busy periods are fetched from Google Calendar API (cached on server).
                    </template>
                    <template v-else-if="freeBusyDataSource === 'both'">
                      Busy periods are merged from Google Calendar API and mock data.
                    </template>
                    <template v-else>
                      Data source is "None" - all times are available.
                    </template>
                  </div>
                </VAlert>
              </template>
            </div>
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
  
  :deep(*) {
    background-color: transparent;
  }
  
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

// Flexible and responsive tab spacing
:deep(.flexible-tabs) {
  .v-tab {
    min-width: auto;
    flex: 0 1 auto;
    padding: 0 8px !important;
    margin: 0 1px !important;
    white-space: nowrap;
  }
  
  .v-tabs__wrapper {
    gap: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .v-tabs__container {
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  // Responsive spacing - tighter on smaller screens
  @media (max-width: 600px) {
    .v-tab {
      padding: 0 6px !important;
      margin: 0 !important;
      font-size: 0.75rem;
      
      .v-icon {
        margin-right: 4px !important;
      }
    }
  }
  
  // More space on larger screens
  @media (min-width: 960px) {
    .v-tab {
      padding: 0 12px !important;
      margin: 0 2px !important;
    }
  }
}
</style>
