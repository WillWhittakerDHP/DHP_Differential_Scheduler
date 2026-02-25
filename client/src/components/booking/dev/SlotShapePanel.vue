<!-- WHY: Extracted from DevPanelsContainer to reduce file size (audit: file-cohesion). -->
<template>
  <div class="pa-3">
    <div v-if="appointmentShape" class="mb-4">
      <VCardTitle class="text-subtitle-1 font-weight-bold pa-2">
        SlotShape Totals
      </VCardTitle>
      <VRow dense class="ma-0 mb-2">
        <VCol cols="6">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis font-weight-bold mb-1">Duration</div>
            <div class="text-body-2 mb-1">
              <div>Raw: {{ formatDuration(slotShapeTotals.rawDuration) }}</div>
              <div>Rounded: {{ formatDuration(slotShapeTotals.roundedDuration) }}</div>
            </div>
          </VCard>
        </VCol>
        <VCol cols="6">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-caption text-medium-emphasis font-weight-bold mb-1">Differential Offset</div>
            <div class="text-body-2 mb-1">
              <div>Raw: {{ formatDuration(slotShapeTotals.rawDifferentialOffset) }}</div>
              <div>Rounded: {{ formatDuration(slotShapeTotals.roundedDifferentialOffset) }}</div>
            </div>
          </VCard>
        </VCol>
      </VRow>
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
</template>

<script setup lang="ts">
import type { AppointmentShape, SlotShape } from '@/types/appointment'

defineProps<{
  appointmentShape: AppointmentShape | null
  slotShapeTotals: SlotShape
  formatDuration: (ms: number) => string
}>()
</script>
