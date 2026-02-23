<script setup lang="ts">

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
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.15);
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  max-height: 48px !important;
  border-radius: 50%;
  padding: 0 !important;
  
  :deep(.v-btn__content) {
    padding: 0 !important;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .button-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: lowercase;
    line-height: 1;
  }
  
  @media (max-width: 960px) {
    top: 16px;
    right: 16px;
  }
}
</style>
