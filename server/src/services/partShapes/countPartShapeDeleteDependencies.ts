import { PartInstance, ValidPart, ValidPricingCascade } from '../../config/app.js'

export interface PartShapeDeleteDependencyCounts {
  partInstanceCount: number
  validPartCount: number
  validPricingCascadeParentCount: number
  validPricingCascadeChildCount: number
  totalCount: number
}

/**
 * WHY: Part shapes are parents in multiple FK paths, so delete checks need a single
 * source of truth instead of scattered counts in the route.
 */
export async function countPartShapeDeleteDependencies(
  shapeId: string
): Promise<PartShapeDeleteDependencyCounts> {
  const [
    partInstanceCount,
    validPartCount,
    validPricingCascadeParentCount,
    validPricingCascadeChildCount,
  ] = await Promise.all([
    PartInstance.count({ where: { partShapeRef: shapeId } }),
    ValidPart.count({ where: { childId: shapeId } }),
    ValidPricingCascade.count({ where: { parentId: shapeId } }),
    ValidPricingCascade.count({ where: { childId: shapeId } }),
  ])

  return {
    partInstanceCount,
    validPartCount,
    validPricingCascadeParentCount,
    validPricingCascadeChildCount,
    totalCount:
      partInstanceCount +
      validPartCount +
      validPricingCascadeParentCount +
      validPricingCascadeChildCount,
  }
}
