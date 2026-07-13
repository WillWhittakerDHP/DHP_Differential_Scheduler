/**
 * WHY: Keeps useInstanceDragAndDrop thin so composable-logic audit stays within thresholds.
 * NOTE: Grouped-zone drag end + orderIndex persistence live in `blockInstanceDragOrderOrchestrator.ts`.
 */
import type { BlockInstanceEntity } from '@/types/entities'
import type { GlobalEntity } from '@/types/entities'
import { groupedInstanceDragZoneKey as groupedInstanceDragZoneKeyUtil } from '@/utils/admin/instanceDragZoneKeys'
import { isWizardTopLine } from '@shared/constants/wizardPlacement'

function isAdminStandaloneSectionCore(instance: GlobalEntity<'blockInstance'>): boolean {
  const b = instance as BlockInstanceEntity
  return isWizardTopLine(b.wizardPlacement)
}

export function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  return isAdminStandaloneSectionCore(instance)
}

/** Re-export for callers; canonical impl in utils (instance drag bind helpers). */
export const groupedInstanceDragZoneKey = groupedInstanceDragZoneKeyUtil

function listMembershipSignature(instancesMap: Map<string, GlobalEntity<'blockInstance'>[]>): string {
  return Array.from(instancesMap.entries())
    .map(([shapeId, list]) => `${shapeId}:${[...list].map((i) => i.id).sort().join(',')}`)
    .sort()
    .join('|')
}

export function dragLayoutSignature(
  mainMap: Map<string, GlobalEntity<'blockInstance'>[]>,
  groupedMap: Map<string, GlobalEntity<'blockInstance'>[]>
): string {
  return `${listMembershipSignature(mainMap)}||${listMembershipSignature(groupedMap)}`
}
