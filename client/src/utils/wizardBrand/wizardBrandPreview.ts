/**
 * Preview palettes for admin brand anchors (aligns with `theme.ts` DHP defaults when unset).
 */
import type { WizardModePalette } from '@/plugins/5.vuetify/theme'
import { buildWizardModePaletteFromAnchors } from '@/utils/theme'
import { normalizeBrandHex } from './normalizeBrandHex'

/** Same defaults as `dhpPalette` / theme anchors for preview when DB fields are empty. */
const DEFAULT_BRAND_PRIMARY_ANCHOR = '#EED202' as const
const DEFAULT_BRAND_SECONDARY_ANCHOR = '#FF3333' as const

const HEX6 = /^#[0-9A-Fa-f]{6}$/

function resolvedAnchorHex(value: string | null | undefined, fallback: string): string {
  const n = normalizeBrandHex(value ?? '')
  return HEX6.test(n) ? n : fallback
}

export interface BrandPreviewPalettes {
  standard: WizardModePalette
  quote: WizardModePalette
  reschedule: WizardModePalette
}

/**
 * Builds standard / quote / reschedule wizard palettes from optional anchor hex (falls back to DHP defaults).
 */
export function buildBrandPreviewPalettes(
  primaryHex: string | null | undefined,
  secondaryHex: string | null | undefined
): BrandPreviewPalettes {
  const primary = resolvedAnchorHex(primaryHex, DEFAULT_BRAND_PRIMARY_ANCHOR)
  const secondary = resolvedAnchorHex(secondaryHex, DEFAULT_BRAND_SECONDARY_ANCHOR)
  return {
    standard: buildWizardModePaletteFromAnchors({ primary, secondary, mode: 'standard' }),
    quote: buildWizardModePaletteFromAnchors({ primary, secondary, mode: 'quote' }),
    reschedule: buildWizardModePaletteFromAnchors({ primary, secondary, mode: 'reschedule' }),
  }
}
