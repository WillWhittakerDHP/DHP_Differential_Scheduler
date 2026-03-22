import { AnnotationAssignment } from '../../../config/app.js'
import { resolveAnnotationTextForAssignment } from '../../../services/annotations/annotationTextResolution.js'

/**
 * API output: expose resolved `annotation.text` for assignments; omit internal contentRows.
 */
export function formatAnnotationAssignmentsForApi(
  rows: InstanceType<typeof AnnotationAssignment>[]
): Record<string, unknown>[] {
  return rows.map((row) => {
    const plain = row.get({ plain: true }) as Record<string, unknown>
    const ann = plain.annotation as Record<string, unknown> | undefined
    if (ann && typeof ann === 'object') {
      const assignUt = plain.userTypeBlockInstanceId as string | null | undefined
      const contentRows = ann.contentRows as
        | Array<{ text: string; userTypeBlockInstanceId: string | null }>
        | undefined
      ann.text = resolveAnnotationTextForAssignment(
        {
          text: String(ann.text ?? ''),
          contentRows,
        },
        assignUt ?? null
      )
      delete ann.contentRows
    }
    return plain
  })
}
