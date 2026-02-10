/**
 * Global to Booking Transformer
 *
 * LEARNING: Transforms GlobalData into booking-optimized format
 * WHY: Provides lightweight data structure for booking views
 * PATTERN: Plain objects with embedded relationships
 */

import type { GlobalData, GlobalRelationship } from './fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import type { TernaryBoolean } from '@/types/ternary'
import { findRelationshipsByParent, extractChildIds, composePartInstances } from './relationshipTransformers'

/** Default booking mode when not set (standalone vs addOn). */
const DEFAULT_BOOKING_MODE = 'standalone' as const

/** Default TernaryBoolean when differential is not set. */
const TERNARY_FALSE: TernaryBoolean = 'false'

export type BookingPartInstance = {
  id: string
  entityKey: 'partInstance'
  name: string
  active: boolean
  partShape: string // Denormalized: partShape name instead of ID
  baseTime: number
  rateOverBaseTime: number
  baseFee: number
  rateOverBaseFee: number
  orderIndex: number
  zeroOutPart: boolean
}

export type BookingBlockShape = {
  id: string
  name: string
  type: BlockShapeType // Semantic type identifier for stable filtering
  canHaveParts: boolean
  isStateControl: boolean
  composable: boolean
}

export type BookingBlockInstance = {
  id: string
  entityKey: 'blockInstance'
  name: string
  active: boolean
  baseSqFt: number
  icon: string
  bookingMode: import('@/constants/entities').BookingMode // Controls where instance appears in booking flows
  differential: TernaryBoolean // Whether this service supports differential scheduling (inspector and client have different arrival times). 'override' means differential is disabled.
  orderIndex: number
  blockShape: string // Denormalized: blockShape name instead of ID (kept for backward compatibility)
  blockShapeRef: string // Block shape ID reference for filtering
  activeBlockIds: string[] // Child block IDs for cascading filters
  partInstances: BookingPartInstance[] // Embedded part instances
  allowMultiple: boolean // Whether this block instance can be multiplied by ADU count or number
  requiresUnitNumber: boolean | null // If true, property requires a unit number (nullable by design)
  number?: number | null // Optional quantity multiplier for allowMultiple instances
  is_multi_family: boolean // If true, property type is multi-family (requires numberOfUnits field)
  requires_agent: boolean // If true, service requires agent and client contact information
}

export type BookingData = {
  blockInstances: BookingBlockInstance[] // Main booking blocks (standalone, both) - excludes addOn
  lineItemBlocks: BookingBlockInstance[] // Line item blocks (bookingMode: "addOn") - separate for line item selection
  blockShapes: BookingBlockShape[] // Block shapes for property-based filtering
}

function isEntityActive(entity: Record<string, unknown> | null | undefined): boolean {
  if (!entity) return false
  const disabled = entity.disabled === true
  const active = entity.active !== false
  return !disabled && active
}

function getBookingMode(blockInstance: GlobalEntity<'blockInstance'>): string {
  const withMode = blockInstance as unknown as { bookingMode?: string }
  return withMode.bookingMode ?? DEFAULT_BOOKING_MODE
}

/**
 * Shared filter, map, and sort for block instances (main blocks vs line items).
 * PATTERN: DRY - single implementation for booking blocks and line item blocks.
 */
function filterAndSortBlockInstances(
  blockInstances: GlobalEntity<'blockInstance'>[],
  componentIds: Set<string>,
  predicate: (bi: GlobalEntity<'blockInstance'>) => boolean,
  partAssignmentsRelationships: GlobalRelationship[],
  bookingCascadesRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>,
  blockShapeById: Map<string, GlobalEntity<'blockShape'>>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>
): BookingBlockInstance[] {
  return blockInstances
    .filter((blockInstance) => {
      const isActive = isEntityActive(blockInstance as unknown as Record<string, unknown>)
      const isComponentChild = componentIds.has(blockInstance.id)
      const bookingMode = getBookingMode(blockInstance)
      return isActive && !isComponentChild && predicate(blockInstance)
    })
    .map((blockInstance) =>
      transformBlockInstance(
        blockInstance,
        partAssignmentsRelationships,
        bookingCascadesRelationships,
        instanceComponentsRelationships,
        partInstanceById,
        blockShapeById,
        partShapeById
      )
    )
    .sort((a, b) => {
      const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
      const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
      return aOrder - bOrder
    })
}

