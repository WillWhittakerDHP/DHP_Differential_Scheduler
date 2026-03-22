/**
 * PATTERN: Theme Mode Composable
 * Watches wizardMode and useDhpColors; applies quote/reschedule/DHP palettes and sets --v-theme-* CSS vars.
 */
import { computed, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useTheme } from 'vuetify'
import {
  quoteModeColors,
  rescheduleModeColors,
  dhpPalette,
} from '@/plugins/5.vuetify/theme'
import type { WizardModePalette } from '@/plugins/5.vuetify/theme'
import type { UseBookingWizardReturn } from '@/types/wizard'
import type { WizardMode } from '@/types/wizard'
import { setCSSVariable, removeCSSVariable } from '@/utils/dom/cssVariables'

/** Named constants instead of inline nullish coalescing (deprecation audit). */
const FALLBACK_THEME_COLORS: Record<string, string> = {}
const FALLBACK_STR = ''

const THEME_VAR_KEYS = [
  '--v-theme-primary',
  '--v-theme-primary-darken-1',
  '--v-theme-secondary',
  '--v-theme-secondary-darken-1',
  '--v-theme-warning',
  '--v-theme-warning-darken-1',
  '--v-theme-on-primary',
  '--v-theme-on-secondary',
  '--v-theme-on-warning',
] as const

function applyPaletteToCss(palette: WizardModePalette): void {
  setCSSVariable('--v-theme-primary', hexToRgb(palette.primary))
  setCSSVariable('--v-theme-primary-darken-1', hexToRgb(palette['primary-darken-1']))
  setCSSVariable('--v-theme-secondary', hexToRgb(palette.secondary))
  setCSSVariable('--v-theme-secondary-darken-1', hexToRgb(palette['secondary-darken-1']))
  setCSSVariable('--v-theme-warning', hexToRgb(palette.warning))
  setCSSVariable('--v-theme-warning-darken-1', hexToRgb(palette['warning-darken-1']))
  setCSSVariable('--v-theme-on-primary', palette['on-primary'])
  setCSSVariable('--v-theme-on-secondary', palette['on-secondary'])
  setCSSVariable('--v-theme-on-warning', palette['on-warning'])
}

function clearThemeOverrides(): void {
  for (const key of THEME_VAR_KEYS) {
    removeCSSVariable(key)
  }
}

export interface UseThemeModeReturn {
  isQuoteMode: import('vue').ComputedRef<boolean>
  isRescheduleMode: import('vue').ComputedRef<boolean>
  currentPrimary: import('vue').ComputedRef<string>
  currentSecondary: import('vue').ComputedRef<string>
  currentWarning: import('vue').ComputedRef<string>
}

export interface UseThemeModeOptions {
  wizard?: UseBookingWizardReturn
  /** When true, use DHP palette. Can be Ref (wizard local) or ComputedRef (from useWizardSettings().flags/API). */
  useDhpColors?: Ref<boolean> | ComputedRef<boolean>
}

/**
 * Resolves the palette to apply: DHP variant for current mode, or default theme/quote/reschedule.
 */
function resolvePalette(
  wizardMode: WizardMode,
  useDhp: boolean,
  _themePrimary: string,
  _themeSecondary: string,
  _themeWarning: string
): WizardModePalette | null {
  if (useDhp) {
    const key = wizardMode === 'new' ? 'standard' : wizardMode
    return dhpPalette[key]
  }
  if (wizardMode === 'quote') return quoteModeColors
  if (wizardMode === 'reschedule') return rescheduleModeColors
  return null
}

/**
 * WHY: Theme mode composable. Applies wizard-mode palettes (quote/reschedule) or DHP palette when toggled.
 * @param options.wizard - Wizard instance with wizardMode
 * @param options.useDhpColors - When true, use DHP (yellow/red/black) palette for current mode
 */
export function useThemeMode(options?: UseThemeModeOptions): UseThemeModeReturn {
  const wizard = options?.wizard
  const useDhpColorsRef = options?.useDhpColors

  const theme = useTheme()
  const wizardMode = computed<WizardMode>(() => wizard?.wizardMode.value ?? 'new')
  const useDhpColors = computed(() => useDhpColorsRef?.value ?? false)

  const isQuoteMode = computed(() => wizardMode.value === 'quote')
  const isRescheduleMode = computed(() => wizardMode.value === 'reschedule')

  const resolvedPalette = computed(() => {
    const mode = wizardMode.value
    const useDhp = useDhpColors.value
    const themeColors = theme.current.value?.colors ?? FALLBACK_THEME_COLORS
    const primary = String(themeColors.primary ?? FALLBACK_STR)
    const secondary = String(themeColors.secondary ?? FALLBACK_STR)
    const warning = String(themeColors.warning ?? FALLBACK_STR)
    return resolvePalette(mode, useDhp, primary, secondary, warning)
  })

  const currentPrimary = computed(() => {
    const palette = resolvedPalette.value
    if (palette) return palette.primary
    return String(theme.current.value?.colors?.primary ?? FALLBACK_STR)
  })
  const currentSecondary = computed(() => {
    const palette = resolvedPalette.value
    if (palette) return palette.secondary
    return String(theme.current.value?.colors?.secondary ?? FALLBACK_STR)
  })
  const currentWarning = computed(() => {
    const palette = resolvedPalette.value
    if (palette) return palette.warning
    return String(theme.current.value?.colors?.warning ?? FALLBACK_STR)
  })

  watch(
    [wizardMode, useDhpColors, resolvedPalette],
    () => {
      const palette = resolvedPalette.value
      if (palette) {
        applyPaletteToCss(palette)
      } else {
        clearThemeOverrides()
      }
    },
    { immediate: true }
  )

  return {
    isQuoteMode,
    isRescheduleMode,
    currentPrimary,
    currentSecondary,
    currentWarning,
  }
}

/**
 * WHY: Convert hex color to RGB format for CSS variables (r, g, b).
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return '0, 0, 0'
  }
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `${r}, ${g}, ${b}`
}
