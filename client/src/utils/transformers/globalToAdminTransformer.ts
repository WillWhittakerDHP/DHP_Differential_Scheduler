/**
 * WHY: Global to Admin Transformer
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalData } from '@/types/transformers/globalData'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { AdminObject, AdminObjectMap } from '@/types/transformers/adminObject'
import { groupByParentId } from './transformerCollections'
import { safeArray } from './transformerPrimitives'

export type { AdminObject, AdminObjectMap } from '@/types/transformers/adminObject'

const RELATIONSHIP_KEYS = [
  'validBookingCascades',
  'validPartCascades',
  'validAnnotationAssignments',
  'validEventCascades',
  'bookingCascades',
  'pricingCascades',
  'validPricingCascades',
  'partAssignments',
  'annotationAssignments',
  'eventAssignments',
  'instanceComponents',
] as const

function buildRelationshipDataForEntity<GE extends GlobalEntityKey>(
  entityId: GlobalEntityId,
  _entityKey: GE,
  globalRelationships: Record<string, GlobalRelationship[]>
): Partial<GlobalEntity<GE>> {
  const relationshipMappings: Record<string, string> = {
    validBookingCascades: 'validBookingCascades',
    validPartCascades: 'validPartCascades',
    validAnnotationAssignments: 'validAnnotationAssignments',
    validEventCascades: 'validEventCascades',
    bookingCascades: 'bookingCascades',
    pricingCascades: 'pricingCascades',
    validPricingCascades: 'validPricingCascades',
    partAssignments: 'partAssignments',
    annotationAssignments: 'annotationAssignments',
    eventAssignments: 'eventAssignments',
    attendeeAssignments: 'attendees',
    instanceComponents: 'instanceComponents',
  }

  return Object.entries(relationshipMappings).reduce<Partial<GlobalEntity<GE>>>(
    (acc, [relType, propName]) => {
      const relationships = safeArray(globalRelationships[relType])
      const flat = relationships.flatMap((rel) =>
        rel.children.map((child) => ({ parentId: rel.parent.id, childId: child.id }))
      )
      const parentToChildren = groupByParentId(flat, (x) => x.parentId, (x) => x.childId)
      const rawRel = parentToChildren.get(entityId)
      const relationshipValue = rawRel !== undefined ? rawRel : []
      return { ...acc, [propName]: relationshipValue }
    },
    {}
  )
}

function transformSingleEntity<GE extends GlobalEntityKey>(
  globalEntity: GlobalEntity<GE>,
  entityKey: GE,
  globalRelationships: Record<string, GlobalRelationship[]> | undefined
): AdminObject<GE> {
  const entityWithKey = {
    ...globalEntity,
    entityKey,
  } as GlobalEntity<GE>

  const attachedRelationshipData = globalRelationships
    ? buildRelationshipDataForEntity(entityWithKey.id, entityKey, globalRelationships)
    : {}

  const entityWithRelationships = {
    ...entityWithKey,
    ...attachedRelationshipData,
  } as GlobalEntity<GE> & Record<string, unknown>

  const plainObject = {
    ...entityWithRelationships,
  } as AdminObject<GE>

  const relationshipData = RELATIONSHIP_KEYS.reduce<Partial<AdminObject<GE>>>(
    (acc, relKey) => {
      if (Object.prototype.hasOwnProperty.call(entityWithRelationships, relKey)) {
        const relationshipValue = entityWithRelationships[relKey] as
          | GlobalEntityId[]
          | undefined
        if (relationshipValue !== undefined) {
          return { ...acc, [relKey]: relationshipValue }
        }
      }
      return acc
    },
    {}
  )

  const withAttendees =
    entityKey === 'eventShape' &&
    Object.prototype.hasOwnProperty.call(entityWithRelationships, 'attendees')
      ? { attendees: (entityWithRelationships as AdminObject<'eventShape'>).attendees }
      : {}

  const merged = {
    ...plainObject,
    ...relationshipData,
    ...withAttendees,
  }

  return merged as AdminObject<GE>
}

/**
 * Transform GlobalData to AdminObjectMap.
 *
 * @param globalData - GlobalData with entities and relationships
 * @returns AdminObjectMap with validated entities and relationships attached
 */
export function transformGlobalToAdmin(globalData: GlobalData): AdminObjectMap {
  const adminObjectMap: AdminObjectMap = {
    blockShape: [],
    blockInstance: [],
    partShape: [],
    partInstance: [],
    eventShape: [],
    eventInstance: [],
    annotationShape: [],
    annotationInstance: [],
  }

  const globalEntityMap = globalData.entities
  const globalRelationships = globalData.relationships

  const transformed = Object.fromEntries(
    (Object.keys(globalEntityMap) as GlobalEntityKey[]).map((entityKey) => {
      const globalEntities = globalEntityMap[entityKey]
      const transformedEntities = globalEntities.map((globalEntity) =>
        transformSingleEntity(globalEntity, entityKey, globalRelationships)
      ) as AdminObject<typeof entityKey>[]
      return [entityKey, transformedEntities]
    })
  )

  // WHY: `Object.fromEntries` erases per-key entity typing; merge is structurally AdminObjectMap.
  return { ...adminObjectMap, ...transformed } as AdminObjectMap
}

/** Backward-compat singleton for call sites that use adminTransformer.transformGlobalToAdmin(...) */
export const adminTransformer = {
  transformGlobalToAdmin,
}
