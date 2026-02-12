<script setup lang="ts">
/**
 * BookingWizardView Component
 *
 * LEARNING: Route-level view component for booking wizard
 * WHY: Provides page-level wrapper for the booking wizard component
 * PATTERN: View component imports and renders feature component
 */

import BookingWizard from '@/components/booking/BookingWizard.vue'
import BetaFeedbackWidget from '@/components/beta/BetaFeedbackWidget.vue'
import { useBooking } from '@/composables/useBooking'

/**
 * LEARNING: Initialize booking data context when booking wizard view mounts
 * WHY: Ensures booking data (with transformer) only loads when booking wizard page is accessed
 * PATTERN: Initialize route-specific composables in view component setup
 * PERFORMANCE: Booking transformer only runs on booking wizard pages, not on admin pages
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

