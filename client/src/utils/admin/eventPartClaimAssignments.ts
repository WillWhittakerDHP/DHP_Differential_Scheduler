import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { GlobalEntity } from '@/types/entities'
import type { CreateRelationshipPayload, FetchedRelationship, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'
import { isWizardTopLine } from '@shared/constants/wizardPlacement'

type CreateEventAssignment = (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
type RemoveEventAssignment = (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>

export interface EventTimeClaimPartOption {
  id: string
  label: string
}

export interface EventTimeClaimBlockOption {
  id: string
  title: string
  subtitle: string
  parts: EventTimeClaimPartOption[]
}

export interface EventTimeClaimServiceOption {
  id: string
  title: string
  timeBlocks: EventTimeClaimBlockOption[]
}

function normalizeIds(ids: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    const value = String(id ?? '').trim()
    if (value === '' || seen.has(value)) {
      continue
    }
    seen.add(value)
    out.push(value)
  }
  return out
}

export function timeBlockClaimIdsFromDraftValue(value: unknown): string[] {
  return Array.isArray(value) ? normalizeIds(value) : []
}

function entityId(entity: { id: unknown }): string {
  return String(entity.id)
}

function childrenForParent(relationships: GlobalRelationship[], parentId: string): string[] {
  return relationships
    .filter((rel) => String(rel.parent.id) === parentId)
    .flatMap((rel) => rel.children.map((child) => String(child.id)))
}

function collectReachableBlockIds(
  rootId: string,
  relationships: {
    bookingCascades: GlobalRelationship[]
    instanceComponents: GlobalRelationship[]
  }
): string[] {
  const out: string[] = []
  const visited = new Set<string>()
  const visit = (id: string): void => {
    if (visited.has(id)) {
      return
    }
    visited.add(id)
    out.push(id)
    for (const childId of [
      ...childrenForParent(relationships.bookingCascades, id),
      ...childrenForParent(relationships.instanceComponents, id),
    ]) {
      visit(childId)
    }
  }
  visit(rootId)
  return out
}

function partIdsForBlocks(blockIds: readonly string[], partAssignments: GlobalRelationship[]): string[] {
  const blockSet = new Set(blockIds)
  return normalizeIds(
    partAssignments
      .filter((rel) => blockSet.has(String(rel.parent.id)))
      .flatMap((rel) => rel.children.map((child) => child.id))
  )
}

function activeTimeBlockIdsForService(serviceId: string, bookingCascades: GlobalRelationship[]): string[] {
  return normalizeIds(
    bookingCascades
      .filter((rel) => String(rel.parent.id) === serviceId)
      .flatMap((rel) => rel.children.map((child) => child.id))
  )
}

function partLabel(
  part: GlobalEntity<'partInstance'>,
  partShapesById: Map<string, GlobalEntity<'partShape'>>
): string {
  const shapeName = partShapesById.get(String(part.partShapeRef))?.name
  return shapeName ? `${part.name} (${shapeName})` : part.name
}

function sourceBlockSubtitle(params: {
  blockShapeName: string
  reachableBlockIds: string[]
  blockInstancesById: Map<string, GlobalEntity<'blockInstance'>>
}): string {
  const cascadedNames = params.reachableBlockIds
    .slice(1)
    .map((id) => params.blockInstancesById.get(id)?.name)
    .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
  if (cascadedNames.length === 0) {
    return params.blockShapeName
  }
  return `${params.blockShapeName}; includes cascades: ${cascadedNames.join(', ')}`
}

export function buildEventTimeClaimServiceOptions(params: {
  blockInstances: GlobalEntity<'blockInstance'>[]
  blockShapes: GlobalEntity<'blockShape'>[]
  partInstances: GlobalEntity<'partInstance'>[]
  partShapes: GlobalEntity<'partShape'>[]
  partAssignments: GlobalRelationship[]
  bookingCascades: GlobalRelationship[]
  instanceComponents: GlobalRelationship[]
}): EventTimeClaimServiceOption[] {
  const blockShapesById = new Map(params.blockShapes.map((shape) => [entityId(shape), shape]))
  const blockInstancesById = new Map(params.blockInstances.map((block) => [entityId(block), block]))
  const partInstancesById = new Map(params.partInstances.map((part) => [entityId(part), part]))
  const partShapesById = new Map(params.partShapes.map((shape) => [entityId(shape), shape]))
  const services = params.blockInstances.filter((block) => {
    const shape = blockShapesById.get(String(block.blockShapeRef))
    return (
      block.active !== false &&
      shape?.semanticType === BLOCK_SHAPE_TYPES.SERVICE &&
      isWizardTopLine(block.wizardPlacement)
    )
  })

  return services.flatMap((service) => {
    const timeBlocks = activeTimeBlockIdsForService(entityId(service), params.bookingCascades)
      .map((timeId) => blockInstancesById.get(timeId))
      .filter((block): block is GlobalEntity<'blockInstance'> => {
        const shape = block ? blockShapesById.get(String(block.blockShapeRef)) : undefined
        return (
          block !== undefined &&
          block.active !== false &&
          shape?.semanticType === BLOCK_SHAPE_TYPES.TIME &&
          isWizardTopLine(block.wizardPlacement)
        )
      })
      .map((timeBlock) => {
        const reachableBlockIds = collectReachableBlockIds(entityId(timeBlock), {
          bookingCascades: params.bookingCascades,
          instanceComponents: params.instanceComponents,
        })
        const partIds = partIdsForBlocks(reachableBlockIds, params.partAssignments)
        const parts = partIds
          .map((partId) => partInstancesById.get(partId))
          .filter((part): part is GlobalEntity<'partInstance'> => part !== undefined && part.active !== false)
          .map((part) => ({ id: entityId(part), label: partLabel(part, partShapesById) }))
        return {
          id: entityId(timeBlock),
          title: timeBlock.name,
          subtitle: sourceBlockSubtitle({
            blockShapeName: blockShapesById.get(String(timeBlock.blockShapeRef))?.name ?? 'Time block',
            reachableBlockIds,
            blockInstancesById,
          }),
          parts,
        }
      })

    if (timeBlocks.length === 0) {
      return []
    }
    return [{
      id: entityId(service),
      title: service.name,
      timeBlocks,
    }]
  })
}

export function timeBlockIdsForEventInstance(
  eventInstanceId: string,
  eventAssignments: readonly FetchedRelationship[],
  allowedTimeBlockIds: readonly unknown[]
): string[] {
  const allowed = new Set(normalizeIds(allowedTimeBlockIds))
  return normalizeIds(
    eventAssignments
      .filter((rel) =>
        rel.kind === 'eventAssignments' &&
        rel.parentKind === 'blockInstance' &&
        String(rel.childId) === eventInstanceId &&
        rel.disabled !== true &&
        allowed.has(String(rel.parentId))
      )
      .map((rel) => rel.parentId)
  )
}

export async function syncEventInstanceTimeBlockClaimAssignments(params: {
  eventInstanceId: string
  oldTimeBlockIds: readonly unknown[]
  newTimeBlockIds: readonly unknown[]
  createEventAssignment: CreateEventAssignment
  removeEventAssignment: RemoveEventAssignment
}): Promise<void> {
  const eventInstanceId = toGlobalEntityId(params.eventInstanceId)
  const oldIds = normalizeIds(params.oldTimeBlockIds)
  const newIds = normalizeIds(params.newTimeBlockIds)
  const { toAdd, toRemove } = calculateArrayDiff(oldIds, newIds)

  await Promise.all([
    ...toAdd.map((blockId) =>
      params.createEventAssignment({
        parentId: toGlobalEntityId(blockId),
        childId: eventInstanceId,
      })
    ),
    ...toRemove.map((blockId) =>
      params.removeEventAssignment(toGlobalEntityId(blockId), eventInstanceId)
    ),
  ])
}
