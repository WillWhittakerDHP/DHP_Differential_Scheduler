/**
 * Sample two colors from a rasterized image for brand primary/secondary anchors.
 * WHY: Session 6.15.2 — client-side extraction without extra deps (Canvas + createImageBitmap).
 */

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => n.toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}

function sampleRgb(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): { r: number; g: number; b: number } {
  const sx = Math.max(0, Math.min(x, width - 1))
  const sy = Math.max(0, Math.min(y, height - 1))
  const i = (sy * width + sx) * 4
  return { r: data[i], g: data[i + 1], b: data[i + 2] }
}

/**
 * Returns two hex anchors from an image file, or null if the environment cannot rasterize (no canvas).
 */
export async function extractAnchorsFromImageFile(
  file: File
): Promise<{ primary: string; secondary: string } | null> {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return null
  }
  const bitmap = await createImageBitmap(file)
  try {
    const maxSide = 96
    const w = Math.min(bitmap.width, maxSide)
    const h = Math.min(bitmap.height, maxSide)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }
    ctx.drawImage(bitmap, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const p1 = sampleRgb(data, w, h, Math.floor(w * 0.25), Math.floor(h * 0.25))
    const p2 = sampleRgb(data, w, h, Math.floor(w * 0.75), Math.floor(h * 0.75))
    return {
      primary: rgbToHex(p1.r, p1.g, p1.b),
      secondary: rgbToHex(p2.r, p2.g, p2.b),
    }
  } finally {
    bitmap.close()
  }
}