/**
 * Resolve part instance IDs for a block (own parts + component parts if composite).
 * LEARNING: For composite instances, merge own parts with component parts.
 */
function resolvePartInstanceIds(
  blockInstance: GlobalEntity<'blockInstance'>,
  partAssignmentsRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>
): Set<string> {
  const partInstanceIds = new Set<string>()
  const partAssignmentsRels = findRelationshipsByParent(
    blockInstance.id,
    partAssignmentsRelationships
  )
  const partAssignmentsRel = partAssignmentsRels[0]

  if (partAssignmentsRel) {
    const partAssignmentIds = partAssignmentsRel.children
      .filter((child) => {
        const partInstance = partInstanceById.get(child.id)
        return isEntityActive(partInstance as unknown as Record<string, unknown>)
      })
      .map((child) => child.id)
    for (const id of partAssignmentIds) {
      partInstanceIds.add(id)
    }
  }

  const blockInstanceTyped = blockInstance as BlockInstanceEntity
  if (blockInstanceTyped.composite === true) {
    const componentRels = findRelationshipsByParent(
      blockInstance.id,
      instanceComponentsRelationships
    )
    const componentIds = extractChildIds(componentRels)
    if (componentIds.length > 0) {
      const componentPartIds = composePartInstances(
        componentIds,
        partAssignmentsRelationships
      )
      const activeComponentPartIds = componentPartIds.filter((partId) => {
        const partInstance = partInstanceById.get(partId)
        return isEntityActive(partInstance as unknown as Record<string, unknown>)
      })
      for (const id of activeComponentPartIds) {
        partInstanceIds.add(id)
      }
    }
  }

  return partInstanceIds
}

/**
 * Transform a single block instance with embedded part instances
 * LEARNING: Denormalizes blockShape and embeds part instances
 */
function transformBlockInstance(
  blockInstance: GlobalEntity<'blockInstance'>,
  partAssignmentsRelationships: GlobalRelationship[],
  bookingCascadesRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>,
  blockShapeById: Map<string, GlobalEntity<'blockShape'>>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>
): BookingBlockInstance {
  const partInstanceIds = resolvePartInstanceIds(
    blockInstance,
    partAssignmentsRelationships,
    instanceComponentsRelationships,
    partInstanceById
  )

  const partInstances: BookingPartInstance[] = Array.from(partInstanceIds)
    .map((partId) => partInstanceById.get(partId))
    .filter((partInstance: GlobalEntity<'partInstance'> | undefined): partInstance is GlobalEntity<'partInstance'> =>
      partInstance !== undefined && isEntityActive(partInstance as unknown as Record<string, unknown>)
    )
    .map((partInstance: GlobalEntity<'partInstance'>) =>
      transformPartInstance(partInstance, partShapeById)
    )
  .sort((a, b) => {
    const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
    const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
    return aOrder - bOrder
  })

  const blockInstanceWithShapeRef = blockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
  const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef

  const bookingCascadesRels = findRelationshipsByParent(
    blockInstance.id,
    bookingCascadesRelationships
  )
  const activeBlockIds = extractChildIds(bookingCascadesRels)

  const blockInstanceWithProps = blockInstance as GlobalEntity<'blockInstance'> & {
    baseSqFt?: number
    icon?: string
    bookingMode?: import('@/constants/entities').BookingMode
    differential?: TernaryBoolean | boolean
    number?: number | null
    allowMultiple?: boolean
    requiresUnitNumber?: boolean | null
  }

  const differential = convertDifferentialToTernary(blockInstanceWithProps.differential)

  return {
    id: blockInstance.id,
    entityKey: 'blockInstance',
    name: blockInstance.name,
    active: isEntityActive(blockInstance as unknown as Record<string, unknown>),
    baseSqFt: blockInstanceWithProps.baseSqFt ?? 0,
    icon: blockInstanceWithProps.icon ?? '',
    bookingMode: (blockInstanceWithProps.bookingMode ?? DEFAULT_BOOKING_MODE) as import('@/constants/entities').BookingMode,
    differential,
    orderIndex: blockInstance.orderIndex,
    blockShapeRef,
    activeBlockIds,
    partInstances,
    allowMultiple: blockInstanceWithProps.allowMultiple ?? false,
    requiresUnitNumber:
      typeof blockInstanceWithProps.requiresUnitNumber === 'boolean'
        ? blockInstanceWithProps.requiresUnitNumber
        : null,
    is_multi_family: blockInstanceWithProps.is_multi_family ?? false,
    requires_agent: blockInstanceWithProps.requires_agent ?? false,
  }
}

