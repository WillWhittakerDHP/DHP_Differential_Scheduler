<template>
  <!-- 
    WHY: Provides app-level layout, theming, and RTL support
    PATTERN: VLocaleProvider wraps app for RTL, VApp provides theme context
    COMPARISON: React uses ThemeProvider. Vue uses VApp with VLocaleProvider
  -->
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(String(global.current.value.colors.primary ?? ''))}`">
      <RouterView />
      <AppNotification />
      
      <!-- 
        Dev Panel System (dev mode only) 
        WHY: Wizard needs both booking debug panel and API debug panel
        PATTERN: Conditionally render based on route
      -->
      <!-- 
        Dev Panel System (dev mode only) 
        WHY: Wizard needs both booking debug panel and API debug panel
        PATTERN: Conditionally render based on route
      -->
      <template v-if="isDevMode && !isAdminRoute">
        <ApiDevPanel :visible="apiDevPanelVisible" @close="apiDevPanelVisible = false" />
        <DevPanelsContainer :visible="debugPanelVisible" @close="debugPanelVisible = false" />
        <DevPanelToggle @toggle="handleSlotPanelToggle" />
        <VBtn
          color="error"
          variant="elevated"
          class="wizard-api-toggle"
          @click="handleApiPanelToggle"
        >
          <span class="button-label">api</span>
          <VTooltip activator="parent" location="left" text="API Dev Panel" />
        </VBtn>
      </template>
    </VApp>
  </VLocaleProvider>
</template>

<script setup lang="ts">

import { useTheme } from 'vuetify'
import { ref, shallowRef, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNotification from '@/components/AppNotification.vue'
import DevPanelToggle from '@/components/booking/dev/DevPanelToggle.vue'
import DevPanelsContainer from '@/components/booking/dev/DevPanelsContainer.vue'
import ApiDevPanel from '@/components/admin/dev/ApiDevPanel.vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import type { DevPanelButtonsContext } from '@/types/booking/devPanelButtonsContext'
import { devPanelButtonsKey } from '@/keys/bookingInjectionKeys'

const { global } = useTheme()
const route = useRoute()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// WHY: Vuetify composables require Vue component context
initCore()
initConfigStore()

const configStore = useConfigStore()

/**
 * PATTERN: Only initialize shared/base composables at app root level
 */
import { useGlobal } from './composables/useGlobal'

useGlobal()

// PATTERN: Reactive ref passed as prop to DevPanelsContainer
const isDevMode = isDevModeEnabled()
const debugPanelVisible = ref(false)
const apiDevPanelVisible = ref(false)

const handleSlotPanelToggle = (): void => {
  if (apiDevPanelVisible.value) {
    apiDevPanelVisible.value = false
  }
  debugPanelVisible.value = !debugPanelVisible.value
}

const handleApiPanelToggle = (): void => {
  if (debugPanelVisible.value) {
    debugPanelVisible.value = false
  }
  apiDevPanelVisible.value = !apiDevPanelVisible.value
}

// WHY: shallowRef — ref<T>() applies UnwrapRef to T and would unwrap nested Refs inside DevPanelButtonsContext.
const devPanelButtons = shallowRef<DevPanelButtonsContext | null>(null)
provide(devPanelButtonsKey, devPanelButtons)
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}

.wizard-api-toggle {
  position: fixed;
  top: 72px; /* 24px (top) + 48px (button height + gap) */
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
}

.wizard-api-toggle .button-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: lowercase;
  line-height: 1;
}

@media (max-width: 960px) {
  .wizard-api-toggle {
    top: 64px; /* 16px (top) + 48px (button height + gap) */
    right: 16px;
  }
}
</style>
