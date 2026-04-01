import { ValidAnnotationAssignment } from '../../config/app.js'
import { countAnnotationInstancesForShape } from './countAnnotationInstancesForShape.js'

export interface AnnotationShapeDeleteDependencyCounts {
  annotationInstanceCount: number
  validAnnotationAssignmentChildCount: number
  totalCount: number
}

/**
 * WHY: Annotation shapes are referenced by instances (`type`) and validity rows (`child_id`).
 */
export async function countAnnotationShapeDeleteDependencies(shapeId: string): Promise<AnnotationShapeDeleteDependencyCounts> {
  const [annotationInstanceCount, validAnnotationAssignmentChildCount] = await Promise.all([
    countAnnotationInstancesForShape(shapeId),
    ValidAnnotationAssignment.count({ where: { childId: shapeId } }),
  ])

  return {
    annotationInstanceCount,
    validAnnotationAssignmentChildCount,
    totalCount: annotationInstanceCount + validAnnotationAssignmentChildCount,
  }
}
