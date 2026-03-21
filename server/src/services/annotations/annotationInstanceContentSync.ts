import { AnnotationInstance, AnnotationInstanceContent } from '../../config/app.js'

type AnnotationInstanceRow = InstanceType<typeof AnnotationInstance>
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('AnnotationInstanceContentSync')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface AnnotationContentRowInput {
  userTypeBlockInstanceId: string | null
  text: string
}

function normalizeUserTypeBlockInstanceId(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') {
    return null
  }
  if (UUID_REGEX.test(raw)) {
    return raw
  }
  logger.warn('annotation_instances.user_type is not a valid UUID; storing content as generic row', {
    userType: raw,
  })
  return null
}

/**
 * Upsert a single content row from legacy annotation_instances.text + user_type (one row per instance after backfill).
 */
export async function syncAnnotationInstanceContentFromLegacyColumns(
  instance: AnnotationInstanceRow
): Promise<void> {
  const annotationInstanceId = instance.id
  const text = instance.text
  const userTypeBlockInstanceId = normalizeUserTypeBlockInstanceId(instance.userType)

  const whereClause =
    userTypeBlockInstanceId == null
      ? { annotationInstanceId, userTypeBlockInstanceId: null as string | null }
      : { annotationInstanceId, userTypeBlockInstanceId }

  const existing = await AnnotationInstanceContent.findOne({ where: whereClause })
  if (existing) {
    await existing.update({ text })
    return
  }

  await AnnotationInstanceContent.create({
    annotationInstanceId,
    userTypeBlockInstanceId,
    text,
  })
}

function rowKey(userTypeBlockInstanceId: string | null): string {
  return userTypeBlockInstanceId == null ? '__null__' : userTypeBlockInstanceId
}

/**
 * Authoritative sync of all content rows from admin/API payload (generic row uses userTypeBlockInstanceId null).
 * Upserts each key; deletes DB rows whose key is not in the payload.
 */
export async function syncAnnotationInstanceContentRows(
  annotationInstanceId: string,
  rows: AnnotationContentRowInput[]
): Promise<void> {
  const byKey = new Map<string, AnnotationContentRowInput>()
  for (const r of rows) {
    const normalizedId = normalizeUserTypeBlockInstanceId(r.userTypeBlockInstanceId)
    const text = typeof r.text === 'string' ? r.text : ''
    byKey.set(rowKey(normalizedId), {
      userTypeBlockInstanceId: normalizedId,
      text,
    })
  }

  const uniqueRows = [...byKey.values()]
  const keySet = new Set(uniqueRows.map((r) => rowKey(r.userTypeBlockInstanceId)))

  const existing = await AnnotationInstanceContent.findAll({
    where: { annotationInstanceId },
  })

  for (const row of uniqueRows) {
    const whereClause =
      row.userTypeBlockInstanceId == null
        ? { annotationInstanceId, userTypeBlockInstanceId: null as string | null }
        : { annotationInstanceId, userTypeBlockInstanceId: row.userTypeBlockInstanceId }

    const found = await AnnotationInstanceContent.findOne({ where: whereClause })
    if (found) {
      await found.update({ text: row.text })
    } else {
      await AnnotationInstanceContent.create({
        annotationInstanceId,
        userTypeBlockInstanceId: row.userTypeBlockInstanceId,
        text: row.text,
      })
    }
  }

  for (const ex of existing) {
    const k = rowKey(ex.userTypeBlockInstanceId)
    if (!keySet.has(k)) {
      await ex.destroy()
    }
  }
}
