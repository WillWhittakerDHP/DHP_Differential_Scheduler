<!--
  Shared sub-step header: badge + label + summary.
  Used in narrow (VExpansionPanelTitle) and wide (section header).
-->
<script setup lang="ts">
import type { AvailabilitySubStepDef } from '@/composables/booking/useAvailabilitySubSteps'

interface Props {
  step: AvailabilitySubStepDef
  badgeState: 'empty' | 'prefilled' | 'confirmed'
  summary: string | null
  showSummary: boolean
}
defineProps<Props>()
</script>

<template>
  <span class="d-flex align-center gap-2 flex-wrap availability-substep-header">
    <VIcon
      v-if="badgeState === 'confirmed'"
      icon="mdi-check-circle"
      color="success"
      size="small"
      class="availability-substep-done"
    />
    <span>{{ step.label }}</span>
    <span v-if="showSummary && summary" class="availability-substep-summary text-medium-emphasis">
      {{ summary }}
    </span>
  </span>
</template>

<style scoped lang="scss">
.availability-substep-done {
  flex-shrink: 0;
}
.availability-substep-summary {
  font-size: 0.875rem;
}
</style>
