/**
 * PATTERN: Theme Mode Composable

PATTERN: Composable that watches isQuoteMode and ...
 */
import { computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import { quoteModeColors } from '@/plugins/5.vuetify/theme'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { setCSSVariable, removeCSSVariable } from '@/utils/dom/cssVariables'

export interface UseThemeModeReturn {
  isQuoteMode: import('vue').ComputedRef<boolean>
  currentPrimary: import('vue').ComputedRef<string>
  currentSecondary: import('vue').ComputedRef<string>
  currentWarning: import('vue').ComputedRef<string>
}

/**
 * WHY: Theme mode composable

@param wizard - Wizard instance with isQuoteMode ...
 */
export function useThemeMode(wizard?: UseBookingWizardReturn): UseThemeModeReturn {
  const theme = useTheme()
  
  // LEARNING: Computed property for quote mode state
  // PATTERN: Computed property that reads from wizard state
  const isQuoteMode = computed(() => wizard?.isQuoteMode.value ?? false)
  
  // PATTERN: Computed properties that switch based on isQuoteMode
  const currentPrimary = computed(() =>
    String(isQuoteMode.value ? quoteModeColors.primary : theme.current.value.colors.primary)
  )
  const currentSecondary = computed(() =>
    String(isQuoteMode.value ? quoteModeColors.secondary : theme.current.value.colors.secondary)
  )
  const currentWarning = computed(() =>
    String(isQuoteMode.value ? quoteModeColors.warning : theme.current.value.colors.warning)
  )
  
  // PATTERN: Watch computed property and update CSS variables via utility
  watch(isQuoteMode, (isActive) => {
    if (isActive) {
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
 * WHY: Convert hex color to RGB format for CSS variables
WHY: CSS variables nee...
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return '0, 0, 0' // Default to black when hex parse fails
  }
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `${r}, ${g}, ${b}`
}
