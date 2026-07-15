/**
 * Pure transforms for grouping entities and building select options.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type {
  SelectOption,
  SelectOptionGroupHeader,
  SelectOptionOrHeader,
} from '@/types/selectOptions'
import { SELECT_OPTION_GROUP_HEADER_VALUE } from '@/types/selectOptions'
import { asEmptyArray } from '@/utils/safeDefaults'

const PROPERTY_TO_ENTITY_KEY_MAP: Record<string, GlobalEntityKey> = {
  blockShapeRef: 'blockShape',
  partShapeRef: 'partShape',
  blockShape: 'blockShape',
  partShape: 'partShape',
}

/**
 * Resolve groupByKey (and optional candidateParentKey) to the entity key used for group parent lookup.
 */
export function resolveGroupEntityKey(
  groupByKey: string,
  config?: { candidateParentKey?: GlobalEntityKey }
): GlobalEntityKey | null {
  // PATTERN: A `*Ref` group key names the parent entity directly. For accumulator links,
  // candidateParentKey is blockInstance, but blockShapeRef must still group by blockShape.
  return PROPERTY_TO_ENTITY_KEY_MAP[groupByKey] ?? config?.candidateParentKey ?? null
}

/**
 * Get display title for an entity using optionLabelKey.
 */
function getOptionTitle(
  entity: GlobalEntity<GlobalEntityKey>,
  optionLabelKey: string
): string {
  return (getEntityFieldValue(entity, optionLabelKey) as string | undefined) || String(entity.id)
}

/**
 * Map entities to flat select options (title, value).
 */
export function entitiesToFlatOptions(
  entities: GlobalEntity<GlobalEntityKey>[],
  optionLabelKey: string
): SelectOption[] {
  return entities.map((entity) => ({
    title: getOptionTitle(entity, optionLabelKey),
    value: entity.id,
  }))
}

/** Internal: one group with parent and children for option building. */
interface GroupWithParent {
  parent: GlobalEntity<GlobalEntityKey>
  children: GlobalEntity<GlobalEntityKey>[]
}

interface SelectOptionGroup extends SelectOption {
  children: SelectOption[]
}

/**
 * Build a map of group key -> { parent, children } for grouped select options.
 * Skips entities whose group key is not found in groupParentMap.
 */
export function buildGroupedOptionsMap(
  entities: GlobalEntity<GlobalEntityKey>[],
  groupByKey: string,
  groupParentMap: Map<string, GlobalEntity<GlobalEntityKey>>
): Map<string, GroupWithParent> {
  const groupedMap = new Map<string, GroupWithParent>()

  for (const entity of entities) {
    const groupKey =
      getEntityFieldValue(entity, groupByKey) ?? getEntityFieldValue(entity, `${groupByKey}Ref`)
    if (!groupKey) continue

    const groupKeyStr = String(groupKey)
    if (!groupedMap.has(groupKeyStr)) {
      const groupParent = groupParentMap.get(toGlobalEntityId(groupKeyStr))
      if (!groupParent) continue
      groupedMap.set(groupKeyStr, { parent: groupParent, children: [] })
    }
    const group = groupedMap.get(groupKeyStr)
    if (group) group.children.push(entity)
  }

  return groupedMap
}

function groupToSelectOptionGroup(group: GroupWithParent, optionLabelKey: string): SelectOptionGroup {
  return {
    title: getOptionTitle(group.parent, optionLabelKey),
    value: `group-${group.parent.id}`,
    children: group.children.map((entity) => ({
      title: getOptionTitle(entity, optionLabelKey),
      value: entity.id,
    })),
  }
}

function groupedEntitiesToSelectOptionGroups(
  groupedMap: Map<string, GroupWithParent>,
  optionLabelKey: string
): SelectOptionGroup[] {
  return Array.from(groupedMap.values()).map((group) => groupToSelectOptionGroup(group, optionLabelKey))
}

function groupHeaderOption(groupLabel: string): SelectOptionGroupHeader {
  return {
    header: groupLabel,
    title: groupLabel,
    value: SELECT_OPTION_GROUP_HEADER_VALUE,
  } as SelectOptionGroupHeader
}

function groupedOptionsWithHeaders(groups: SelectOptionGroup[]): SelectOptionOrHeader[] {
  return groups.flatMap((group) => [
    groupHeaderOption(group.title),
    ...asEmptyArray(group.children),
  ])
}

function groupedOptionsWithoutHeaders(groups: SelectOptionGroup[]): SelectOption[] {
  return groups.flatMap((group) => asEmptyArray(group.children))
}

/**
 * Convert grouped map to select options.
 * - When isMultiple && withHeaders: flat array with group header rows (block shape name) then options per group.
 * - When isMultiple && !withHeaders: flat list of options only (legacy).
 * - When !isMultiple: nested result (group objects with children).
 */
export function groupedMapToSelectOptions(
  groupedMap: Map<string, GroupWithParent>,
  optionLabelKey: string,
  isMultiple: boolean,
  withHeaders: boolean = false
): SelectOption[] | SelectOptionOrHeader[] {
  const groups = groupedEntitiesToSelectOptionGroups(groupedMap, optionLabelKey)

  if (!isMultiple) {
    return groups
  }
  return withHeaders ? groupedOptionsWithHeaders(groups) : groupedOptionsWithoutHeaders(groups)
}
