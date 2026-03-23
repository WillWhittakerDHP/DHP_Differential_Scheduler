import type { AnnotationContentRow } from '@shared/types/annotationContentRow.js'

export interface AnnotationWithContentPlain {
  text: string
  contentRows?: AnnotationContentRow[] | null
}

/**
 * Resolve display text for an annotation assignment: typed content row, then generic row, then legacy annotation_instances.text.
 */
export function resolveAnnotationTextForAssignment(
  annotation: AnnotationWithContentPlain,
  assignmentUserTypeBlockInstanceId: string | null | undefined
): string {
  const rows = annotation.contentRows
  const assignUt = assignmentUserTypeBlockInstanceId ?? null
  if (rows && rows.length > 0) {
    if (assignUt != null) {
      const typed = rows.find((r) => r.userTypeBlockInstanceId === assignUt)
      if (typed) {
        return typed.text
      }
    }
    const generic = rows.find((r) => r.userTypeBlockInstanceId == null)
    if (generic) {
      return generic.text
    }
  }
  return annotation.text
}
