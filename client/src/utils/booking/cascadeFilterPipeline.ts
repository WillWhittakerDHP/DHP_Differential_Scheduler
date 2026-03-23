
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getBlockShapeIdByType, getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import { createLogger } from '@/utils/logger'
import type { CascadeFilterParamsBase } from '@/types/booking/cascadeFilterPipeline'

export type { CascadeFilterParamsBase } from '@/types/booking/cascadeFilterPipeline'

const logger = createLogger('cascadeFilterPipeline')

/** Result of the cascade step: instances allowed by parent activeBlockIds */
type CascadeStepResult =
  | { success: true; instances: BookingBlockInstance[] }
  | { success: false; error: string; instances: BookingBlockInstance[] }

type CascadeFilterParams = CascadeFilterParamsBase

function filterByCascade(params: CascadeFilterParams): CascadeStepResult {
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

function filterByShape(
  instances: BookingBlockInstance[],
  bookingData: BookingData,
  shapeType: BlockShapeType
): BookingBlockInstance[] {
  const shapeId = getBlockShapeIdByType(bookingData, shapeType)
  if (!shapeId) return []
  const shapeIdNorm = String(shapeId)
  return instances.filter(
    instance => String(instance.blockShapeRef) === shapeIdNorm
  )
}

interface FallbackParams {
  bookingData: BookingData
  cascadeInstances: BookingBlockInstance[]
  shapeType: BlockShapeType
  hasParentSelection: boolean
  relationshipName: string
}

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
    } else if (relationshipName === 'coupons') {
      logger.warn('Coupon block shape [type: coupon] not found')
    } else if (relationshipName === 'services') {
      logger.warn('Service block shape [type: service] not found')
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

  if (
    relationshipName === 'availability options' &&
    !allowFallbackToAllOfShape &&
    hasParentSelection &&
    afterShape.length === 0
  ) {
    logger.warn(
      '[availability_options_cascade_empty] No option blocks from cascade for selected service; fallback-to-all is disabled. Configure bookingCascades from service to availability options.',
      {
        relationshipName,
        parentServiceIds: (Array.isArray(parentInstances) ? parentInstances : [parentInstances])
          .filter((p): p is BookingBlockInstance => p != null)
          .map((p) => p.id),
      }
    )
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
