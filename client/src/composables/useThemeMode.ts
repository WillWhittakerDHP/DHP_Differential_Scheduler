/**
 * Theme Mode Composable
 * 
 * LEARNING: Manages theme switching between normal and quote mode
 * WHY: Provides reactive theme colors based on quote mode state
 * PATTERN: Composable that watches isQuoteMode and provides theme color values
 * 
 * When quote mode is active, all primary/secondary/warning colors switch to quote variants
 */

import { computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import { quoteModeColors } from '@/plugins/5.vuetify/theme'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { setCSSVariable, removeCSSVariable } from '@/utils/dom/cssVariables'

/**
 * LEARNING: Theme mode composable
 * WHY: Provides reactive access to current theme colors based on quote mode
 * PATTERN: Watches isQuoteMode and provides computed color values
 * 
 * @param wizard - Wizard instance with isQuoteMode state (optional, can be injected if not provided)
 */
export function useThemeMode(wizard?: UseBookingWizardReturn) {
  const theme = useTheme()
  
  // LEARNING: Computed property for quote mode state
  // WHY: Provides reactive access to quote mode from wizard
  // PATTERN: Computed property that reads from wizard state
  // NOTE: If wizard not provided, will be undefined and quote mode will be false
  const isQuoteMode = computed(() => wizard?.isQuoteMode.value ?? false)
  
  // LEARNING: Computed properties for current theme colors
  // WHY: Returns quote mode colors when active, otherwise normal theme colors
  // PATTERN: Computed properties that switch based on isQuoteMode
  const currentPrimary = computed(() => {
    return isQuoteMode.value ? quoteModeColors.primary : theme.current.value.colors.primary
  })
  
  const currentSecondary = computed(() => {
    return isQuoteMode.value ? quoteModeColors.secondary : theme.current.value.colors.secondary
  })
  
  const currentWarning = computed(() => {
    return isQuoteMode.value ? quoteModeColors.warning : theme.current.value.colors.warning
  })
  
  // LEARNING: Watch isQuoteMode and update CSS variables
  // WHY: Ensures CSS variables are updated when quote mode changes
  // PATTERN: Watch computed property and update CSS variables via utility
  watch(isQuoteMode, (isActive) => {
    if (isActive) {
      // LEARNING: Set quote mode CSS variables
      // WHY: Override theme variables with quote mode colors
      // PATTERN: Convert hex colors to RGB format for CSS variables, use utility for DOM access
      setCSSVariable('--v-theme-primary', hexToRgb(quoteModeColors.primary))
      setCSSVariable('--v-theme-primary-darken-1', hexToRgb(quoteModeColors['primary-darken-1']))
      setCSSVariable('--v-theme-secondary', hexToRgb(quoteModeColors.secondary))
      setCSSVariable('--v-theme-secondary-darken-1', hexToRgb(quoteModeColors['secondary-darken-1']))
      setCSSVariable('--v-theme-warning', hexToRgb(quoteModeColors.warning))
      setCSSVariable('--v-theme-warning-darken-1', hexToRgb(quoteModeColors['warning-darken-1']))
      setCSSVariable('--v-theme-on-primary', quoteModeColors['on-primary'])
      setCSSVariable('--v-theme-on-secondary', quoteModeColors['on-secondary'])
      setCSSVariable('--v-theme-on-warning', quoteModeColors['on-warning'])
    } else {
      // LEARNING: Reset to normal theme colors
      // WHY: Restore normal colors when quote mode is disabled
      // PATTERN: Remove custom properties via utility to use default theme
      removeCSSVariable('--v-theme-primary')
      removeCSSVariable('--v-theme-primary-darken-1')
      removeCSSVariable('--v-theme-secondary')
      removeCSSVariable('--v-theme-secondary-darken-1')
      removeCSSVariable('--v-theme-warning')
      removeCSSVariable('--v-theme-warning-darken-1')
      removeCSSVariable('--v-theme-on-primary')
      removeCSSVariable('--v-theme-on-secondary')
      removeCSSVariable('--v-theme-on-warning')
    }
  }, { immediate: true })
  
  return {
    isQuoteMode,
    currentPrimary,
    currentSecondary,
    currentWarning
  }
}

/**
 * LEARNING: Convert hex color to RGB format for CSS variables
 * WHY: CSS variables need RGB format (r, g, b) for rgba() usage
 * PATTERN: Parse hex color and return comma-separated RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return '0, 0, 0' // Fallback to black
  }
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `${r}, ${g}, ${b}`
}
