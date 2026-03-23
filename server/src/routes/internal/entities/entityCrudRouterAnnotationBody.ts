import type { Response } from 'express'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { normalizeAnnotationShapeWritePayload } from '../../../services/annotations/annotationShapeUiSlot.js'
import { sendBadRequest } from '../../helpers/routerResponseHelpers.js'
import type { AnnotationContentRow } from '@shared/types/annotationContentRow.js'

export function pullAnnotationContentRowsFromBody(body: Record<string, unknown>): {
  rows: AnnotationContentRow[] | undefined
  rest: Record<string, unknown>
} {
  const rest = { ...body }
  const raw = rest.contentRows
  delete rest.contentRows
  if (raw === undefined) {
    return { rows: undefined, rest }
  }
  if (!Array.isArray(raw)) {
    return { rows: undefined, rest }
  }
  const rows: AnnotationContentRow[] = []
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const idRaw = o.userTypeBlockInstanceId
    const userTypeBlockInstanceId =
      idRaw === null || idRaw === undefined || idRaw === '' ? null : String(idRaw)
    const textVal = o.text
    rows.push({
      userTypeBlockInstanceId,
      text: typeof textVal === 'string' ? textVal : '',
    })
  }
  return { rows, rest }
}

export function applyAnnotationShapeUiSlotNormalization(
  res: Response,
  entityType: string,
  data: Record<string, unknown>
): boolean {
  if (entityType !== ENTITY_KEYS.ANNOTATION_SHAPE && entityType !== 'annotationShape') {
    return true
  }
  const normalized = normalizeAnnotationShapeWritePayload(data)
  if (!normalized.ok) {
    sendBadRequest(res, 'Invalid annotation shape uiSlot', normalized.message)
    return false
  }
  const next = normalized.data
  for (const key of Object.keys(data)) {
    delete data[key]
  }
  Object.assign(data, next)
  return true
}
