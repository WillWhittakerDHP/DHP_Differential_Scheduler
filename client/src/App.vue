<template>
  <!-- 
    LEARNING: Vuexy App component with theme and RTL support
    WHY: Provides app-level layout, theming, and RTL support
    PATTERN: VLocaleProvider wraps app for RTL, VApp provides theme context
    COMPARISON: React uses ThemeProvider. Vue uses VApp with VLocaleProvider
  -->
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <ScrollToTop />
      <AppNotification />
    </VApp>
  </VLocaleProvider>
</template>

<script setup lang="ts">
/**
 * App Root Component - Vuexy Integration
 * 
 * LEARNING: Root component with Vuexy layout system
 * WHY: Provides app-level structure, theme, and router outlet
 * PATTERN: Uses Vuexy's VApp, VLocaleProvider, and ScrollToTop components
 * COMPARISON: React App.tsx. Vue App.vue with Vuexy components
 */

import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import AppNotification from '@/components/AppNotification.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
// LEARNING: initCore and initConfigStore must be called in setup function for useTheme to work
// WHY: Vuetify composables require Vue component context
// PATTERN: Call initialization functions in component setup, not in main.ts
initCore()
initConfigStore()

const configStore = useConfigStore()

/**
 * WHY: Initializing here ensures global data is available before route-specific contexts initialize
 * PATTERN: Only initialize shared/base composables at app root level
 */
import { useGlobal } from './composables/useGlobal'

// Initialize global singleton - route-specific composables initialize in their views
useGlobal()
</script>

<style>
/* Global styles */
#app {
  width: 100%;
  min-height: 100vh;
}
</style>

