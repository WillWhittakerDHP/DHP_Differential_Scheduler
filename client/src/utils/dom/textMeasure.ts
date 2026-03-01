/**
 * Measure the pixel width of the longest string in a list using canvas measureText.
 * SSR-safe: returns 0 when document/window or canvas is unavailable.
 *
 * @param labels - Text strings to measure (e.g. option labels)
 * @param font - CSS font shorthand; defaults to a value close to Vuetify field input (16px Roboto)
 * @returns Width in pixels of the longest label, or 0 if measurement is not possible
 */
export function measureMaxTextWidth(
  labels: string[],
  font = '16px Roboto, sans-serif'
): number {
  if (typeof document === 'undefined' || labels.length === 0) return 0
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  const widths = labels.map((text) => ctx.measureText(text).width)
  return Math.max(0, ...widths)
}
