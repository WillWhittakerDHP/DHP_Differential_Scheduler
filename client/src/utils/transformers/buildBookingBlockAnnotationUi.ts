import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { isAnnotationUiSlot, type AnnotationUiSlot } from '@shared/constants/annotationSlots'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/types/transformers/globalData'
import type { BookingAnnotationUiCandidate, BookingBlockAnnotationUi } from '@/types/transformers/bookingData'
import { nilToEmptyArray } from '@shared/utils/nilDefaults'

function normalizeContentRows(
  raw: unknown
): Array<{ text: string; userTypeBlockInstanceId: string | null }> | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined
  }
  const out: Array<{ text: string; userTypeBlockInstanceId: string | null }> = []
  for (const row of raw) {
    if (row === null || typeof row !== 'object') {
      continue
    }
    const r = row as Record<string, unknown>
    const text = typeof r.text === 'string' ? r.text : ''
    const utRaw = r.userTypeBlockInstanceId ?? r.user_type_block_instance_id
    const userTypeBlockInstanceId =
      utRaw === null || utRaw === undefined ? null : typeof utRaw === 'string' ? utRaw : null
    out.push({ text, userTypeBlockInstanceId })
  }
  return out.length > 0 ? out : undefined
}

/**
 * Build per-block annotation UI metadata for the booking transformer from global entities + flat assignment edges.
 */
export function buildBookingBlockAnnotationUi(
  blockInstanceId: string,
  data: GlobalData
): BookingBlockAnnotationUi | undefined {
  const edges = nilToEmptyArray(data.annotationAssignmentEdges).filter(
    (e) => String(e.blockInstanceId) === blockInstanceId
  )
  if (edges.length === 0) {
    return undefined
  }

  const annInstances = data.entities.annotationInstance as GlobalEntity<'annotationInstance'>[]
  const annById = new Map<string, GlobalEntity<'annotationInstance'>>(
    annInstances.map((a) => [String(a.id), a])
  )
  const shapeEntities = data.entities.annotationShape as GlobalEntity<'annotationShape'>[]
  const shapeById = new Map<string, GlobalEntity<'annotationShape'>>(
    shapeEntities.map((s) => [String(s.id), s])
  )

  const candidates: BookingAnnotationUiCandidate[] = []
  const sorted = [...edges].sort((a, b) => a.orderIndex - b.orderIndex)

  for (const edge of sorted) {
    const ann = annById.get(String(edge.annotationInstanceId))
    if (!ann) {
      continue
    }
    const typeRef = ann.type
    const shape =
      typeof typeRef === 'string' ? shapeById.get(typeRef as GlobalEntityId) : undefined
    const rawSlot = shape?.uiSlot
    if (rawSlot === null || rawSlot === undefined || !isAnnotationUiSlot(rawSlot)) {
      continue
    }
    const uiSlot: AnnotationUiSlot = rawSlot
    const text = typeof ann.text === 'string' ? ann.text : ''
    const contentRows = normalizeContentRows(
      (ann as GlobalEntity<'annotationInstance'> & { contentRows?: unknown }).contentRows
    )

    candidates.push({
      orderIndex: edge.orderIndex,
      uiSlot,
      assignmentUserTypeFilter: edge.userTypeBlockInstanceId,
      text,
      contentRows,
    })
  }

  if (candidates.length === 0) {
    return undefined
  }
  return { candidates }
}
