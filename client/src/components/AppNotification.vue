<!--
  LEARNING: Global Notification Component
  WHY: Provides app-wide snackbar notifications
  PATTERN: VSnackbar component that reads from useNotification composable
  COMPARISON: React uses Ant Design message. Vue uses VSnackbar
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

/**
 * LEARNING: Notification composable
 * WHY: Provides shared notification state and methods
 * PATTERN: useNotification composable with singleton state
 */
const { notification, showNotification, close } = useNotification()

/**
 * LEARNING: Computed message for proper reactivity tracking
 * WHY: Ensures slot content is tracked within render function
 * PATTERN: Computed property for slot content
 */
const message = computed(() => notification.value?.message || '')
const color = computed(() => notification.value?.color || 'info')
const timeout = computed(() => notification.value?.timeout || 4000)
</script>

<template>
  <!--
    LEARNING: VSnackbar component for notifications
    WHY: Provides toast-style notifications at the bottom of the screen
    PATTERN: VSnackbar with default slot for message (not text prop) to avoid slot invocation warning
    WHY: Using default slot instead of text prop ensures slot is invoked within render function for proper reactivity tracking
  -->
  <VSnackbar
    v-if="notification"
    v-model="showNotification"
    :color="color"
    :timeout="timeout"
    location="bottom"
    @update:model-value="(value) => !value && close()"
  >
    {{ message }}
    <template #actions="{ close: snackbarClose }">
      <VBtn
        icon="tabler-x"
        variant="text"
        density="comfortable"
        @click="() => { snackbarClose(); close() }"
      />
    </template>
  </VSnackbar>
</template>

<style scoped>
/* No custom styles needed - Vuexy components handle styling */
</style>

