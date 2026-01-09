<script setup lang="ts">
/**
 * LEARNING: Use loading indicator composable
 * WHY: Extracts loading indicator logic from component to composable
 * PATTERN: Composable handles all progress state and handlers
 */
import { useLoadingIndicator } from '@/composables/useLoadingIndicator'

const {
  bufferValue,
  progressValue,
  showProgress,
  fallbackHandle,
  resolveHandle
} = useLoadingIndicator()

defineExpose({
  fallbackHandle,
  resolveHandle,
})
</script>

<template>
  <!-- loading state via #fallback slot -->
  <div
    v-if="showProgress"
    class="position-fixed"
    style="z-index: 9999; inset-block-start: 0; inset-inline: 0 0;"
  >
    <VProgressLinear
      v-model="progressValue"
      :buffer-value="bufferValue"
      color="primary"
      height="2"
      bg-color="background"
    />
  </div>
</template>
