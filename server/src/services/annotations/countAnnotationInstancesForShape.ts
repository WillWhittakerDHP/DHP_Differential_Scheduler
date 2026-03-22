import { AnnotationInstance } from '../../config/app.js'

/**
 * Returns how many annotation instances reference the given annotation shape (`type` FK).
 */
export async function countAnnotationInstancesForShape(shapeId: string): Promise<number> {
  return AnnotationInstance.count({ where: { type: shapeId } })
}
