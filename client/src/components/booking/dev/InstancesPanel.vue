<!-- WHY: Extracted from DevPanelsContainer to reduce file size (audit: file-cohesion). -->
<template>
  <div class="pa-0">
    <VTabs :model-value="activeInstancesSubTab" density="compact" color="info" class="px-3 pt-2" @update:model-value="emit('update:activeInstancesSubTab', $event)">
      <VTab value="parts">
        <VIcon size="small" class="mr-2">tabler-package</VIcon>
        Parts
      </VTab>
      <VTab value="blocks">
        <VIcon size="small" class="mr-2">tabler-settings</VIcon>
        Blocks
      </VTab>
    </VTabs>
    <VWindow :model-value="activeInstancesSubTab" class="pa-3">
      <VWindowItem value="parts">
        <div v-if="finalizedParts.length > 0" class="mb-4">
          <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">Finalized Parts</VCardTitle>
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
                  <template v-if="appointmentShape">
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
      <VWindowItem value="blocks">
        <div class="mb-4">
          <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">Change Service Type</VCardTitle>
          <VSelect
            :model-value="selectedServiceTypeId"
            :items="serviceTypeOptions"
            item-title="title"
            item-value="value"
            label="Service Type"
            density="compact"
            variant="outlined"
            :disabled="!hasWizard"
            @update:model-value="(v: string | null) => handleServiceTypeChange(v)"
          >
            <template #prepend-inner>
              <VIcon size="small">tabler-settings</VIcon>
            </template>
          </VSelect>
        </div>
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
        <div v-if="servicesSummary.length > 0" class="mb-4">
          <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">Selected Blocks</VCardTitle>
          <VList density="compact">
            <VListItem v-for="(service, index) in servicesSummary" :key="index">
              <VListItemTitle class="text-body-2">{{ service.name }}</VListItemTitle>
              <VListItemSubtitle class="text-caption">
                Differential: {{ service.differential ? 'Yes' : 'No' }} |
                Mode: {{ service.bookingMode }} |
                Base SqFt: {{ service.baseSqFt }} |
                Parts: {{ service.partCount }}
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </div>
        <div v-if="hasSelectedTime" class="mb-4">
          <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">Time Slot Results</VCardTitle>
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
</template>

<script setup lang="ts">
import type { AppointmentShape } from '@/types/appointment'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { EventShape } from '@/types/events'
import type { ServiceSummary } from '@/types/booking/devPanelsComputed'
import type { TimeSlotResults } from '@/types/booking/devPanelsComputed'

defineProps<{
  activeInstancesSubTab: 'parts' | 'blocks'
  appointmentShape: AppointmentShape | null
  finalizedParts: PartFinal[]
  eventShapes: EventShape[]
  hasEventForPart: (partShapeName: string, eventShape: EventShape) => boolean
  formatDuration: (ms: number) => string
  formatTime: (value: string | null) => string
  selectedServiceTypeId: string | null
  serviceTypeOptions: Array<{ title: string; value: string }>
  handleServiceTypeChange: (serviceId: string | null) => void
  hasWizard: boolean
  isSelectedServiceDifferential: boolean
  servicesSummary: ServiceSummary[]
  timeSlotResults: TimeSlotResults
  hasSelectedTime: boolean
}>()

const emit = defineEmits<{ (e: 'update:activeInstancesSubTab', value: 'parts' | 'blocks'): void }>()
</script>
