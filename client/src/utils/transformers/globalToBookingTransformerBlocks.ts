import type { GlobalRelationship } from '@/types/relationships'
import { DEFAULT_VALUES, FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { BookingMode } from '@/constants/bookingMode'
import type { TernaryBoolean } from '@/types/ternary'
import type { BookingBlockInstance, BookingPartInstance } from '@/types/transformers/bookingData'
import { findRelationshipsByParent, extractChildIds, composePartInstances } from './relationshipTransformers'
import {
  safeString,
  convertToTernaryBoolean,
  convertTernaryToBookingMode,
} from './transformerPrimitives'
import { collectIds, findByIds, immutableSort } from './transformerCollections'
import { isBookingEntityActive } from './globalToBookingEntityActive'
import { transformPartInstance } from './globalToBookingPartInstanceTransform'

export function getBookingMode(blockInstance: GlobalEntity<'blockInstance'>): BookingMode {
  return convertTernaryToBookingMode(
    blockInstance.bookingMode ?? DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE
  )
}

export function filterAndSortBlockInstances(
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
      const isActive = isBookingEntityActive(blockInstance)
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
    return isBookingEntityActive(partInstance)
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
      return isBookingEntityActive(partInstance)
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
    active: isBookingEntityActive(blockInstance),
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
      .filter((partInstance) => isBookingEntityActive(partInstance))
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
