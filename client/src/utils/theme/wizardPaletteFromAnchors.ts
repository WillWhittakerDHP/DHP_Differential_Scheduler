/**
 * Builds a WizardModePalette from DHP-style anchor colors and wizard mode.
 * Session 6.13.1.1 — pure module; theme.ts wiring is 6.13.1.2.
 */

import type { WizardModePalette } from '../../plugins/5.vuetify/theme'
import {
  darkenOklch,
  hexToOklch,
  oklchToHex,
  pickOnColorForBackground,
  rotateHueOklch,
  scaleChroma,
} from './colorMath'
import type { Oklch } from 'culori'
import type { WizardSettingsData } from '@shared/types/wizardSettingsTypes'

export type WizardBrandMode = 'standard' | 'quote' | 'reschedule'

/** Resolved quote/reschedule OKLCH transforms (fraction of hue circle + chroma multipliers). */
export interface BrandModePaletteDeltas {
  quoteHueCircleFraction: number
  quoteChromaFactor: number
  rescheduleHueCircleFraction: number
  rescheduleChromaFactor: number
}

export const DEFAULT_BRAND_MODE_PALETTE_DELTAS: BrandModePaletteDeltas = {
  quoteHueCircleFraction: 0.2,
  quoteChromaFactor: 0.8,
  rescheduleHueCircleFraction: 0.2,
  rescheduleChromaFactor: 1.2,
}

/** Extra OKLCH transform for the warning token (applied after quote/reschedule mode on secondary). */
export interface BrandWarningPaletteAdjusters {
  warningHueCircleFraction: number
  warningChromaFactor: number
}

export const DEFAULT_BRAND_WARNING_PALETTE_ADJUSTERS: BrandWarningPaletteAdjusters = {
  warningHueCircleFraction: 0,
  warningChromaFactor: 1,
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  return Math.min(max, Math.max(min, value))
}

/**
 * Merges partial admin/API values with defaults; clamps to safe ranges.
 */
export function mergeBrandModePaletteDeltas(
  partial?: Partial<BrandModePaletteDeltas> | null
): BrandModePaletteDeltas {
  const d = DEFAULT_BRAND_MODE_PALETTE_DELTAS
  return {
    quoteHueCircleFraction: clampNumber(partial?.quoteHueCircleFraction, d.quoteHueCircleFraction, 0, 1),
    quoteChromaFactor: clampNumber(partial?.quoteChromaFactor, d.quoteChromaFactor, 0.05, 2.5),
    rescheduleHueCircleFraction: clampNumber(
      partial?.rescheduleHueCircleFraction,
      d.rescheduleHueCircleFraction,
      0,
      1
    ),
    rescheduleChromaFactor: clampNumber(
      partial?.rescheduleChromaFactor,
      d.rescheduleChromaFactor,
      0.05,
      2.5
    ),
  }
}

/** Maps persisted wizard_settings fields to resolved deltas. */
export function resolveBrandModePaletteDeltasFromWizardSettings(
  data:
    | Pick<
        WizardSettingsData,
        | 'brandQuoteHueCircleFraction'
        | 'brandQuoteChromaFactor'
        | 'brandRescheduleHueCircleFraction'
        | 'brandRescheduleChromaFactor'
      >
    | null
    | undefined
): BrandModePaletteDeltas {
  return mergeBrandModePaletteDeltas({
    quoteHueCircleFraction: data?.brandQuoteHueCircleFraction ?? undefined,
    quoteChromaFactor: data?.brandQuoteChromaFactor ?? undefined,
    rescheduleHueCircleFraction: data?.brandRescheduleHueCircleFraction ?? undefined,
    rescheduleChromaFactor: data?.brandRescheduleChromaFactor ?? undefined,
  })
}

export function mergeBrandWarningPaletteAdjusters(
  partial?: Partial<BrandWarningPaletteAdjusters> | null
): BrandWarningPaletteAdjusters {
  const d = DEFAULT_BRAND_WARNING_PALETTE_ADJUSTERS
  return {
    warningHueCircleFraction: clampNumber(
      partial?.warningHueCircleFraction,
      d.warningHueCircleFraction,
      0,
      1
    ),
    warningChromaFactor: clampNumber(partial?.warningChromaFactor, d.warningChromaFactor, 0.05, 2.5),
  }
}

