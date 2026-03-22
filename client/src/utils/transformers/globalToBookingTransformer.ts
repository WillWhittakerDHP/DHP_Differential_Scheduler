/**
 * WHY: Global to Booking Transformer
 */
import type { GlobalData } from '@/types/transformers/globalData'
import type { GlobalRelationship } from '@/types/relationships'
import { DEFAULT_VALUES, FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { BookingMode } from '@/constants/bookingMode'
import type { TernaryBoolean } from '@/types/ternary'
import type { BookingBlockInstance, BookingBlockShape, BookingData, BookingPartInstance } from '@/types/transformers/bookingData'
import { findRelationshipsByParent, extractChildIds, composePartInstances } from './relationshipTransformers'
import {
  safeArray,
  safeString,
  convertToTernaryBoolean,
  convertTernaryToBookingMode,
} from './transformerPrimitives'
import { collectIds, findByIds, immutableSort } from './transformerCollections'
import { buildBookingBlockAnnotationUi } from './buildBookingBlockAnnotationUi'

export type {
  BookingAnnotationUiCandidate,
  BookingBlockAnnotationUi,
  BookingBlockInstance,
  BookingBlockShape,
  BookingData,
  BookingPartInstance,
} from '@/types/transformers/bookingData'

/** Entity-like shape for active/disabled check without full Record<string, unknown>. */
function isEntityActive(entity: { disabled?: boolean; active?: boolean } | null | undefined): boolean {
  if (!entity) return false
  const disabled = entity.disabled === true
  const active = entity.active !== false
  return !disabled && active
}

function getBookingMode(blockInstance: GlobalEntity<'blockInstance'>): BookingMode {
  return convertTernaryToBookingMode(
    blockInstance.bookingMode ?? DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE
  )
}

function filterAndSortBlockInstances(
  blockInstances: GlobalEntity<'blockInstance'>[],
  componentIds: Set<string>,
  predicate: (bi: GlobalEntity<'blockInstance'>) => boolean,
  partAssignmentsRelationships: GlobalRelationship[],
  bookingCascadesRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  pricingCascadesRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>,
  blockShapeById: Map<string, GlobalEntity<'blockShape'>>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>
): BookingBlockInstance[] {
  const mapped = blockInstances
    .filter((blockInstance) => {
      const isActive = isEntityActive(blockInstance)
      const isComponentChild = componentIds.has(blockInstance.id)
      return isActive && !isComponentChild && predicate(blockInstance)
    })
    .map((blockInstance) =>
      transformBlockInstance(
        blockInstance,
        partAssignmentsRelationships,
        bookingCascadesRelationships,
        instanceComponentsRelationships,
        pricingCascadesRelationships,
        partInstanceById,
        blockShapeById,
        partShapeById
      )
    )
  return immutableSort(mapped, (a, b) => {
    const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
    const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
    return aOrder - bOrder
  })
}

function resolveComponentPartIds(
  blockInstanceId: string,
  instanceComponentsRelationships: GlobalRelationship[],
  partAssignmentsRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>
): string[] {
  const componentRels = findRelationshipsByParent(
    blockInstanceId,
    instanceComponentsRelationships
  )
  const componentIds = extractChildIds(componentRels)
  if (componentIds.length === 0) return []
  const componentPartIds = composePartInstances(
    componentIds,
    partAssignmentsRelationships
  )
  return componentPartIds.filter((partId) => {
    const partInstance = partInstanceById.get(partId)
    return isEntityActive(partInstance)
  })
}

function resolvePartInstanceIds(
  blockInstance: GlobalEntity<'blockInstance'>,
  partAssignmentsRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>
): Set<string> {
  const partAssignmentsRels = findRelationshipsByParent(
    blockInstance.id,
    partAssignmentsRelationships
  )
  const partAssignmentsRel = partAssignmentsRels[0]
  const mappedIds = partAssignmentsRel?.children
    .filter((child) => {
      const partInstance = partInstanceById.get(child.id)
      return isEntityActive(partInstance)
    })
    .map((child) => child.id)
  const partAssignmentChildIds = mappedIds !== undefined && mappedIds !== null ? mappedIds : []

  const blockInstanceTyped = blockInstance as BlockInstanceEntity
  const activeComponentPartIds =
    blockInstanceTyped.composite === true
      ? resolveComponentPartIds(
          blockInstance.id,
          instanceComponentsRelationships,
          partAssignmentsRelationships,
          partInstanceById
        )
      : []

  return collectIds(partAssignmentChildIds, activeComponentPartIds)
}

/** Optional block instance fields used when building BookingBlockInstance (API/storage shape). */
type BlockInstanceOptionalProps = {
  baseSqFt?: number
  icon?: string
  bookingMode?: TernaryBoolean
  agentPermissions?: TernaryBoolean
  differential?: TernaryBoolean
  preClosing?: boolean
  number?: number | null
  allowMultiple?: boolean
  requiresUnitNumber?: boolean | null
  isMultiFamily?: boolean
  requiresAgent?: boolean
  differentialEventRoleOverrides?: Record<string, import('@shared/types/differentialRole').DifferentialRole>
}

function extractBlockInstanceProps(
  blockInstance: GlobalEntity<'blockInstance'>
): BlockInstanceOptionalProps {
  const b = blockInstance as BlockInstanceEntity
  const numberRaw = b.number
  const numberProp =
    typeof numberRaw === 'number' || numberRaw === null ? numberRaw : undefined
  return {
    baseSqFt: b.baseSqFt,
    icon: b.icon,
    bookingMode: b.bookingMode,
    agentPermissions: b.agentPermissions,
    differential: b.differential,
    preClosing: b.preClosing,
    number: numberProp,
    allowMultiple: b.allowMultiple,
    requiresUnitNumber: b.requiresUnitNumber,
    isMultiFamily: b.isMultiFamily,
    requiresAgent: b.requiresAgent,
    ...(b.differentialEventRoleOverrides !== undefined && b.differentialEventRoleOverrides !== null
      ? { differentialEventRoleOverrides: { ...b.differentialEventRoleOverrides } }
      : {}),
  }
}

function buildBookingBlockInstance(
  blockInstance: GlobalEntity<'blockInstance'>,
  props: BlockInstanceOptionalProps,
  partInstances: BookingPartInstance[],
  blockShape: string,
  blockShapeRef: string,
  activeBlockIds: string[],
  differential: TernaryBoolean
): BookingBlockInstance {
  const bookingModeDomain = convertTernaryToBookingMode(
    props.bookingMode ?? DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE
  )
  const agentPermissions = convertToTernaryBoolean(props.agentPermissions, 'false')
  return {
    id: blockInstance.id,
    entityKey: 'blockInstance',
    name: blockInstance.name,
    active: isEntityActive(blockInstance),
    baseSqFt: props.baseSqFt ?? 0,
    icon: safeString(props.icon, 'blockInstance.icon'),
    bookingMode: bookingModeDomain,
    agentPermissions,
    differential,
    preClosing: props.preClosing ?? false,
    orderIndex: blockInstance.orderIndex,
    blockShape,
    blockShapeRef,
    activeBlockIds,
    partInstances,
    allowMultiple: props.allowMultiple ?? false,
    requiresUnitNumber:
      typeof props.requiresUnitNumber === 'boolean' ? props.requiresUnitNumber : null,
    isMultiFamily: props.isMultiFamily ?? false,
    requiresAgent: props.requiresAgent ?? false,
    ...(props[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES] !== undefined
      ? {
          [FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES]:
            props[FIELD_NAMES.DIFFERENTIAL_EVENT_ROLE_OVERRIDES],
        }
      : {}),
  }
}

function transformBlockInstance(
  blockInstance: GlobalEntity<'blockInstance'>,
  partAssignmentsRelationships: GlobalRelationship[],
  bookingCascadesRelationships: GlobalRelationship[],
  instanceComponentsRelationships: GlobalRelationship[],
  pricingCascadesRelationships: GlobalRelationship[],
  partInstanceById: Map<string, GlobalEntity<'partInstance'>>,
  _blockShapeById: Map<string, GlobalEntity<'blockShape'>>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>
): BookingBlockInstance {
  const partInstanceIds = resolvePartInstanceIds(
    blockInstance,
    partAssignmentsRelationships,
    instanceComponentsRelationships,
    partInstanceById
  )
  const partInstanceList = findByIds(
    Array.from(partInstanceById.values()),
    Array.from(partInstanceIds)
  )
  const partInstances = immutableSort(
    partInstanceList
      .filter((partInstance) => isEntityActive(partInstance))
      .map((partInstance) =>
        transformPartInstance(partInstance, partShapeById, pricingCascadesRelationships)
      ),
    (a, b) => {
      const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
      const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
      return aOrder - bOrder
    }
  )

  const blockInstanceWithShapeRef = blockInstance as GlobalEntity<'blockInstance'> & {
    blockShapeRef: string
  }
  const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef
  const bookingCascadesRels = findRelationshipsByParent(
    blockInstance.id,
    bookingCascadesRelationships
  )
  const activeBlockIds = extractChildIds(bookingCascadesRels)
  const props = extractBlockInstanceProps(blockInstance)
  const differential = convertToTernaryBoolean(props.differential)
  const blockShapeEntity = _blockShapeById.get(blockShapeRef)
  const blockShape = safeString(blockShapeEntity?.name, 'blockShape.name')

  return buildBookingBlockInstance(
    blockInstance,
    props,
    partInstances,
    blockShape,
    blockShapeRef,
    activeBlockIds,
    differential
  )
}

function transformPartInstance(
  partInstance: GlobalEntity<'partInstance'>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>,
  pricingCascadesRelationships: GlobalRelationship[] = []
): BookingPartInstance {
  const partInstanceTyped = partInstance as GlobalEntity<'partInstance'> & { partShapeRef: string }
  const partShapeRef = partInstanceTyped.partShapeRef
  const partShapeEntity = partShapeById.get(partShapeRef)
  const partShape = partShapeEntity?.name ? partShapeEntity.name : partShapeRef

  const partInstanceWithProps = partInstance as GlobalEntity<'partInstance'> & {
    baseTime?: number
    rateOverBaseTime?: number
    baseFee?: number
    rateOverBaseFee?: number
    zeroOutPart?: boolean
    percentageOff?: number
    percentage_off?: number
  }

  const pricingRels = findRelationshipsByParent(partInstance.id, pricingCascadesRelationships)
  const activePartIds = extractChildIds(pricingRels)
  const percentageOff = partInstanceWithProps.percentageOff ?? partInstanceWithProps.percentage_off

  return {
    id: partInstance.id,
    entityKey: 'partInstance',
    name: partInstance.name,
    active: isEntityActive(partInstance),
    partShape,
    baseTime: partInstanceWithProps.baseTime ?? 0,
    rateOverBaseTime: partInstanceWithProps.rateOverBaseTime ?? 0,
    baseFee: partInstanceWithProps.baseFee ?? 0,
    rateOverBaseFee: partInstanceWithProps.rateOverBaseFee ?? 0,
    orderIndex: partInstance.orderIndex,
    zeroOutPart: partInstanceWithProps.zeroOutPart ?? false,
    activePartIds,
    ...(percentageOff !== undefined && percentageOff !== null && { percentageOff }),
  }
}

export function transformGlobalToBooking(globalData: GlobalData): BookingData {
  const { entities, relationships } = globalData
  const blockShapes = safeArray(entities.blockShape) as GlobalEntity<'blockShape'>[]
  const blockInstances = safeArray(entities.blockInstance) as GlobalEntity<'blockInstance'>[]
  const partShapes = safeArray(entities.partShape) as GlobalEntity<'partShape'>[]
  const partInstances = safeArray(entities.partInstance) as GlobalEntity<'partInstance'>[]
  const partAssignmentsRelationships = safeArray(relationships.partAssignments)
  const bookingCascadesRelationships = safeArray(relationships.bookingCascades)
  const instanceComponentsRelationships = safeArray(relationships.instanceComponents)
  const pricingCascadesRelationships = safeArray(relationships.pricingCascades)

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
    pricingCascadesRelationships,
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
    pricingCascadesRelationships,
    partInstanceById,
    blockShapeById,
    partShapeById
  )

  const bookingBlockShapes: BookingBlockShape[] = immutableSort(
    blockShapes.map((blockShape) => ({
      id: blockShape.id,
      name: blockShape.name,
      type: blockShape.type,
      canHaveParts: blockShape.canHaveParts,
      isStateControl: blockShape.isStateControl,
      composable: blockShape.composable,
    })),
    (a, b) => a.name.localeCompare(b.name)
  )

  function withAnnotationUi(blocks: BookingBlockInstance[]): BookingBlockInstance[] {
    return blocks.map((b) => {
      const ui = buildBookingBlockAnnotationUi(b.id, globalData)
      return ui !== undefined ? { ...b, annotationUi: ui } : b
    })
  }

  return {
    blockInstances: withAnnotationUi(bookingBlockInstances),
    lineItemBlocks: withAnnotationUi(lineItemBlocks),
    blockShapes: bookingBlockShapes,
  }
}

/** Backward-compatible singleton: use transformGlobalToBooking(globalData) or bookingTransformer.transformGlobalToBooking(globalData). */
export const bookingTransformer = {
  transformGlobalToBooking,
}
