<!-- WHY: Extracted from DevPanelsContainer to reduce file size (audit: file-cohesion). Consumes context via provide/inject (allowlist repair). -->
<template>
  <div class="pa-0">
    <VTabs :model-value="activeInstancesSubTab" density="compact" color="info" class="px-3 pt-2" @update:model-value="(v: 'parts' | 'blocks') => setActiveInstancesSubTab(v)">
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
          <VCardTitle class="text-body-large font-weight-bold pa-2">Finalized Parts</VCardTitle>
          <VRow density="comfortable" class="ma-0">
            <VCol
              v-for="(part, index) in finalizedParts"
              :key="index"
              :cols="12 / finalizedParts.length"
            >
              <VCard variant="outlined" density="compact" class="pa-2">
                <div class="text-body-small text-medium-emphasis font-weight-bold mb-1">
                  {{ part.partShape }}
                </div>
                <div class="text-body-medium mb-1">
                  <div>Time: {{ ctx.formatDuration(part.baseTime) }}</div>
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
                        :color="ctx.hasEventForPart(part.partShape, eventShape) ? 'success' : 'default'"
                      >
                        {{ ctx.hasEventForPart(part.partShape, eventShape) ? 'tabler-check' : 'tabler-x' }}
                      </VIcon>
                      <span class="text-body-small">{{ eventShape.name }}</span>
                    </div>
                  </template>
                  <div class="d-flex align-center gap-1">
                    <VIcon size="x-small" :color="part.zeroOutPart ? 'warning' : 'default'">
                      {{ part.zeroOutPart ? 'tabler-check' : 'tabler-x' }}
                    </VIcon>
                    <span class="text-body-small">Zeroed</span>
                  </div>
                </div>
                <div class="text-body-small text-medium-emphasis mt-1">
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
          <VCardTitle class="text-body-large font-weight-bold pa-2">Change Service Type</VCardTitle>
          <VSelect
            :model-value="selectedServiceTypeId"
            :items="serviceTypeOptions"
            item-title="title"
            item-value="value"
            label="Service Type"
            density="compact"
            variant="outlined"
            :disabled="!ctx.hasWizard"
            @update:model-value="(v: string | null) => ctx.handleServiceTypeChange(v)"
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
          <VCardTitle class="text-body-large font-weight-bold pa-2">Selected Blocks</VCardTitle>
          <VList density="compact">
            <VListItem v-for="(service, index) in servicesSummary" :key="index">
              <VListItemTitle class="text-body-medium">{{ service.name }}</VListItemTitle>
              <VListItemSubtitle class="text-body-small">
                Orchestrator: {{ service.orchestrator ? 'Yes' : 'No' }} |
                Wizard visible: {{ service.wizardVisible ? 'Yes' : 'No' }} |
                Base SqFt: {{ service.baseSqFt }} |
                Parts: {{ service.partCount }}
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </div>
        <div v-if="hasSelectedTime" class="mb-4">
          <VCardTitle class="text-body-large font-weight-bold pa-2">Time Slot Results</VCardTitle>
          <VList density="compact">
            <VListItem>
              <VListItemTitle class="text-body-medium">Major Arrival</VListItemTitle>
              <VListItemSubtitle class="text-body-small">
                {{ ctx.formatTime(timeSlotResults.majorArrival) }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem>
              <VListItemTitle class="text-body-medium">Minor Arrival</VListItemTitle>
              <VListItemSubtitle class="text-body-small">
                {{ ctx.formatTime(timeSlotResults.minorArrival) }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem>
              <VListItemTitle class="text-body-medium">Appointment End</VListItemTitle>
              <VListItemSubtitle class="text-body-small">
                {{ ctx.formatTime(timeSlotResults.appointmentEnd) }}
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </div>
      </VWindowItem>
    </VWindow>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { instancesPanelContextKey } from '@/keys/bookingInjectionKeys'

const injected = inject(instancesPanelContextKey)
if (!injected) {
  throw new Error('InstancesPanel must be used within a provider that supplies instancesPanelContextKey')
}
const ctx = injected as NonNullable<typeof injected>

const finalizedParts = computed(() => ctx.finalizedParts.value)
const eventShapes = computed(() => ctx.eventShapes.value)
const serviceTypeOptions = computed(() => ctx.serviceTypeOptions.value)
const servicesSummary = computed(() => ctx.servicesSummary.value)
const timeSlotResults = computed(() => ctx.timeSlotResults.value)
const selectedServiceTypeId = computed(() => ctx.selectedServiceTypeId.value)
const isSelectedServiceDifferential = computed(() => ctx.isSelectedServiceDifferential.value)
const hasSelectedTime = computed(() => ctx.hasSelectedTime.value)
const appointmentShape = computed(() => ctx.appointmentShape.value)
const activeInstancesSubTab = computed(() => ctx.activeInstancesSubTab.value)
function setActiveInstancesSubTab(v: 'parts' | 'blocks'): void {
  ctx.setActiveInstancesSubTab(v)
}
</script>
