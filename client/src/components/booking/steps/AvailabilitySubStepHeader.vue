<!--
  Shared sub-step header: badge + label + summary.
  Used in VExpansionPanelTitle (accordion) and section header.
-->
<script setup lang="ts">
import type { AvailabilitySubStepDef } from '@/composables/booking/useAvailabilitySubSteps'

interface Props {
  step: AvailabilitySubStepDef
  badgeState: 'empty' | 'prefilled' | 'confirmed'
  /** Summary to show when step is confirmed (null = hide). Replaces summary+showSummary to avoid constant-prop-value. */
  displaySummary: string | null
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
    <span v-if="displaySummary" class="availability-substep-summary text-medium-emphasis">
      {{ displaySummary }}
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
