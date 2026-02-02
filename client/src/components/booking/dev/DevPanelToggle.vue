<script setup lang="ts">
/**
 * Dev Panel Toggle Component
 * 
 * LEARNING: Floating action button to toggle dev panel visibility
 * WHY: Provides easy access to debug panels from anywhere in the app
 * PATTERN: Fixed position FAB with keyboard shortcut support
 */

import { onMounted, onUnmounted } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'

interface Emits {
  (e: 'toggle'): void
}

const emit = defineEmits<Emits>()

const isDevMode = isDevModeEnabled()

const handleKeyDown = (event: KeyboardEvent): void => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault()
    emit('toggle')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <VBtn
    v-if="isDevMode"
    size="small"
    color="info"
    variant="elevated"
    class="dev-panel-toggle"
    @click.stop="emit('toggle')"
  >
    <span class="button-label">slot</span>
    <VTooltip activator="parent" location="left">
      Debug Panel (Ctrl+Shift+D)
    </VTooltip>
  </VBtn>
</template>

<style scoped lang="scss">
.dev-panel-toggle {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
  
  .button-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: lowercase;
  }
}
</style>
