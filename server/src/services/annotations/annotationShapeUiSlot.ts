import {
  isAnnotationUiSlot,
  parseAnnotationUiSlotInput,
} from '@shared/constants/annotationSlots.js'

export type AnnotationShapeWriteNormalizeResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string }

/**
 * Copies payload, maps ui_slot → uiSlot, normalizes empty to null, rejects unknown slot values.
 */
export function normalizeAnnotationShapeWritePayload(
  input: Record<string, unknown>
): AnnotationShapeWriteNormalizeResult {
  const data = { ...input }
  if ('ui_slot' in data) {
    const snake = data.ui_slot
    delete data.ui_slot
    if (!('uiSlot' in data) || data.uiSlot === undefined) {
      data.uiSlot = snake
    }
  }

  if (!('uiSlot' in data)) {
    return { ok: true, data }
  }

  const raw = data.uiSlot
  const parsed = parseAnnotationUiSlotInput(raw)
  if (parsed === null) {
    data.uiSlot = null
    return { ok: true, data }
  }
  if (!isAnnotationUiSlot(parsed)) {
    return {
      ok: false,
      message: `Invalid uiSlot "${parsed}". Must be one of the registered annotation UI slots or empty.`,
    }
  }
  data.uiSlot = parsed
  return { ok: true, data }
}
