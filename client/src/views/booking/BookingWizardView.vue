<script setup lang="ts">

import BookingWizard from '@/components/booking/BookingWizard.vue'
import BetaFeedbackWidget from '@/components/beta/BetaFeedbackWidget.vue'
import { useBooking } from '@/composables/useBooking'

/**
 * PATTERN: Initialize route-specific composables in view component setup
PERFORMANC...
 */
useBooking()
</script>

<template>
  <div class="booking-wizard-view">
    <BookingWizard />
    <BetaFeedbackWidget />
  </div>
</template>

<style scoped lang="scss">
.booking-wizard-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>