function convertDifferentialToTernary(value: TernaryBoolean | boolean | undefined): TernaryBoolean {
  if (value === true) return 'true'
  if (value === false) return 'false'
  if (value === 'true' || value === 'false' || value === 'override') return value
  return TERNARY_FALSE
}

function transformPartInstance(
  partInstance: GlobalEntity<'partInstance'>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>
): BookingPartInstance {
  const partInstanceTyped = partInstance as GlobalEntity<'partInstance'> & { partShapeRef: string }
  const partShapeRef = partInstanceTyped.partShapeRef
  const partShapeEntity = partShapeById.get(partShapeRef)
  const partShape = partShapeEntity?.name ?? partShapeRef

  const partInstanceWithProps = partInstance as GlobalEntity<'partInstance'> & {
    baseTime?: number
    rateOverBaseTime?: number
    baseFee?: number
    rateOverBaseFee?: number
    zeroOutPart?: boolean
  }

  return {
    id: partInstance.id,
    entityKey: 'partInstance',
    name: partInstance.name,
    active: isEntityActive(partInstance as unknown as Record<string, unknown>),
    partShape,
    baseTime: partInstanceWithProps.baseTime ?? 0,
    rateOverBaseTime: partInstanceWithProps.rateOverBaseTime ?? 0,
    baseFee: partInstanceWithProps.baseFee ?? 0,
    rateOverBaseFee: partInstanceWithProps.rateOverBaseFee ?? 0,
    orderIndex: partInstance.orderIndex,
    zeroOutPart: partInstanceWithProps.zeroOutPart ?? false,
  }
}

/**
 * Transform GlobalData to booking-optimized format.
 * LEARNING: Creates lightweight plain objects with embedded relationships.
 */
export function transformGlobalToBooking(globalData: GlobalData): BookingData {
  const { entities, relationships } = globalData
  const blockShapes = (entities.blockShape ?? []) as GlobalEntity<'blockShape'>[]
  const blockInstances = (entities.blockInstance ?? []) as GlobalEntity<'blockInstance'>[]
  const partShapes = (entities.partShape ?? []) as GlobalEntity<'partShape'>[]
  const partInstances = (entities.partInstance ?? []) as GlobalEntity<'partInstance'>[]
  const partAssignmentsRelationships = relationships.partAssignments ?? []
  const bookingCascadesRelationships = relationships.bookingCascades ?? []
  const instanceComponentsRelationships = relationships.instanceComponents ?? []

  const partInstanceById = new Map(
    partInstances.map((partInstance) => [partInstance.id, partInstance])
  )
  const blockShapeById = new Map(
    blockShapes.map((blockShape) => [blockShape.id, blockShape])
  )
  const partShapeById = new Map(
    partShapes.map((partShape) => [partShape.id, partShape])
  )

  const componentIds = new Set(
    instanceComponentsRelationships
      .filter((rel) => rel.relationshipKind === 'instanceComponents')
      .flatMap((rel) => rel.children.map((child) => child.id))
  )

  const bookingBlockInstances = filterAndSortBlockInstances(
    blockInstances,
    componentIds,
    (bi) => getBookingMode(bi) !== 'addOn',
    partAssignmentsRelationships,
    bookingCascadesRelationships,
    instanceComponentsRelationships,
    partInstanceById,
    blockShapeById,
    partShapeById
  )

  const lineItemBlocks = filterAndSortBlockInstances(
    blockInstances,
    componentIds,
    (bi) => getBookingMode(bi) === 'addOn',
    partAssignmentsRelationships,
    bookingCascadesRelationships,
    instanceComponentsRelationships,
    partInstanceById,
    blockShapeById,
    partShapeById
  )

  const bookingBlockShapes: BookingBlockShape[] = blockShapes
    .map((blockShape) => ({
      id: blockShape.id,
      name: blockShape.name,
      type: blockShape.type,
      canHaveParts: blockShape.canHaveParts,
      isStateControl: blockShape.isStateControl,
      composable: blockShape.composable,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    blockInstances: bookingBlockInstances,
    lineItemBlocks,
    blockShapes: bookingBlockShapes,
  }
}

/** Backward-compatible singleton: use transformGlobalToBooking(globalData) or bookingTransformer.transformGlobalToBooking(globalData). */
export const bookingTransformer = {
  transformGlobalToBooking,
}

