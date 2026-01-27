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

// LEARNING: Register keyboard shortcut for toggling panel
// WHY: Provides quick access via Ctrl+Shift+D
// PATTERN: Add event listener on mount, remove on unmount
const handleKeyDown = (event: KeyboardEvent): void => {
  // Check for Ctrl+Shift+D (or Cmd+Shift+D on Mac)
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
    icon
    size="small"
    color="info"
    variant="elevated"
    class="dev-panel-toggle"
    @click="emit('toggle')"
  >
    <VIcon>tabler-bug</VIcon>
    <VTooltip activator="parent" location="left">
      Debug Panel (Ctrl+Shift+D)
    </VTooltip>
  </VBtn>
</template>

<style scoped lang="scss">
.dev-panel-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 960px) {
    bottom: 16px;
    right: 16px;
  }
}
</style>
