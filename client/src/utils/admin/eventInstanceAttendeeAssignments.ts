import type { CreateRelationshipPayload, FetchedRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'

type CreateAttendeeAssignment = (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
type RemoveAttendeeAssignment = (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>

function normalizeAttendeeIds(ids: readonly unknown[]): string[] {
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

export function attendeeIdsFromDraftValue(value: unknown): string[] {
  return Array.isArray(value) ? normalizeAttendeeIds(value) : []
}

export async function syncEventInstanceAttendeeAssignments(params: {
  eventInstanceId: string
  oldAttendeeIds: readonly unknown[]
  newAttendeeIds: readonly unknown[]
  createAttendeeAssignment: CreateAttendeeAssignment
  removeAttendeeAssignment: RemoveAttendeeAssignment
}): Promise<void> {
  const parentId = toGlobalEntityId(params.eventInstanceId)
  const oldIds = normalizeAttendeeIds(params.oldAttendeeIds)
  const newIds = normalizeAttendeeIds(params.newAttendeeIds)
  const { toAdd, toRemove } = calculateArrayDiff(oldIds, newIds)

  await Promise.all([
    ...toAdd.map((childId) =>
      params.createAttendeeAssignment({
        parentId,
        childId: toGlobalEntityId(childId),
      })
    ),
    ...toRemove.map((childId) =>
      params.removeAttendeeAssignment(parentId, toGlobalEntityId(childId))
    ),
  ])
}
