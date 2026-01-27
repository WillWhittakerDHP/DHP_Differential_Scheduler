<script setup lang="ts">
/**
 * Appointment Debug Panel Component
 * 
 * LEARNING: Dev mode UI for viewing AppointmentSlot calculation breakdowns
 * WHY: Enables developers to see how time calculations, category groupings, and differential rendering work
 * PATTERN: Panel showing services summary, parts breakdown, calculated durations, time slots, and constraints
 * 
 * This component displays:
 * - Selected services summary (name, differential, bookingMode, baseSqFt, part count)
 * - Parts breakdown table (category, name, baseTime, flags)
 * - Calculated durations (total, on-site, category-specific, client start offset)
 * - Time slot results (inspector arrival, client arrival, end time)
 * - Active constraints (business hours, lead time, buffers)
 */

import { computed } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AppointmentSlots } from '@/types/appointment'
import { getPartInstanceCategory } from '@/utils/booking/partShapeTimeSlotMapping'
import { useLocalTime } from '@/composables/useLocalTime'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'

interface Props {
  selectedBlockInstances: BookingBlockInstance[]
  appointmentSlots: AppointmentSlots
  selectedDate?: string
  selectedTime?: string
}

const props = defineProps<Props>()

// LEARNING: Use useLocalTime composable for UI-boundary formatting
// WHY: All local time conversions must go through useLocalTime composable
const { formatDateTimeForDisplay } = useLocalTime()

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
const servicesSummary = computed(() => {
  return props.selectedBlockInstances.map(block => ({
    name: block.name,
    differential: block.differential,
    bookingMode: block.bookingMode,
    baseSqFt: block.baseSqFt,
    partCount: block.partInstances?.length || 0
  }))
})

// LEARNING: Calculate parts breakdown
// WHY: Shows detailed part information for debugging
// PATTERN: Flatten all parts from all blocks, categorize, and format
const partsBreakdown = computed(() => {
  const allParts = props.selectedBlockInstances.flatMap(block => 
    (block.partInstances || []).map(part => ({
      blockName: block.name,
      category: getPartInstanceCategory(part) || 'uncategorized',
      partName: part.name,
      baseTime: part.baseTime,
      baseFee: part.baseFee,
      onSite: part.onSite,
      clientPresent: part.clientPresent,
      moveable: part.moveable,
      zeroedOut: part.zeroOutPart,
      differentialOverride: part.differentialOverride
    }))
  )
  
  return allParts
})

// LEARNING: Calculate durations from appointment slots
// WHY: Shows calculated time values for verification
// PATTERN: Extract durations from first appointment slot (normalized structure)
const calculations = computed(() => {
  if (props.appointmentSlots.length === 0) {
    return {
      totalDuration: 0,
      timeOnSite: 0,
      earlyArrivalDuration: 0,
      dataCollectionDuration: 0,
      reportWritingDuration: 0,
      clientPresentationDuration: 0,
      clientStartOffset: 0
    }
  }
  
  const slot = props.appointmentSlots[0]
  
  // Calculate client start offset (time before client arrives)
  // This is the duration of parts where onSite === true AND clientPresent === false
  const clientStartOffset = partsBreakdown.value
    .filter(part => part.onSite && !part.clientPresent && !part.zeroedOut)
    .reduce((sum, part) => sum + part.baseTime, 0)
  
  return {
    totalDuration: slot.totalTime?.duration || 0,
    timeOnSite: slot.totalOnSite?.duration || 0,
    earlyArrivalDuration: slot.earlyArrival?.duration || 0,
    dataCollectionDuration: slot.dataCollection?.duration || 0,
    reportWritingDuration: slot.reportWriting?.duration || 0,
    clientPresentationDuration: slot.clientPresentation?.duration || 0,
    clientStartOffset
  }
})

