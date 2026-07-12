import type { GlobalRelationship } from '@/types/relationships'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'
import type { BookingBlockInstance, BookingPartInstance } from '@/types/transformers/bookingData'
import { findRelationshipsByParent, extractChildIds, composePartInstances } from './relationshipTransformers'
import {
  safeString,
  convertToTernaryBoolean,
} from './transformerPrimitives'
import { collectIds, findByIds, immutableSort } from './transformerCollections'
import { isBookingEntityActive } from './globalToBookingEntityActive'
import { transformPartInstance } from './globalToBookingPartInstanceTransform'

export function isWizardMainBlock(blockInstance: GlobalEntity<'blockInstance'>): boolean {
  const b = blockInstance as BlockInstanceEntity
  return b.wizardVisible !== false
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
      const isComponentChild = componentIds.has(blockInstance.id)
      return isWizardMainBlock(blockInstance) && !isComponentChild && predicate(blockInstance)
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
    return partInstance !== undefined && isBookingEntityActive(partInstance)
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
  agentPermissions?: TernaryBoolean
  orchestrator?: boolean
  wizardVisible?: boolean
  preClosing?: boolean
  number?: number | null
  allowMultiple?: boolean
  requiresUnitNumber?: boolean | null
  isMultiFamily?: boolean
  requiresAgent?: boolean
  semanticType?: string | null
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
    agentPermissions: b.agentPermissions,
    orchestrator: b.orchestrator,
    wizardVisible: b.wizardVisible,
    preClosing: b.preClosing,
    number: numberProp,
    allowMultiple: b.allowMultiple,
    requiresUnitNumber: b.requiresUnitNumber,
    isMultiFamily: b.isMultiFamily,
    requiresAgent: b.requiresAgent,
    semanticType: typeof b.semanticType === 'string' && b.semanticType.length > 0 ? b.semanticType : null,
  }
}

function buildBookingBlockInstance(
  blockInstance: GlobalEntity<'blockInstance'>,
  props: BlockInstanceOptionalProps,
  partInstances: BookingPartInstance[],
  blockShape: string,
  blockShapeRef: string,
  activeBlockIds: string[],
  orchestrator: boolean,
  wizardVisible: boolean
): BookingBlockInstance {
  const agentPermissions = convertToTernaryBoolean(props.agentPermissions, 'false')
  const st = props.semanticType
  const out: BookingBlockInstance = {
    id: blockInstance.id,
    entityKey: 'blockInstance',
    name: blockInstance.name,
    active: wizardVisible,
    baseSqFt: props.baseSqFt ?? 0,
    icon: safeString(props.icon, 'blockInstance.icon'),
    agentPermissions,
    orchestrator,
    wizardVisible,
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
  }
  if (typeof st === 'string' && st.length > 0) {
    out.semanticType = st
  }
  return out
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
  const orchestrator = props.orchestrator ?? DEFAULT_VALUES.ORCHESTRATOR
  const wizardVisible = props.wizardVisible ?? DEFAULT_VALUES.WIZARD_VISIBLE
  const blockShapeEntity = _blockShapeById.get(blockShapeRef)
  const blockShape = safeString(blockShapeEntity?.name, 'blockShape.name')

  return buildBookingBlockInstance(
    blockInstance,
    props,
    partInstances,
    blockShape,
    blockShapeRef,
    activeBlockIds,
    orchestrator,
    wizardVisible
  )
}
