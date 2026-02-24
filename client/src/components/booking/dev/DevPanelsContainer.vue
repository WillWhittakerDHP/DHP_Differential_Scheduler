<script setup lang="ts">

import { ref, inject, computed, type Ref, type ComputedRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { createLogger } from '@/utils/logger'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useDevPanelData } from '@/composables/booking/useAvailabilityDevPanel'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentResponse, AppointmentShape, SlotShape } from '@/types/appointment'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { AppointmentSlot } from '@/types/appointment'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { EventShape } from '@/types/events'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { toBoolean } from '@/utils/ternary/ternaryUtils'
import { useGlobal } from '@/composables/useGlobal'
import { toGlobalEntityId } from '@/types/entities'
import { useDevPanelsComputed, type DevPanelsComputedData, type ServiceSummary } from '@/composables/booking/useDevPanelsComputed'
import { useDevPanelsAppointmentData } from '@/composables/booking/useDevPanelsAppointmentData'
import { useDevPanelsFormatters } from '@/composables/booking/useDevPanelsFormatters'
import type { DevPanelVisibleProps } from '@/components/admin/dev/devPanelTypes'

type Props = DevPanelVisibleProps

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()
const logger = createLogger('DevPanelsContainer')
const activeTab = ref<'slotShape' | 'instances' | 'constraints'>('slotShape')
const activeInstancesSubTab = ref<'parts' | 'blocks'>('parts')
const panelRef = ref<HTMLElement | null>(null)

const devPanelData = useDevPanelData()
const appointmentData = useDevPanelsAppointmentData(devPanelData as Ref<Record<string, unknown>>)

// LEARNING: Use useLocalTime composable for UI-boundary formatting
// WHY: All local time conversions must go through useLocalTime composable
const { formatDateTimeForDisplay } = useLocalTime()

const { settings: availabilitySettings } = useAvailabilitySettings()

const availabilitySettingsValue = computed(() => availabilitySettings?.value ?? null)

const servicesSummary = computed<ServiceSummary[]>(() => {
  const instances = appointmentData.value.selectedBlockInstances
  if (!instances || !Array.isArray(instances)) return []
  return instances.map((block: BookingBlockInstance) => ({
    name: block.name,
    differential: block.differential,
    bookingMode: block.bookingMode,
    baseSqFt: block.baseSqFt,
    partCount: block.partInstances?.length !== undefined && block.partInstances?.length !== null ? block.partInstances.length : 0
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

const { formatTime, formatDuration } = useDevPanelsFormatters()

// PATTERN: VueUse onClickOutside keeps DOM (document, contains) in composable; ref must be element
onClickOutside(panelRef, () => {
  if (props.visible) emit('close')
}, { ignore: ['.dev-panel-toggle'] })


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

const isSelectedServiceDifferential = computed(() => {
  const data = devPanelData.value
  const isEffectivelyDifferentialRef = data.isEffectivelyDifferential
  if (!isEffectivelyDifferentialRef) {
    return false
  }
  if (typeof isEffectivelyDifferentialRef === 'object' && 'value' in isEffectivelyDifferentialRef) {
    return (isEffectivelyDifferentialRef as { value: boolean }).value
  }
  return false
})

const hasEventForPart = (partShapeName: string, eventShape: EventShape): boolean => {
  const shape = appointmentData.value.appointmentShape
  if (!shape || !shape.eventAssignmentsByPartShape) return false
  
  const rawEvents = shape.eventAssignmentsByPartShape[partShapeName]
  const events = rawEvents !== undefined && rawEvents !== null ? rawEvents : []
  if (events.length === 0) return false
  
  const allEventShapes = getGlobalEntities('eventShape') as EventShape[]
  const eventShapeById = new Map(allEventShapes.map(es => [es.id, es]))
  
  const matchingEvent = events.find(ei => {
    const es = eventShapeById.get(toGlobalEntityId(ei.eventShapeRef))
    return es?.id === eventShape.id
  })
  
  if (!matchingEvent) return false
  
  if (eventShape.isTernary) {
    const ternaryValue = eventShape.ternaryDefault
    if (ternaryValue === null) {
      logger.error('Cannot determine ternary value for event shape', { name: eventShape.name, id: eventShape.id })
      return false // Graceful failure
    }
    return toBoolean(ternaryValue, 'strict')
  }
  
  return true
}

</script>

<template>
  <Teleport to="body">
    <div v-if="isDevMode && visible" ref="panelRef" class="dev-panels-wrapper">
    <VCard
      class="dev-panels-container"
      variant="outlined"
      color="info"
    >
      <VTabs v-model="activeTab" density="compact" color="info" class="flexible-tabs">
        <VTab value="slotShape">
          <VIcon size="small" class="mr-2">tabler-chart-bar</VIcon>
          Durations
        </VTab>
        <VTab value="instances">
          <VIcon size="small" class="mr-2">tabler-package</VIcon>
          Instances
        </VTab>
        <VTab value="constraints">
          <VIcon size="small" class="mr-2">tabler-lock</VIcon>
          Constraints
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

          <!-- Tab 2: Instances (with sub-tabs for Parts and Blocks) -->
          <VWindowItem value="instances">
            <div class="pa-0">
              <!-- Sub-tabs for Instances -->
              <VTabs v-model="activeInstancesSubTab" density="compact" color="info" class="px-3 pt-2">
                <VTab value="parts">
                  <VIcon size="small" class="mr-2">tabler-package</VIcon>
                  Parts
                </VTab>
                <VTab value="blocks">
                  <VIcon size="small" class="mr-2">tabler-settings</VIcon>
                  Blocks
                </VTab>
              </VTabs>
              
              <VWindow v-model="activeInstancesSubTab" class="pa-3">
                <!-- Sub-tab: Parts -->
                <VWindowItem value="parts">
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
                </VWindowItem>
                
                <!-- Sub-tab: Blocks (formerly Services) -->
                <VWindowItem value="blocks">
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
              
              <!-- Selected Blocks Summary -->
              <div v-if="servicesSummary.length > 0" class="mb-4">
                <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
                  Selected Blocks
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
                </VWindowItem>
              </VWindow>
            </div>
          </VWindowItem>

          <!-- Tab 3: Active Constraints -->
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
                  <VCol v-if="availabilitySettingsValue?.buffers?.driveToCandidate && availabilitySettingsValue.buffers.driveToCandidate.applyTo !== 'none'" cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Drive Time To</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue.buffers.driveToCandidate.minutes }} min
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue.buffers.driveToCandidate.applyTo }}, 
                        {{ availabilitySettingsValue.buffers.driveToCandidate.enforcement }})
                      </div>
                    </VCard>
                  </VCol>
                  <VCol v-if="availabilitySettingsValue?.buffers?.driveFromCandidate && availabilitySettingsValue.buffers.driveFromCandidate.applyTo !== 'none'" cols="auto">
                    <VCard variant="outlined" density="compact" class="pa-2">
                      <div class="text-caption text-medium-emphasis">Drive Time From</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ availabilitySettingsValue.buffers.driveFromCandidate.minutes }} min
                      </div>
                      <div class="text-caption">
                        ({{ availabilitySettingsValue.buffers.driveFromCandidate.applyTo }}, 
                        {{ availabilitySettingsValue.buffers.driveFromCandidate.enforcement }})
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

        </VWindow>
      </VCardText>
    </VCard>
    </div>
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
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.2);
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
  
  @media (min-width: 960px) {
    .v-tab {
      padding: 0 12px !important;
      margin: 0 2px !important;
    }
  }
}
</style>
