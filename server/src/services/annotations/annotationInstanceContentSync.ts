import { AnnotationInstance, AnnotationInstanceContent } from '../../config/app.js'

type AnnotationInstanceRow = InstanceType<typeof AnnotationInstance>
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('AnnotationInstanceContentSync')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
