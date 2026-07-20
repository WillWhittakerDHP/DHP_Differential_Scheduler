/**
 * WHY: Event-package admin routing — work item (part) → segment overrides for PartFinalizer.
 * Baseline remains service block → segment (service card). This module only manages overrides.
 */
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { GlobalEntity } from '@/types/entities'
import type { CreateRelationshipPayload, FetchedRelationship, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'

type CreateEventAssignment = (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
type RemoveEventAssignment = (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>

export interface EventWorkItemRoutingSegmentOption {
  id: string
  title: string
}

export interface EventWorkItemRoutingRow {
  partInstanceId: string
  workItemName: string
  partShapeName: string
  serviceBlockName: string
  /** Segment on this package, or null = use service default (baseline). */
  assignedSegmentId: string | null
}

function entityId(entity: { id: unknown }): string {
  return String(entity.id)
}

export function packageSegmentIdsForEventBlock(
  eventBlockInstanceId: string,
  eventInstances: readonly GlobalEntity<'eventInstance'>[]
): string[] {
  return eventInstances
    .filter(
      (segment) =>
        segment.active !== false &&
        String(segment.parentBlockInstanceId ?? '') === eventBlockInstanceId
    )
    .map(entityId)
}

export function segmentOptionsForEventBlock(
  eventBlockInstanceId: string,
  eventInstances: readonly GlobalEntity<'eventInstance'>[]
): EventWorkItemRoutingSegmentOption[] {
  return eventInstances
    .filter(
      (segment) =>
        segment.active !== false &&
        String(segment.parentBlockInstanceId ?? '') === eventBlockInstanceId
    )
    .map((segment) => ({ id: entityId(segment), title: segment.name }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

function assignedSegmentIdForPartOnPackage(
  partInstanceId: string,
  packageSegmentIdSet: Set<string>,
  eventAssignments: readonly GlobalRelationship[]
): string | null {
  for (const rel of eventAssignments) {
    if (rel.parent.entityKey !== 'partInstance') {
      continue
    }
    if (String(rel.parent.id) !== partInstanceId) {
      continue
    }
    for (const child of rel.children) {
      if (child.entityKey !== 'eventInstance' || child.active === false) {
        continue
      }
      const childId = String(child.id)
      if (packageSegmentIdSet.has(childId)) {
        return childId
      }
    }
  }
  return null
}

/**
 * Rows: active work items on service blocks, with any override into this event package's segments.
 */
export function buildEventWorkItemRoutingRows(params: {
  eventBlockInstanceId: string
  blockInstances: readonly GlobalEntity<'blockInstance'>[]
  blockShapes: readonly GlobalEntity<'blockShape'>[]
  partInstances: readonly GlobalEntity<'partInstance'>[]
  partShapes: readonly GlobalEntity<'partShape'>[]
  partAssignments: readonly GlobalRelationship[]
  eventInstances: readonly GlobalEntity<'eventInstance'>[]
  eventAssignments: readonly GlobalRelationship[]
}): EventWorkItemRoutingRow[] {
  const packageSegmentIdSet = new Set(
    packageSegmentIdsForEventBlock(params.eventBlockInstanceId, params.eventInstances)
  )
  if (packageSegmentIdSet.size === 0) {
    return []
  }

  const blockShapesById = new Map(params.blockShapes.map((shape) => [entityId(shape), shape]))
  const blockInstancesById = new Map(params.blockInstances.map((block) => [entityId(block), block]))
  const partInstancesById = new Map(params.partInstances.map((part) => [entityId(part), part]))
  const partShapesById = new Map(params.partShapes.map((shape) => [entityId(shape), shape]))

  const serviceBlockIds = new Set(
    params.blockInstances
      .filter((block) => {
        if (block.active === false) {
          return false
        }
        const shape = blockShapesById.get(String(block.blockShapeRef))
        return shape?.semanticType === BLOCK_SHAPE_TYPES.SERVICE
      })
      .map(entityId)
  )

  const rows: EventWorkItemRoutingRow[] = []
  const seenPartIds = new Set<string>()

  for (const rel of params.partAssignments) {
    if (rel.parent.entityKey !== 'blockInstance') {
      continue
    }
    const serviceId = String(rel.parent.id)
    if (!serviceBlockIds.has(serviceId)) {
      continue
    }
    const serviceBlock = blockInstancesById.get(serviceId)
    if (!serviceBlock) {
      continue
    }
    for (const child of rel.children) {
      if (child.entityKey !== 'partInstance') {
        continue
      }
      const partId = String(child.id)
      if (seenPartIds.has(partId)) {
        continue
      }
      const part = partInstancesById.get(partId)
      if (!part || part.active === false) {
        continue
      }
      seenPartIds.add(partId)
      rows.push({
        partInstanceId: partId,
        workItemName: part.name,
        partShapeName: partShapesById.get(String(part.partShapeRef))?.name ?? '',
        serviceBlockName: serviceBlock.name,
        assignedSegmentId: assignedSegmentIdForPartOnPackage(
          partId,
          packageSegmentIdSet,
          params.eventAssignments
        ),
      })
    }
  }

  return rows.sort((a, b) => {
    const serviceCmp = a.serviceBlockName.localeCompare(b.serviceBlockName)
    if (serviceCmp !== 0) {
      return serviceCmp
    }
    return a.workItemName.localeCompare(b.workItemName)
  })
}

/**
 * Set or clear a part → segment override for segments owned by one event package.
 * desiredSegmentId null = use service default (remove overrides into this package).
 */
export async function syncPartEventSegmentOverride(params: {
  partInstanceId: string
  packageSegmentIds: readonly string[]
  desiredSegmentId: string | null
  currentlyAssignedSegmentIds: readonly string[]
  createEventAssignment: CreateEventAssignment
  removeEventAssignment: RemoveEventAssignment
}): Promise<void> {
  const packageSet = new Set(params.packageSegmentIds.map(String))
  const desired =
    params.desiredSegmentId && packageSet.has(String(params.desiredSegmentId))
      ? [String(params.desiredSegmentId)]
      : []
  const current = params.currentlyAssignedSegmentIds
    .map(String)
    .filter((id) => packageSet.has(id))
  const { toAdd, toRemove } = calculateArrayDiff(current, desired)
  const parentId = toGlobalEntityId(params.partInstanceId)

  await Promise.all([
    ...toAdd.map((segmentId) =>
      params.createEventAssignment({
        parentId,
        childId: toGlobalEntityId(segmentId),
      })
    ),
    ...toRemove.map((segmentId) =>
      params.removeEventAssignment(parentId, toGlobalEntityId(segmentId))
    ),
  ])
}
