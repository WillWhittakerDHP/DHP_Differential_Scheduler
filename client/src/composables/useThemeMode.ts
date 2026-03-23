/**
 * PATTERN: Theme Mode Composable
 * Watches wizardMode and useDhpColors; applies quote/reschedule/DHP palettes via --wizard-* CSS vars.
 * SCSS (.wizard-palette-active) maps --wizard-* to --v-theme-* at component level for Vuetify specificity.
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
import { buildWizardModePaletteFromAnchors, type WizardBrandMode } from '@/utils/theme'
import { normalizeBrandHex } from '@/utils/wizardBrand/normalizeBrandHex'
import { setCSSVariable, removeCSSVariable } from '@/utils/dom/cssVariables'

/** Named constants instead of inline nullish coalescing (deprecation audit). */
const FALLBACK_THEME_COLORS: Record<string, string> = {}
const FALLBACK_STR = ''

/** Intermediate vars that bypass Vuetify's theme provider specificity. SCSS maps these to --v-theme-* at component level. */
const WIZARD_VAR_KEYS = [
  '--wizard-primary',
  '--wizard-primary-darken-1',
  '--wizard-secondary',
  '--wizard-secondary-darken-1',
  '--wizard-warning',
  '--wizard-warning-darken-1',
  '--wizard-on-primary',
  '--wizard-on-secondary',
  '--wizard-on-warning',
] as const

function applyPaletteToCss(palette: WizardModePalette): void {
  setCSSVariable('--wizard-primary', hexToRgb(palette.primary))
  setCSSVariable('--wizard-primary-darken-1', hexToRgb(palette['primary-darken-1']))
  setCSSVariable('--wizard-secondary', hexToRgb(palette.secondary))
  setCSSVariable('--wizard-secondary-darken-1', hexToRgb(palette['secondary-darken-1']))
  setCSSVariable('--wizard-warning', hexToRgb(palette.warning))
  setCSSVariable('--wizard-warning-darken-1', hexToRgb(palette['warning-darken-1']))
  setCSSVariable('--wizard-on-primary', hexToRgb(palette['on-primary']))
  setCSSVariable('--wizard-on-secondary', hexToRgb(palette['on-secondary']))
  setCSSVariable('--wizard-on-warning', hexToRgb(palette['on-warning']))
}

function clearThemeOverrides(): void {
  for (const key of WIZARD_VAR_KEYS) {
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

interface UseThemeModeOptions {
  wizard?: UseBookingWizardReturn
  /** When true, use DHP palette. Can be Ref (wizard local) or ComputedRef (from useWizardSettings().flags/API). */
  useDhpColors?: Ref<boolean> | ComputedRef<boolean>
  /** Admin-configured anchors from GET /wizard-settings; when missing or invalid, `dhpPalette` defaults apply. */
  brandPrimaryHex?: Ref<string | null> | ComputedRef<string | null>
  brandSecondaryHex?: Ref<string | null> | ComputedRef<string | null>
}

const HEX6_ANCHOR = /^#[0-9A-Fa-f]{6}$/

function isUsableAnchorHex(raw: string | null | undefined): boolean {
  if (raw == null || raw.trim() === '') {
    return false
  }
  const n = normalizeBrandHex(raw)
  return HEX6_ANCHOR.test(n)
}

/**
 * DHP path: API anchors when both valid hex; else static `dhpPalette` for the mode (session 6.15.3.1).
 */
function resolveDhpPaletteForMode(
  modeKey: WizardBrandMode,
  primaryRaw: string | null | undefined,
  secondaryRaw: string | null | undefined
): WizardModePalette {
  if (isUsableAnchorHex(primaryRaw) && isUsableAnchorHex(secondaryRaw)) {
    return buildWizardModePaletteFromAnchors({
      primary: normalizeBrandHex(primaryRaw!),
      secondary: normalizeBrandHex(secondaryRaw!),
      mode: modeKey,
    })
  }
  return dhpPalette[modeKey]
}

/**
 * Resolves the palette to apply: DHP variant for current mode, or default theme/quote/reschedule.
 */
function resolvePalette(
  wizardMode: WizardMode,
  useDhp: boolean,
  primaryAnchor: string | null | undefined,
  secondaryAnchor: string | null | undefined,
  _themePrimary: string,
  _themeSecondary: string,
  _themeWarning: string
): WizardModePalette | null {
  if (useDhp) {
    const key: WizardBrandMode = wizardMode === 'new' ? 'standard' : wizardMode
    return resolveDhpPaletteForMode(key, primaryAnchor, secondaryAnchor)
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
  const brandPrimaryRef = options?.brandPrimaryHex
  const brandSecondaryRef = options?.brandSecondaryHex

  const theme = useTheme()
  const wizardMode = computed<WizardMode>(() => wizard?.wizardMode.value ?? 'new')
  const useDhpColors = computed(() => useDhpColorsRef?.value ?? false)
  const brandPrimaryHex = computed(() => brandPrimaryRef?.value ?? null)
  const brandSecondaryHex = computed(() => brandSecondaryRef?.value ?? null)

  const isQuoteMode = computed(() => wizardMode.value === 'quote')
  const isRescheduleMode = computed(() => wizardMode.value === 'reschedule')

  const resolvedPalette = computed(() => {
    const mode = wizardMode.value
    const useDhp = useDhpColors.value
    const themeColors = theme.current.value?.colors ?? FALLBACK_THEME_COLORS
    const primary = String(themeColors.primary ?? FALLBACK_STR)
    const secondary = String(themeColors.secondary ?? FALLBACK_STR)
    const warning = String(themeColors.warning ?? FALLBACK_STR)
    return resolvePalette(
      mode,
      useDhp,
      brandPrimaryHex.value,
      brandSecondaryHex.value,
      primary,
      secondary,
      warning
    )
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

/** Converts 3- or 6-char hex to Vuetify-compatible RGB triplet (e.g. "255, 255, 255"). */
function hexToRgb(hex: string): string {
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex)
  if (short) {
    return `${parseInt(short[1] + short[1], 16)}, ${parseInt(short[2] + short[2], 16)}, ${parseInt(short[3] + short[3], 16)}`
  }
  const full = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!full) {
    return '0, 0, 0'
  }
  return `${parseInt(full[1], 16)}, ${parseInt(full[2], 16)}, ${parseInt(full[3], 16)}`
}
