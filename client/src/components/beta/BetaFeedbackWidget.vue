<!--
  WHY: Composes button and modal; single mount point in BookingWizardView
  PATTERN: Thin wrapper with local state for modal visibility
-->
<template>
  <BetaFeedbackButton @click="showModal = true" />
  <BetaFeedbackModal v-model="showModal" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BetaFeedbackButton from './BetaFeedbackButton.vue';
import BetaFeedbackModal from './BetaFeedbackModal.vue';

const showModal = ref(false);
</script>
