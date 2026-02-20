/**
 * Cascade Filter Pipeline
 *
 * Pure utility for filtering block instances by parent cascades and block shape type.
 * Composable steps: cascade -> shape -> optional default path. Used by useWizardFilteredOptions.
 */

import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getBlockShapeIdByType, getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('cascadeFilterPipeline')

/** Result of the cascade step: instances allowed by parent activeBlockIds */
type CascadeStepResult =
  | { success: true; instances: BookingBlockInstance[] }
  | { success: false; error: string; instances: BookingBlockInstance[] }

/** Base shared with PipelineParams (P2 type-similarity). */
export interface CascadeFilterParamsBase {
  bookingData: BookingData | null
  parentInstances: BookingBlockInstance | BookingBlockInstance[] | null
  currentSelection: BookingBlockInstance[]
  relationshipName: string
}

type CascadeFilterParams = CascadeFilterParamsBase

/**
 * Step 1: Cascade filter — returns instances allowed by parent activeBlockIds.
 */
export function filterByCascade(params: CascadeFilterParams): CascadeStepResult {
  const { bookingData, parentInstances, currentSelection, relationshipName } = params

  if (!bookingData) {
    return { success: false, error: 'Booking data not loaded', instances: currentSelection }
  }

  const parents = parentInstances
    ? Array.isArray(parentInstances) ? parentInstances : [parentInstances]
    : []

  if (parents.length === 0) {
    if (currentSelection.length > 0) {
      return { success: true, instances: currentSelection }
    }
    return {
      success: false,
      error: `Please select a parent option to view available ${relationshipName}`,
      instances: []
    }
  }

  const allowedIds = new Set(
    parents.flatMap((parent) => {
      const ids = parent.activeBlockIds
      if (ids === undefined || ids === null) {
        logger.debug('filterByCascade: activeBlockIds missing on parent', { parentId: parent.id })
        return []
      }
      return ids
    })
  )

  if (allowedIds.size === 0) {
    return {
      success: false,
      error: `Selected parent has no ${relationshipName} cascades configured. Please configure bookingCascades in the admin panel.`,
      instances: currentSelection
    }
  }

  const cascadedInstances = bookingData.blockInstances.filter(instance =>
    allowedIds.has(instance.id)
  )
  const missingSelected = currentSelection.filter(
    selected => !cascadedInstances.some(instance => instance.id === selected.id)
  )

  return {
    success: true,
    instances: [...cascadedInstances, ...missingSelected]
  }
}

/**
 * Step 2: Shape filter — narrows to instances matching the given block shape type.
 */
function filterByShape(
  instances: BookingBlockInstance[],
  bookingData: BookingData,
  shapeType: BlockShapeType
): BookingBlockInstance[] {
  const shapeId = getBlockShapeIdByType(bookingData, shapeType)
  if (!shapeId) return []
  return instances.filter(instance => instance.blockShapeRef === shapeId)
}

interface FallbackParams {
  bookingData: BookingData
  cascadeInstances: BookingBlockInstance[]
  shapeType: BlockShapeType
  hasParentSelection: boolean
  relationshipName: string
}

/**
 * Step 3: Fallback — if cascade returned empty but parent is selected, return all instances of shape type.
 */
function applyFallback(params: FallbackParams): BookingBlockInstance[] {
  const { bookingData, cascadeInstances, shapeType, hasParentSelection, relationshipName } = params
  if (cascadeInstances.length > 0) return cascadeInstances
  if (!hasParentSelection) return []

  logger.warn(`No cascade results from selected parent. Falling back to all ${relationshipName} blocks.`)
  const shapeId = getBlockShapeIdByType(bookingData, shapeType)
  if (!shapeId) return []
  return bookingData.blockInstances.filter(
    instance => instance.blockShapeRef === shapeId && instance.active
  )
}

/** Extends cascade base (P2 type-similarity). */
interface PipelineParams extends CascadeFilterParamsBase {
  shapeType: BlockShapeType
  allowFallbackToAllOfShape: boolean
  logShapeMismatch?: boolean
}

/**
 * Composed pipeline: cascade -> shape -> optional default path. Returns { instances, error }.
 * Single call replaces separate cascade + error computeds to avoid double filtering.
 */
export function cascadeShapePipeline(params: PipelineParams): {
  instances: BookingBlockInstance[]
  error: string | null
} {
  const {
    bookingData,
    parentInstances,
    currentSelection,
    relationshipName,
    shapeType,
    allowFallbackToAllOfShape,
    logShapeMismatch: logShapeMismatchParam
  } = params
  const logShapeMismatch = logShapeMismatchParam !== undefined ? logShapeMismatchParam : false

  const cascadeResult = filterByCascade({
    bookingData,
    parentInstances,
    currentSelection,
    relationshipName
  })

  if (!bookingData) {
    return { instances: [], error: cascadeResult.success ? null : cascadeResult.error }
  }

  const shapeId = getBlockShapeIdByType(bookingData, shapeType)
  if (!shapeId) {
    if (relationshipName === 'availability options') {
      logger.warn('Option block shape [type: option] not found')
    } else if (relationshipName === 'property types') {
      logger.warn('Property block shape [type: property] not found')
    }
    return { instances: [], error: cascadeResult.success ? null : cascadeResult.error }
  }

  const afterShape = filterByShape(cascadeResult.instances, bookingData, shapeType)

  const hasParentSelection = Array.isArray(parentInstances)
    ? parentInstances.length > 0
    : parentInstances != null

  if (
    logShapeMismatch &&
    hasParentSelection &&
    afterShape.length === 0 &&
    cascadeResult.instances.length > 0
  ) {
    logger.warn('Cascade results filtered out - no matching shape in cascade results', {
      relationshipName,
      shapeType,
      totalCascadeResults: cascadeResult.instances.length,
      cascadeInstanceTypes: cascadeResult.instances.map(inst => {
        const shape = bookingData.blockShapes?.find(bs => String(bs.id) === String(inst.blockShapeRef))
        return shape ? `${inst.name} (${shape.name}, type: ${shape.type})` : `${inst.name} (unknown shape)`
      })
    })
  }

  const instances = allowFallbackToAllOfShape
    ? applyFallback({
        bookingData,
        cascadeInstances: afterShape,
        shapeType,
        hasParentSelection,
        relationshipName
      })
    : afterShape

  const error = cascadeResult.success ? null : cascadeResult.error
  return { instances, error }
}

/**
 * User type blocks: state control instances grouped by blockShapeRef (first group).
 * Used for availableUserTypeBlocks; no cascade involved.
 */
export function getUserTypeBlocks(bookingData: BookingData | null): BookingBlockInstance[] {
  if (!bookingData) return []
  const stateControl = getStateControlBlockInstances(bookingData)
  if (stateControl.length === 0) return []
  const byShapeRef = stateControl.reduce<Map<string, BookingBlockInstance[]>>((map, instance) => {
    const existing = map.get(instance.blockShapeRef)
    const list = existing !== undefined ? existing : []
    map.set(instance.blockShapeRef, [...list, instance])
    return map
  }, new Map())
  const firstKey = Array.from(byShapeRef.keys())[0]
  if (!firstKey) return []
  const group = byShapeRef.get(firstKey)
  return group !== undefined ? group : []
}