// LEARNING: Format time slot results
// WHY: Shows actual time values for selected appointment
// PATTERN: Extract times from selected slot
const timeSlotResults = computed(() => {
  if (props.appointmentSlots.length === 0 || !props.selectedTime) {
    return {
      inspectorArrival: null,
      clientArrival: null,
      appointmentEnd: null
    }
  }
  
  const slot = props.appointmentSlots[0]
  
  // Inspector arrival is the start of totalTime
  const inspectorArrival = slot.totalTime?.startTime || null
  
  // Client arrival is the start of clientPresentation (or totalTime if no clientPresentation)
  const clientArrival = slot.clientPresentation?.startTime || slot.totalTime?.startTime || null
  
  // Appointment end is the end of totalTime
  const appointmentEnd = slot.totalTime?.endTime || null
  
  return {
    inspectorArrival,
    clientArrival,
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
</script>

<template>
  <div class="appointment-debug-panel">
    <!-- Section 1: Selected Services Summary -->
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

    <!-- Section 2: Parts Breakdown Table -->
    <div v-if="partsBreakdown.length > 0" class="mb-4">
      <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
        Parts Breakdown
      </VCardTitle>
      <VTable density="compact">
        <thead>
          <tr>
            <th class="text-caption">Category</th>
            <th class="text-caption">Part Name</th>
            <th class="text-caption">Time</th>
            <th class="text-caption">On Site</th>
            <th class="text-caption">Client Present</th>
            <th class="text-caption">Zeroed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(part, index) in partsBreakdown" :key="index">
            <td class="text-caption">{{ part.category }}</td>
            <td class="text-caption">{{ part.partName }}</td>
            <td class="text-caption">{{ formatDuration(part.baseTime) }}</td>
            <td class="text-caption">
              <VIcon size="x-small" :color="part.onSite ? 'success' : 'default'">
                {{ part.onSite ? 'tabler-check' : 'tabler-x' }}
              </VIcon>
            </td>
            <td class="text-caption">
              <VIcon size="x-small" :color="part.clientPresent ? 'success' : 'default'">
                {{ part.clientPresent ? 'tabler-check' : 'tabler-x' }}
              </VIcon>
            </td>
            <td class="text-caption">
              <VIcon size="x-small" :color="part.zeroedOut ? 'warning' : 'default'">
                {{ part.zeroedOut ? 'tabler-check' : 'tabler-x' }}
              </VIcon>
            </td>
          </tr>
        </tbody>
      </VTable>
    </div>

    <!-- Section 3: Calculated Durations -->
    <div class="mb-4">
      <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
        Calculated Durations
      </VCardTitle>
      <!-- Row 1: Total Duration, Time On Site, Client Start Offset -->
      <VRow dense class="ma-0 mb-2">
        <VCol cols="4">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Total Duration</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.totalDuration) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="4">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Time On Site</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.timeOnSite) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="4">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Client Start Offset</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.clientStartOffset) }}
            </div>
          </VCard>
        </VCol>
      </VRow>
      <!-- Row 2: Early Arrival, Data Collection, Report Writing, Client Presentation -->
      <VRow dense class="ma-0">
        <VCol cols="3">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Early Arrival</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.earlyArrivalDuration) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Data Collection</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.dataCollectionDuration) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Report Writing</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.reportWritingDuration) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="3">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis">Client Presentation</div>
            <div class="text-body-2 font-weight-medium">
              {{ formatDuration(calculations.clientPresentationDuration) }}
            </div>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Section 4: Time Slot Results -->
    <div v-if="selectedTime" class="mb-4">
      <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
        Time Slot Results
      </VCardTitle>
      <VList density="compact">
        <VListItem>
          <VListItemTitle class="text-body-2">Inspector Arrival</VListItemTitle>
          <VListItemSubtitle class="text-caption">
            {{ formatTime(timeSlotResults.inspectorArrival) }}
          </VListItemSubtitle>
        </VListItem>
        <VListItem>
          <VListItemTitle class="text-body-2">Client Arrival</VListItemTitle>
          <VListItemSubtitle class="text-caption">
            {{ formatTime(timeSlotResults.clientArrival) }}
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

    <!-- Section 5: Active Constraints -->
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
              {{ availabilitySettingsValue?.rangeConstraints?.leadTime?.config && 'minutes' in (availabilitySettingsValue.rangeConstraints.leadTime.config || {})
                ? `${availabilitySettingsValue.rangeConstraints.leadTime.config.minutes} min` 
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
</template>

<style scoped lang="scss">
.appointment-debug-panel {
  padding: 8px;
  max-height: calc(60vh - 100px);
  overflow-y: auto;
  background-color: rgb(var(--v-theme-surface));
  opacity: 1;
}
</style>
