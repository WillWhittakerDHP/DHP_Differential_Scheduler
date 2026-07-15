import type { GlobalEntity } from '@/types/entities'
import type { CreateRelationshipPayload, FetchedRelationship, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'

type CreateEventAssignment = (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
type RemoveEventAssignment = (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>

export interface ServiceEventOption {
  id: string
  title: string
}

export interface ServiceBlockEventSelectionState {
  defaultEventId: string | null
  optionEventIds: string[]
  eventOptions: ServiceEventOption[]
}

function idOf(entity: { id: unknown }): string {
  return String(entity.id)
}

function allowedEventShapeIdsForBlock(
  block: GlobalEntity<'blockInstance'> | undefined,
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
): Set<string> {
  const shape = block ? blockShapesById.get(String(block.blockShapeRef)) : undefined
  return new Set((shape?.validEventCascades ?? []).map((id) => String(id)))
}

function selectedEventIdsForBlock(blockInstanceId: string, eventAssignments: GlobalRelationship[]): string[] {
  return eventAssignments
    .filter((rel) => rel.parent.entityKey === 'blockInstance' && String(rel.parent.id) === blockInstanceId)
    .flatMap((rel) =>
      rel.children
        .filter((child) => child.entityKey === 'eventInstance' && child.active !== false)
        .map((child) => String(child.id))
    )
}

function eventOption(event: GlobalEntity<'eventInstance'>): ServiceEventOption {
  return { id: idOf(event), title: event.name }
}

function candidateEventOptions(params: {
  eventInstances: GlobalEntity<'eventInstance'>[]
  allowedEventShapeIds: Set<string>
}): ServiceEventOption[] {
  return params.eventInstances
    .filter((event) => {
      if (event.active === false) return false
      if (params.allowedEventShapeIds.size === 0) return true
      return params.allowedEventShapeIds.has(String(event.eventShapeRef))
    })
    .map(eventOption)
    .sort((a, b) => a.title.localeCompare(b.title))
}

function optionsIncludingSelected(params: {
  candidates: ServiceEventOption[]
  selectedEventIds: string[]
  eventInstancesById: Map<string, GlobalEntity<'eventInstance'>>
}): ServiceEventOption[] {
  const byId = new Map(params.candidates.map((option) => [option.id, option]))
  for (const eventId of params.selectedEventIds) {
    const event = params.eventInstancesById.get(eventId)
    if (event && !byId.has(eventId)) {
      byId.set(eventId, eventOption(event))
    }
  }
  return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title))
}

export function buildServiceBlockEventSelectionState(params: {
  blockInstanceId: string
  blockInstances: GlobalEntity<'blockInstance'>[]
  blockShapes: GlobalEntity<'blockShape'>[]
  eventInstances: GlobalEntity<'eventInstance'>[]
  eventAssignments: GlobalRelationship[]
}): ServiceBlockEventSelectionState {
  const blockInstancesById = new Map(params.blockInstances.map((block) => [idOf(block), block]))
  const blockShapesById = new Map(params.blockShapes.map((shape) => [idOf(shape), shape]))
  const eventInstancesById = new Map(params.eventInstances.map((event) => [idOf(event), event]))
  const block = blockInstancesById.get(params.blockInstanceId)
  const defaultEventId = typeof block?.defaultEventInstanceId === 'string'
    ? block.defaultEventInstanceId
    : null
  const selectedEventIds = selectedEventIdsForBlock(params.blockInstanceId, params.eventAssignments)
  const optionEventIds = selectedEventIds.filter((eventId) => eventId !== defaultEventId)
  const selectedForDisplay = defaultEventId ? [defaultEventId, ...optionEventIds] : optionEventIds
  const candidates = candidateEventOptions({
    eventInstances: params.eventInstances,
    allowedEventShapeIds: allowedEventShapeIdsForBlock(block, blockShapesById),
  })
  return {
    defaultEventId,
    optionEventIds,
    eventOptions: optionsIncludingSelected({ candidates, selectedEventIds: selectedForDisplay, eventInstancesById }),
  }
}

export async function syncBlockEventAssignments(params: {
  blockInstanceId: string
  defaultEventId: string | null
  optionEventIds: readonly unknown[]
  oldAssignedEventIds: readonly unknown[]
  createEventAssignment: CreateEventAssignment
  removeEventAssignment: RemoveEventAssignment
}): Promise<void> {
  const parentId = toGlobalEntityId(params.blockInstanceId)
  const desiredIds = [
    ...(params.defaultEventId ? [params.defaultEventId] : []),
    ...params.optionEventIds.map((id) => String(id)),
  ]
  const { toAdd, toRemove } = calculateArrayDiff(
    params.oldAssignedEventIds.map((id) => String(id)),
    Array.from(new Set(desiredIds))
  )
  await Promise.all([
    ...toAdd.map((eventId) => params.createEventAssignment({ parentId, childId: toGlobalEntityId(eventId) })),
    ...toRemove.map((eventId) => params.removeEventAssignment(parentId, toGlobalEntityId(eventId))),
  ])
}
