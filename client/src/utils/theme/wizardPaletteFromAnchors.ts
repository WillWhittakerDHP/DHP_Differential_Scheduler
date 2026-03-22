/**
 * Builds a WizardModePalette from DHP-style anchor colors and wizard mode.
 * Session 6.13.1.1 — pure module; theme.ts wiring is 6.13.1.2.
 */

import type { WizardModePalette } from '../../plugins/5.vuetify/theme'
import {
  darkenOklch,
  hexToOklch,
  mixHueToward,
  oklchToHex,
  pickOnColorForBackground,
  scaleChroma,
} from './colorMath'
import type { Oklch } from 'culori'

export type WizardBrandMode = 'standard' | 'quote' | 'reschedule'

export interface BuildWizardModePaletteParams {
  primary: string
  secondary: string
  mode: WizardBrandMode
}

/** ΔL for *-darken-1 steps (OKLCH L is 0–1). */
const DARKEN_DELTA_L = 0.07

/** Quote: “20% less vibrant” → chroma scale. */
const QUOTE_CHROMA_SCALE = 0.8

/** Reschedule: slightly muted + hue nudges toward teal / blue. */
const RESCHEDULE_CHROMA_SCALE = 0.88
const RESCHEDULE_PRIMARY_HUE_TARGET = 175
const RESCHEDULE_PRIMARY_HUE_MIX = 0.32
const RESCHEDULE_SECONDARY_HUE_TARGET = 248
const RESCHEDULE_SECONDARY_HUE_MIX = 0.22

function applyMode(primary: Oklch, secondary: Oklch, mode: WizardBrandMode): {
  p: Oklch
  s: Oklch
} {
  if (mode === 'standard') {
    return { p: primary, s: secondary }
  }
  if (mode === 'quote') {
    return {
      p: scaleChroma(primary, QUOTE_CHROMA_SCALE),
      s: scaleChroma(secondary, QUOTE_CHROMA_SCALE),
    }
  }
  return {
    p: mixHueToward(scaleChroma(primary, RESCHEDULE_CHROMA_SCALE), RESCHEDULE_PRIMARY_HUE_TARGET, RESCHEDULE_PRIMARY_HUE_MIX),
    s: mixHueToward(scaleChroma(secondary, RESCHEDULE_CHROMA_SCALE), RESCHEDULE_SECONDARY_HUE_TARGET, RESCHEDULE_SECONDARY_HUE_MIX),
  }
}

/**
 * Returns a full wizard palette for the given anchors. Warning tracks secondary (DHP pattern).
 */
export function buildWizardModePaletteFromAnchors(params: BuildWizardModePaletteParams): WizardModePalette {
  const p0 = hexToOklch(params.primary)
  const s0 = hexToOklch(params.secondary)
  const { p, s } = applyMode(p0, s0, params.mode)

  const pHex = oklchToHex(p)
  const sHex = oklchToHex(s)
  const pDarkHex = oklchToHex(darkenOklch(p, DARKEN_DELTA_L))
  const sDarkHex = oklchToHex(darkenOklch(s, DARKEN_DELTA_L))

  const warning = sHex
  const warningDark = sDarkHex

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
