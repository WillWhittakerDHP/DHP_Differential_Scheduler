<script setup lang="ts">
/**
 * Dev Panels Container Component
 * 
 * LEARNING: Unified floating container for dev mode debug panels
 * WHY: Provides tabbed interface for switching between different debug panels
 * PATTERN: Teleport to body, fixed positioning, tab interface with VWindow
 */

import { ref, inject, computed, onMounted, onUnmounted, type Ref, type ComputedRef, type ComponentPublicInstance } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentResponse, AppointmentShape, SlotShape } from '@/types/appointment'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import type { AppointmentSlot } from '@/types/appointment'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { EventInstance, EventShape } from '@/types/events'
import { useBooking } from '@/composables/useBooking'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { useBookingWizard } from '@/composables/useBookingWizard'
import { toBoolean } from '@/utils/ternary/ternaryUtils'
import { useGlobal } from '@/composables/useGlobal'
import { equals } from '@/utils/ternary/ternaryUtils'

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

// LEARNING: Get shared dev panel data from composable
// WHY: AvailabilityStep updates shared state, DevPanelsContainer reads it
// PATTERN: Use shared ref pattern instead of provide/inject for cross-tree access
const devPanelData = useDevPanelData()

// LEARNING: Extract appointment data from shared dev panel data
// WHY: Extract only needed props from shared data and unwrap ComputedRefs
// PATTERN: Computed properties that provide defaults, unwrapping refs with .value
// WHY: Access ComputedRef.value inside computed to ensure reactivity tracking
// WHY: Access the shared ref first, then the nested ComputedRefs to ensure Vue tracks all dependencies
interface AppointmentData {
  selectedBlockInstances: BookingBlockInstance[]
  appointmentSlots: AppointmentSlot[]
  appointmentShape: AppointmentShape | null
  selectedDate: string | undefined
  selectedTime: string | undefined
}

const appointmentData = computed<AppointmentData>(() => {
  // LEARNING: Access shared ref first to establish dependency
  // WHY: Ensures Vue tracks changes to the shared ref
  const data = devPanelData.value
  
  // LEARNING: Access ComputedRef values inside computed to ensure reactivity
  // WHY: Vue tracks dependencies when accessing .value inside computed properties
  // PATTERN: Unwrap all ComputedRefs inside the computed function, accessing each one explicitly
  // WHY: Access each ComputedRef separately to ensure Vue tracks each dependency
  const appointmentSlotsRef = data.appointmentSlots
  const appointmentShapeRef = data.appointmentShape
  const selectedBlockInstancesRef = data.selectedBlockInstances
  // LEARNING: Access ComputedRef values - these are ComputedRef<string | undefined> | undefined
  // WHY: TypeScript needs to know these are ComputedRefs to properly access .value
  const selectedDateRef = data.selectedDate
  const selectedTimeRef = data.selectedTime
  
  // LEARNING: Unwrap ComputedRefs - accessing .value establishes reactivity tracking
  // WHY: Each .value access tells Vue to track that ComputedRef as a dependency
  // WHY: Handle both ComputedRef and direct array values (Vue may auto-unwrap in some cases)
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
  
  // LEARNING: Unwrap selectedDate and selectedTime with proper type guards
  // WHY: These are ComputedRef<string | undefined> | undefined that need proper unwrapping
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

// LEARNING: Get availability settings for constraints display
// WHY: Shows active constraints that affect slot generation
// PATTERN: Use composable for settings access instead of direct API call
const { settings: availabilitySettings } = useAvailabilitySettings()

// LEARNING: Normalize optional ref for template safety
// WHY: useAvailabilitySettings can return null during initialization
const availabilitySettingsValue = computed(() => availabilitySettings?.value ?? null)

// LEARNING: Calculate services summary
// WHY: Shows overview of selected services
// PATTERN: Map block instances to summary objects
interface ServiceSummary {
  name: string
  differential: boolean
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

// LEARNING: Get finalized parts directly from AppointmentShape
// WHY: Shows finalized parts directly from source of truth without any filtering
// PATTERN: Direct access to appointmentShape.finalizedParts
const finalizedParts = computed<PartFinal[]>(() => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.finalizedParts) {
    return []
  }
  return shape.finalizedParts
})

// LEARNING: Get SlotShape totals directly from AppointmentShape
// WHY: Shows SlotShape properties directly without any filtering or categorization
// PATTERN: Direct access to appointmentShape.slotShape properties
const slotShapeTotals = computed<SlotShape>(() => {
  const shape = appointmentData.value.appointmentShape
  
  if (!shape || !shape.slotShape) {
    return {
      totalDuration: 0,
      eventFinals: [],
      differentialOffset: 0
    }
  }
  
  return shape.slotShape
})

// LEARNING: Format time slot results
// WHY: Shows actual time values for selected appointment
// PATTERN: Extract times from selected slot
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
  
  // Major arrival is the start of totalTimeRange
  const majorArrival = slot.totalTimeRange?.startTime || null
  
  // Minor arrival is the start of minor event time range (or totalTimeRange if no minor event)
  // NOTE: Uses eventTimeRanges lookup by event name (configured via availabilitySettings)
  const minorEventName = 'ClientPresent' // TODO: Get from availabilitySettings
  const minorEventTimeRange = slot.eventTimeRanges?.[minorEventName]
  const minorArrival = minorEventTimeRange?.startTime || slot.totalTimeRange?.startTime || null
  
  // Appointment end is the end of totalTimeRange
  const appointmentEnd = slot.totalTimeRange?.endTime || null
  
  return {
    majorArrival,
    minorArrival,
    appointmentEnd
  }
})