export function resolveBrandWarningPaletteAdjustersFromWizardSettings(
  data:
    | Pick<WizardSettingsData, 'brandWarningHueCircleFraction' | 'brandWarningChromaFactor'>
    | null
    | undefined
): BrandWarningPaletteAdjusters {
  return mergeBrandWarningPaletteAdjusters({
    warningHueCircleFraction: data?.brandWarningHueCircleFraction ?? undefined,
    warningChromaFactor: data?.brandWarningChromaFactor ?? undefined,
  })
}

export interface BuildWizardModePaletteParams {
  primary: string
  secondary: string
  mode: WizardBrandMode
  /** When omitted, {@link DEFAULT_BRAND_MODE_PALETTE_DELTAS} apply. */
  deltas?: Partial<BrandModePaletteDeltas> | null
  /** When omitted, warning matches mode-adjusted secondary (legacy). */
  warningAdjusters?: Partial<BrandWarningPaletteAdjusters> | null
}

/** ΔL for *-darken-1 steps (OKLCH L is 0–1). */
const DARKEN_DELTA_L = 0.07

function applyMode(
  primary: Oklch,
  secondary: Oklch,
  mode: WizardBrandMode,
  deltas: BrandModePaletteDeltas
): {
  p: Oklch
  s: Oklch
} {
  if (mode === 'standard') {
    return { p: primary, s: secondary }
  }
  if (mode === 'quote') {
    const turnDeg = deltas.quoteHueCircleFraction * 360
    return {
      p: rotateHueOklch(scaleChroma(primary, deltas.quoteChromaFactor), turnDeg),
      s: rotateHueOklch(scaleChroma(secondary, deltas.quoteChromaFactor), turnDeg),
    }
  }
  const turnDeg = deltas.rescheduleHueCircleFraction * 360
  return {
    p: rotateHueOklch(scaleChroma(primary, deltas.rescheduleChromaFactor), -turnDeg),
    s: rotateHueOklch(scaleChroma(secondary, deltas.rescheduleChromaFactor), -turnDeg),
  }
}

function applyWarningFromSecondary(secondaryOklch: Oklch, adj: BrandWarningPaletteAdjusters): Oklch {
  const turnDeg = adj.warningHueCircleFraction * 360
  return rotateHueOklch(scaleChroma(secondaryOklch, adj.warningChromaFactor), turnDeg)
}

/**
 * Returns a full wizard palette for the given anchors. Warning starts from mode-adjusted secondary, then optional warning adjusters.
 */
export function buildWizardModePaletteFromAnchors(params: BuildWizardModePaletteParams): WizardModePalette {
  const merged = mergeBrandModePaletteDeltas(params.deltas)
  const mergedWarning = mergeBrandWarningPaletteAdjusters(params.warningAdjusters)
  const p0 = hexToOklch(params.primary)
  const s0 = hexToOklch(params.secondary)
  const { p, s } = applyMode(p0, s0, params.mode, merged)

  const w = applyWarningFromSecondary(s, mergedWarning)

  const pHex = oklchToHex(p)
  const sHex = oklchToHex(s)
  const pDarkHex = oklchToHex(darkenOklch(p, DARKEN_DELTA_L))
  const sDarkHex = oklchToHex(darkenOklch(s, DARKEN_DELTA_L))

  const warning = oklchToHex(w)
  const warningDark = oklchToHex(darkenOklch(w, DARKEN_DELTA_L))

  return {
    primary: pHex,
    'on-primary': pickOnColorForBackground(pHex),
    'primary-darken-1': pDarkHex,
    secondary: sHex,
    'on-secondary': pickOnColorForBackground(sHex),
    'secondary-darken-1': sDarkHex,
    warning,
    'on-warning': pickOnColorForBackground(warning),
    'warning-darken-1': warningDark,
  }
}
