<!--
  LEARNING: Route-level view for beta feedback dashboard
  WHY: Wrapper for BetaFeedbackDashboard; matches BookingWizardView pattern
  PATTERN: Thin view component that renders feature component
-->
<template>
  <div class="beta-feedback-view">
    <BetaFeedbackDashboard />
  </div>
</template>

<script setup lang="ts">
import BetaFeedbackDashboard from '@/components/beta/BetaFeedbackDashboard.vue'
</script>

<style scoped lang="scss">
.beta-feedback-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
