/**
 * OKLCH helpers for wizard brand palettes (culori).
 * WHY: Perceptual adjustments (chroma/lightness/hue) stay consistent vs hand-tuned hex.
 */

import { converter, formatHex, parse } from 'culori'
import type { Color, Oklch } from 'culori'

const toOklch = converter('oklch')

const HEX_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i

function assertValidHex(hex: string): void {
  const t = hex.trim()
  if (!HEX_PATTERN.test(t)) {
    throw new Error(`Expected #RGB or #RRGGBB hex, got: ${hex}`)
  }
}

function toOklchStrict(parsed: Color): Oklch {
  const converted = toOklch(parsed)
  if (converted == null || converted.mode !== 'oklch') {
    throw new Error('Expected OKLCH color from culori converter')
  }
  return converted
}

function hexToOklchCore(hex: string): Oklch {
  assertValidHex(hex)
  const parsed = parse(hex.trim())
  if (parsed == null) {
    throw new Error(`Could not parse color: ${hex}`)
  }
  return toOklchStrict(parsed)
}

export function hexToOklch(hex: string): Oklch {
  return hexToOklchCore(hex)
}

export function oklchToHex(color: Oklch): string {
  const hex = formatHex(color)
  if (hex == null || hex === '') {
    throw new Error('formatHex returned empty for OKLCH color')
  }
  return hex
}

export function darkenOklch(color: Oklch, deltaL: number): Oklch {
  const nextL = Math.max(0, Math.min(1, color.l - deltaL))
  return { mode: 'oklch', l: nextL, c: color.c, h: color.h, alpha: color.alpha }
}

export function scaleChroma(color: Oklch, factor: number): Oklch {
  const nextC = Math.max(0, color.c * factor)
  return { mode: 'oklch', l: color.l, c: nextC, h: color.h, alpha: color.alpha }
}

/**
 * Shortest-path hue interpolation (degrees).
 */
export function mixHueToward(color: Oklch, targetHueDeg: number, t: number): Oklch {
  if (color.c < 0.001 || color.h === undefined) {
    return color
  }
  const a = color.h
  const b = targetHueDeg
  const diff = ((b - a + 540) % 360) - 180
  const h = (a + diff * t + 360) % 360
  return { mode: 'oklch', l: color.l, c: color.c, h, alpha: color.alpha }
}

/**
 * Rotate OKLCH hue by `deltaDeg` (wrap 0–360). Achromatic colors are unchanged.
 */
export function rotateHueOklch(color: Oklch, deltaDeg: number): Oklch {
  if (color.c < 0.001 || color.h === undefined) {
    return color
  }
  const h = (color.h + deltaDeg + 360) % 360
  return { mode: 'oklch', l: color.l, c: color.c, h, alpha: color.alpha }
}

/**
 * Pick on-surface text for a background using OKLCH lightness (perceptual).
 */
export function pickOnColorForBackground(bgHex: string): '#000000' | '#FFFFFF' {
  const o = hexToOklchCore(bgHex)
  return o.l >= 0.55 ? '#000000' : '#FFFFFF'
}
