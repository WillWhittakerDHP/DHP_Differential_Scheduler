<!--
  LEARNING: Global Notification Component
  WHY: Provides app-wide snackbar notifications
  PATTERN: VSnackbar component that reads from useNotification composable
  COMPARISON: React uses Ant Design message. Vue uses VSnackbar
-->
<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

/**
 * LEARNING: Notification composable
 * WHY: Provides shared notification state and methods
 * PATTERN: useNotification composable with singleton state
 */
const { notification, showNotification, close } = useNotification()
</script>

<template>
  <!--
    LEARNING: VSnackbar component for notifications
    WHY: Provides toast-style notifications at the bottom of the screen
    PATTERN: VSnackbar with v-model binding and dynamic color
  -->
  <VSnackbar
    v-model="showNotification"
    :color="notification?.color || 'info'"
    :timeout="notification?.timeout || 4000"
    location="bottom"
    @update:model-value="(value) => !value && close()"
  >
    {{ notification?.message || '' }}
    
    <template #actions>
      <VBtn
        icon="tabler-x"
        variant="text"
        @click="close"
      />
    </template>
  </VSnackbar>
</template>

<style scoped>
/* No custom styles needed - Vuexy components handle styling */
</style>

