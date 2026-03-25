<!-- WHY: Extracted from DevPanelsContainer to reduce file size (audit: file-cohesion). -->
<template>
  <div class="pa-3">
    <div class="mb-4">
      <VCardTitle class="text-body-large font-weight-bold pa-2">Active Constraints</VCardTitle>
      <VRow density="comfortable" class="ma-0">
        <VCol cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Business Hours</div>
            <div class="text-body-medium font-weight-medium">
              {{ businessHoursEnforcement }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Lead Time</div>
            <div class="text-body-medium font-weight-medium">
              {{ leadTimeLabel }}
            </div>
            <div class="text-body-small">
              ({{ availabilitySettingsValue?.rangeConstraints?.leadTime?.enforcement || 'off' }})
            </div>
          </VCard>
        </VCol>
        <VCol v-if="availabilitySettingsValue?.buffers?.appointment" cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Appointment Buffer</div>
            <div class="text-body-medium font-weight-medium">
              {{ availabilitySettingsValue.buffers.appointment.minutes }} min
            </div>
            <div class="text-body-small">
              ({{ availabilitySettingsValue.buffers.appointment.placement }},
              {{ availabilitySettingsValue.buffers.appointment.enforcement }})
            </div>
          </VCard>
        </VCol>
        <VCol v-if="driveToLabel" cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Drive Time To</div>
            <div class="text-body-medium font-weight-medium">
              {{ availabilitySettingsValue?.buffers?.driveToCandidate?.minutes }} min
            </div>
            <div class="text-body-small">
              ({{ availabilitySettingsValue?.buffers?.driveToCandidate?.applyTo }},
              {{ availabilitySettingsValue?.buffers?.driveToCandidate?.enforcement }})
            </div>
          </VCard>
        </VCol>
        <VCol v-if="driveFromLabel" cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Drive Time From</div>
            <div class="text-body-medium font-weight-medium">
              {{ availabilitySettingsValue?.buffers?.driveFromCandidate?.minutes }} min
            </div>
            <div class="text-body-small">
              ({{ availabilitySettingsValue?.buffers?.driveFromCandidate?.applyTo }},
              {{ availabilitySettingsValue?.buffers?.driveFromCandidate?.enforcement }})
            </div>
          </VCard>
        </VCol>
        <VCol v-if="availabilitySettingsValue?.buffers?.lunch" cols="auto">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Lunch Buffer</div>
            <div class="text-body-medium font-weight-medium">
              {{ availabilitySettingsValue.buffers.lunch.minutes }} min
            </div>
            <div class="text-body-small">
              ({{ availabilitySettingsValue.buffers.lunch.placement }},
              {{ availabilitySettingsValue.buffers.lunch.enforcement }})
            </div>
          </VCard>
        </VCol>
      </VRow>
    </div>
    <div v-if="minimizerWindowDisplay" class="mb-4">
      <VCardTitle class="text-body-large font-weight-bold pa-2">Minimizer window (client virtual)</VCardTitle>
      <VRow density="comfortable" class="ma-0">
        <VCol cols="12" md="6">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Earliest completion start</div>
            <div class="text-body-medium font-weight-medium">
              {{ formatIsoForDev(minimizerWindowDisplay.earliestStart) }}
            </div>
          </VCard>
        </VCol>
        <VCol cols="12" md="6">
          <VCard variant="outlined" density="compact" class="pa-2">
            <div class="text-body-small text-medium-emphasis">Latest slot end (contingency)</div>
            <div class="text-body-medium font-weight-medium">
              {{
                minimizerWindowDisplay.latestEnd
                  ? formatIsoForDev(minimizerWindowDisplay.latestEnd)
                  : 'Not applied (no closing deadline)'
              }}
            </div>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { MinimizerSchedulingWindow } from '@/types/booking/minimizerSchedulingWindow'

const props = defineProps<{
  availabilitySettingsValue: AvailabilitySettings | null
  minimizerSchedulingWindow?: MinimizerSchedulingWindow | null
}>()

const minimizerWindowDisplay = computed<MinimizerSchedulingWindow | null>(
  () => props.minimizerSchedulingWindow ?? null
)

function formatIsoForDev(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

const businessHoursEnforcement = computed(() =>
  props.availabilitySettingsValue?.rangeConstraints?.businessHours?.enforcement || 'hard'
)

const leadTimeLabel = computed(() => {
  const val = props.availabilitySettingsValue?.rangeConstraints?.leadTime
  if (!val?.config || val.type !== 'leadTime' || !('minutes' in val.config)) return 'Not configured'
  return `${(val.config as { minutes: number }).minutes} min`
})

const driveToLabel = computed(
  () =>
    props.availabilitySettingsValue?.buffers?.driveToCandidate?.applyTo &&
    props.availabilitySettingsValue.buffers.driveToCandidate.applyTo !== 'none'
)

const driveFromLabel = computed(
  () =>
    props.availabilitySettingsValue?.buffers?.driveFromCandidate?.applyTo &&
    props.availabilitySettingsValue.buffers.driveFromCandidate.applyTo !== 'none'
)
</script>