// LEARNING: Format time for display
// WHY: Converts ISO strings to readable format
// PATTERN: Use composable for UI-boundary formatting
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

// LEARNING: Format duration for display
// WHY: Converts minutes to readable format
// PATTERN: Format minutes as hours and minutes
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

// LEARNING: Click-outside detection to hide panel
// WHY: Provides intuitive way to close the panel by clicking outside
// PATTERN: Add click listener to document, check if click is outside panel element
// WHY: Only handle clicks when panel is visible to prevent closing immediately after opening
const handleClickOutside = (event: MouseEvent): void => {
  if (!props.visible || !panelRef.value) return
  
  // LEARNING: Ignore clicks on the toggle button itself
  // WHY: Toggle button click should open/close panel, not trigger click-outside
  // PATTERN: Check if click target is within toggle button element
  const target = event.target as HTMLElement | null
  if (target?.closest('.dev-panel-toggle')) {
    return
  }
  
  // LEARNING: Access DOM element from component ref
  // WHY: VCard component ref exposes DOM via $el property
  // PATTERN: Use $el to get actual HTMLElement for contains() check
  // WHY: Type assertion through unknown to safely convert HTMLElement ref to ComponentPublicInstance
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

// LEARNING: Extract calendar mock data from shared dev panel data
// WHY: Extract only needed props from shared data and unwrap ComputedRefs
// PATTERN: Computed properties that provide defaults, unwrapping refs with .value
// WHY: Access ComputedRef.value inside computed to ensure reactivity tracking
const calendarData = computed(() => {
  // LEARNING: Access shared ref first to establish dependency
  // WHY: Ensures Vue tracks changes to the shared ref
  const data = devPanelData.value
  
  // LEARNING: Access dateRange ComputedRef to establish dependency tracking
  // WHY: Accessing the ComputedRef itself tells Vue to track it
  const dateRangeRef = data.dateRange
  
  // LEARNING: Unwrap dateRange ComputedRef properly
  // WHY: dateRange is a ComputedRef that needs to be accessed with .value
  // PATTERN: Check if dateRange exists and unwrap it, handling both ComputedRef and direct values
  // WHY: Access .value inside computed to ensure Vue tracks the ComputedRef as a dependency
  let dateRangeValue: { start: RFC3339DateTime; end: RFC3339DateTime } | null = null
  
  if (dateRangeRef) {
    // LEARNING: Check if it's a ComputedRef by checking for .value property
    // WHY: Handle both ComputedRef and direct object values
    // WHY: Accessing .value inside computed ensures Vue tracks this ComputedRef
    if (typeof dateRangeRef === 'object' && 'value' in dateRangeRef) {
      const value = dateRangeRef.value
      if (value && typeof value === 'object' && 'start' in value && 'end' in value) {
        dateRangeValue = value as { start: RFC3339DateTime; end: RFC3339DateTime }
      }
    } else if (dateRangeRef && typeof dateRangeRef === 'object' && 'start' in dateRangeRef && 'end' in dateRangeRef) {
      // Direct object value
      dateRangeValue = dateRangeRef as { start: RFC3339DateTime; end: RFC3339DateTime }
    }
  }
  
  // LEARNING: Access busyPeriods ComputedRef to establish dependency tracking
  // WHY: Accessing the ComputedRef itself tells Vue to track it
  const busyPeriodsRef = data.busyPeriods
  
  // LEARNING: Unwrap busyPeriods ComputedRef
  // WHY: busyPeriods is a ComputedRef that needs to be accessed with .value
  // WHY: Accessing .value inside computed ensures Vue tracks this ComputedRef
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
  // WHY: Ensures Vue tracks changes to refreshKey
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

// LEARNING: Get current busy periods from mock calendar
// WHY: Shows what times are blocked for testing slot filtering
// PATTERN: Use provided busyPeriods if available, otherwise generate from dateRange
// WHY: Ensures mock panel shows exactly the same busy periods used by slot generation
const busyPeriods = computed(() => {
  // LEARNING: If busyPeriods prop is provided, use it directly
  // WHY: Ensures mock panel shows exactly what slot generation uses
  // PATTERN: Prefer prop over generated values for consistency
  if (calendarData.value.busyPeriods && calendarData.value.busyPeriods.length > 0) {
    return calendarData.value.busyPeriods
  }
  
  // LEARNING: Fall back to generating from dateRange if no busyPeriods provided
  // WHY: Maintains backward compatibility
  // PATTERN: Generate busy periods from dateRange when prop not provided
  if (!calendarData.value.dateRange) {
    return []
  }
  
  // LEARNING: Include refreshKey in dependency to force recalculation
  // WHY: Changing refreshKey forces mock data regeneration
  // PATTERN: Reference refreshKey in computed to trigger recalculation
  void calendarData.value.refreshKey // Force dependency tracking
  
  const result = getCalendarAvailability(calendarData.value.dateRange)
  
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
  wizard: ReturnType<typeof useBookingWizard> | null
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

// LEARNING: Get wizard instance from dev panel buttons
// WHY: Wizard instance is provided through devPanelButtons for accessing selection methods
// PATTERN: Safely unwrap wizard from devPanelButtons
const wizard = computed(() => {
  return devPanelButtons.value?.wizard ?? null
})

// LEARNING: Get booking data for service type filtering
// WHY: Need bookingData to get all active service block instances
// PATTERN: Use useBooking composable to get booking data
const { bookingData } = useBooking()

// LEARNING: Get all active service block instances (not filtered by cascades)
// WHY: Debug panel should allow selecting any active service type for testing
// PATTERN: Filter bookingData.blockInstances by service block shape ID and active status
const allActiveServiceTypes = computed((): BookingBlockInstance[] => {
  const data = bookingData.value
  if (!data || !data.blockInstances || !Array.isArray(data.blockInstances)) return []
  
  const serviceBlockShapeId = getBlockShapeIdByType(data, BLOCK_SHAPE_TYPES.SERVICE)
  if (!serviceBlockShapeId) return []
  
  return data.blockInstances
    .filter(instance => 
      instance.blockShapeRef === serviceBlockShapeId && 
      instance.active === true
    )
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
})

// LEARNING: Map service instances to dropdown options format
// WHY: VSelect component needs options in { title: string, value: string } format
// PATTERN: Map instances to select options
const serviceTypeOptions = computed(() => {
  return allActiveServiceTypes.value.map(service => ({
    title: service.name,
    value: service.id
  }))
})

// LEARNING: Get currently selected service type for dropdown
// WHY: Dropdown needs to show current selection
// PATTERN: Get first selected service or null
const selectedServiceTypeId = computed(() => {
  const wizardInstance = wizard.value
  if (!wizardInstance) return null
  const selected = wizardInstance.selectedServiceTypeBlocks?.value
  if (!selected || !Array.isArray(selected) || selected.length === 0) return null
  return selected[0].id
})

// LEARNING: Handle service type change from dropdown
// WHY: Updates wizard selection when user selects a different service type
// PATTERN: Find service instance by ID and call wizard toggle method
const handleServiceTypeChange = (serviceId: string | null): void => {
  const wizardInstance = wizard.value
  if (!wizardInstance || !serviceId) return
  
  const serviceInstance = allActiveServiceTypes.value.find(s => s.id === serviceId)
  if (serviceInstance) {
    wizardInstance.toggleServiceTypeBlock(serviceInstance)
  }
}

// LEARNING: Get global data accessor
// WHY: Need to access event shapes from global data
const { getGlobalData, getGlobalEntities } = useGlobal()

// LEARNING: Get all event shapes from global data for dynamic iteration
// WHY: Event shapes are dynamic entities, need to iterate through all of them
// PATTERN: Computed property that reads from globalData using getGlobalEntities helper
const eventShapes = computed<EventShape[]>(() => {
  return getGlobalEntities('eventShape') as EventShape[]
})

// LEARNING: Check if selected service is differential
// WHY: Shows differential status in dev panel for debugging
// PATTERN: Check if any selected service has differential === 'true' using equals helper
const isSelectedServiceDifferential = computed(() => {
  const wizardInstance = wizard.value
  if (!wizardInstance) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DevPanelsContainer.vue:537',message:'isSelectedServiceDifferential=false: no wizard',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return false
  }
  
  const selectedServices = wizardInstance.selectedServiceTypeBlocks?.value || []
  if (selectedServices.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DevPanelsContainer.vue:540',message:'isSelectedServiceDifferential=false: no services',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return false
  }
  
  // Check if any service is differential
  const result = selectedServices.some(s => equals(s.differential, 'true'))
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/dee08c11-824d-42a5-9020-c38261879107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DevPanelsContainer.vue:543',message:'isSelectedServiceDifferential result',data:{result,selectedServices:selectedServices.map(s=>({id:s.id,name:s.name,differential:s.differential}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return result
})

// LEARNING: Check if a partShape has a specific event shape
// WHY: Events are stored on AppointmentShape.eventAssignmentsByPartShape, need helper to check
// PATTERN: Look up EventInstance[] for partShape, check EventShape via eventInstance.eventShapeRef
// LEARNING: Use isTernary and ternaryDefault properties instead of hard-coded event names
const hasEventForPart = (partShapeName: string, eventShape: EventShape): boolean => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.eventAssignmentsByPartShape) return false
  
  const events = shape.eventAssignmentsByPartShape[partShapeName] || []
  if (events.length === 0) return false
  
  // Get EventShapes from globalData to look up event shapes
  const allEventShapes = getGlobalEntities('eventShape') as EventShape[]
  const eventShapeById = new Map(allEventShapes.map(es => [es.id, es]))
  
  // Check if any event has matching shape ID
  const matchingEvent = events.find(ei => {
    const es = eventShapeById.get(ei.eventShapeRef)
    return es?.id === eventShape.id
  })
  
  if (!matchingEvent) return false
  
  // For ternary events, use ternaryDefault or fail gracefully
  if (eventShape.isTernary) {
    const ternaryValue = eventShape.ternaryDefault
    if (ternaryValue === null) {
      console.error(`[Event Error] Cannot determine ternary value for event shape "${eventShape.name}" (${eventShape.id})`)
      return false // Graceful failure
    }
    return toBoolean(ternaryValue, 'strict')
  }
  
  // For boolean events, existence means active
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
            <!-- Differential Service Indicator -->
            <VChip
              :color="isSelectedServiceDifferential ? 'success' : 'default'"
              variant="outlined"
              size="small"
              prepend-icon="tabler-toggle-left"
            >
              {{ isSelectedServiceDifferential ? 'Differential' : 'Non-Differential' }}
            </VChip>
          </VCol>
        </VRow>
      </VCardText>
      
      <VTabs v-model="activeTab" density="compact" color="info">
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
          <VIcon size="small" class="mr-2">tabler-calendar-off</VIcon>
          Mocks
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
                <!-- First row: Total Duration and Differential Offset -->
                <VRow dense class="ma-0 mb-2">
                  <VCol cols="6">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Total Duration</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDuration(slotShapeTotals.totalDuration) }}
                      </div>
                    </VCard>
                  </VCol>
                  <VCol cols="6">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Differential Offset</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDuration(slotShapeTotals.differentialOffset) }}
                      </div>
                    </VCard>
                  </VCol>
                </VRow>
                <!-- Second row: Event boxes (1/x width where x is number of events) -->
                <VRow v-if="slotShapeTotals.eventFinals.length > 0" dense class="ma-0">
                  <VCol 
                    v-for="eventFinal in slotShapeTotals.eventFinals" 
                    :key="eventFinal.eventShape.id"
                    :cols="12 / slotShapeTotals.eventFinals.length"
                  >
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">{{ eventFinal.eventShape.name }}</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDuration(eventFinal.duration) }}
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

          <!-- Tab 5: Calendar Mock -->
          <VWindowItem value="calendar">
            <div class="pa-3">
              <div v-if="!calendarData.dateRange" class="text-body-2 text-medium-emphasis mb-4">
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
