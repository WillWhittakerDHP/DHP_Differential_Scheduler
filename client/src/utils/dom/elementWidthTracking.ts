/**
 * WHY: ResizeObserver + rAF scheduling for content width (useElementDimensions audit / FUNCTION playbook).
 */

import { getContentWidth } from '@/utils/dom/elementMeasure'

export function scheduleDoubleRaf(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

function measureAndPublish(
  getElement: () => HTMLElement | null | undefined,
  onPositiveWidth: (width: number) => void
): void {
  const el = getElement()
  if (!el) {
    return
  }
  const w = getContentWidth(el)
  if (w > 0) {
    onPositiveWidth(w)
  }
}

/**
 * After double rAF, measures element, observes resize, optional delayed re-measure.
 * @returns disconnect cleanup (safe if observer not yet created)
 */
export function startContentWidthTracking(
  getElement: () => HTMLElement | null | undefined,
  onPositiveWidth: (width: number) => void,
  options?: { lateRemeasureMs?: number }
): () => void {
  let resizeObserver: ResizeObserver | null = null

  const onResize = (): void => {
    measureAndPublish(getElement, onPositiveWidth)
  }

  scheduleDoubleRaf(() => {
    measureAndPublish(getElement, onPositiveWidth)

    const el = getElement()
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }

    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(el)

    const ms = options?.lateRemeasureMs ?? 200
    setTimeout(() => {
      measureAndPublish(getElement, onPositiveWidth)
    }, ms)
  })

  return (): void => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }
}

export function isBrowserResizeObserverSupported(): boolean {
  return typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined'
}
