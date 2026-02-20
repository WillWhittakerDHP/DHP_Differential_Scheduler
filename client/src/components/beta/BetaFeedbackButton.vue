<!--
  LEARNING: Floating action button to open beta feedback modal (wizard only)
  WHY: Low-friction way for testers to submit feedback from any wizard step
  PATTERN: Fixed position, bottom-right; icon + tooltip
-->
<template>
  <VBtn
    class="beta-feedback-fab"
    icon="tabler-message-report"
    variant="elevated"
    color="primary"
    @click="$emit('click')"
  >
    <VTooltip activator="parent" location="left">
      Submit Feedback
    </VTooltip>
  </VBtn>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'click'): void }>();
</script>

<style scoped>
.beta-feedback-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.15);
}

@media (max-width: 960px) {
  .beta-feedback-fab {
    bottom: 16px;
    right: 16px;
  }
}
</style>
