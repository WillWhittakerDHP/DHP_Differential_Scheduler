import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BlockInstanceEntity } from '@/types/entities'
import { getAllUserTypeBlockIds } from '@/utils/eventAttendeeUtils'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

interface DifferentialAttendeeSelectItem {
  id: GlobalEntityId
  title: string
  value: GlobalEntityId
}

/**
 * Options for Major/Minor attendee VSelects.
 * WHY: Server GET/persist now filter differential attendee ids to current state-control block instances;
 * this still merges selected ids into `items` so stale client cache or direct API edits never show raw UUID chips.
 */
export function buildDifferentialAttendeeSelectItems(
  globalData: GlobalData,
  selectedIds: readonly GlobalEntityId[]
): DifferentialAttendeeSelectItem[] {
  const blockInstances = asEmptyArray(globalData.entities.blockInstance) as BlockInstanceEntity[]
  const userTypeBlockIds = getAllUserTypeBlockIds(globalData)

  const baseItems: DifferentialAttendeeSelectItem[] = userTypeBlockIds
    .map((id) => blockInstances.find((bi) => bi.id === id))
    .filter((bi): bi is BlockInstanceEntity => bi !== undefined)
    .map((bi) => ({
      id: bi.id,
      title: bi.name?.trim() ? bi.name.trim() : `Block ${bi.id}`,
      value: bi.id,
    }))

  const seen = new Set<GlobalEntityId>(baseItems.map((x) => x.value))
  const extras: DifferentialAttendeeSelectItem[] = []

  for (const rawId of selectedIds) {
    const id = toGlobalEntityId(rawId)
    if (seen.has(id)) continue
    const bi = blockInstances.find((b) => b.id === id)
    if (bi) {
      const name = bi.name?.trim() ? bi.name.trim() : 'Block instance'
      extras.push({
        id,
        title: `${name} (inactive)`,
        value: id,
      })
    } else {
      const shortId = String(id).slice(0, 8)
      extras.push({
        id,
        title: `Removed (${shortId}…)`,
        value: id,
      })
    }
    seen.add(id)
  }

  return [...baseItems, ...extras]
}
