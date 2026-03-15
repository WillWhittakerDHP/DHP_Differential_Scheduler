/**
 * Pure transforms for grouping entities and building select options.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type {
  GroupedEntities,
  SelectOption,
  SelectOptionGroupHeader,
  SelectOptionOrHeader,
} from '@/types/selectOptions'
import { SELECT_OPTION_GROUP_HEADER_VALUE } from '@/types/selectOptions'
import { asEmptyArray } from '@/utils/safeDefaults'
import { createLogger } from '@/utils/logger'

const logger = createLogger('selectOptionTransforms')

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
  if (config?.candidateParentKey) return config.candidateParentKey
  return PROPERTY_TO_ENTITY_KEY_MAP[groupByKey] ?? null
}

/**
 * Get display title for an entity using optionLabelKey.
 */
export function getOptionTitle(
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
export interface GroupWithParent {
  parent: GlobalEntity<GlobalEntityKey>
  children: GlobalEntity<GlobalEntityKey>[]
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
  const groupedEntities = Array.from(groupedMap.values())
  const result = groupedEntities.map((group) => ({
    title: getOptionTitle(group.parent, optionLabelKey),
    value: `group-${group.parent.id}`,
    children: group.children.map((entity) => ({
      title: getOptionTitle(entity, optionLabelKey),
      value: entity.id,
    })),
  }))

  if (isMultiple) {
    if (withHeaders) {
      const withHeaderRows: SelectOptionOrHeader[] = []
      for (const group of result) {
        const groupLabel = group.title
        withHeaderRows.push({
          header: groupLabel,
          title: groupLabel,
          value: SELECT_OPTION_GROUP_HEADER_VALUE,
        } as SelectOptionGroupHeader)
        for (const child of asEmptyArray(group.children)) {
          withHeaderRows.push(child)
        }
      }
      return withHeaderRows
    }
    return result.flatMap((group) => asEmptyArray(group.children))
  }
  return result
}

/**
 * Build GroupedEntities[] for groupedByKey display (group key, label, entities).
 */
export function buildGroupedEntities(
  entities: GlobalEntity<GlobalEntityKey>[],
  groupByKey: string,
  groupParentMap: Map<string, GlobalEntity<GlobalEntityKey>>,
  optionLabelKey: string
): GroupedEntities[] {
  const groupedMap = new Map<string, { groupKey: string; groupLabel: string; entities: GlobalEntity<GlobalEntityKey>[] }>()

  const failedLookups: string[] = []
  const mapKeysSample = Array.from(groupParentMap.keys()).slice(0, 8)

  for (const entity of entities) {
    const groupKey =
      getEntityFieldValue(entity, groupByKey) ?? getEntityFieldValue(entity, `${groupByKey}Ref`)
    if (!groupKey) continue

    const groupKeyString = String(groupKey)
    if (!groupedMap.has(groupKeyString)) {
      const normalizedKey = toGlobalEntityId(groupKeyString)
      const groupParent = groupParentMap.get(normalizedKey)
      if (!groupParent) {
        failedLookups.push(groupKeyString)
      }
      const groupLabel = groupParent
        ? getOptionTitle(groupParent, optionLabelKey)
        : groupKeyString
      groupedMap.set(groupKeyString, {
        groupKey: groupKeyString,
        groupLabel,
        entities: [],
      })
    }
    const group = groupedMap.get(groupKeyString)
    if (group) group.entities.push(entity)
  }

  if (failedLookups.length > 0 && groupByKey === 'blockShapeRef') {
    logger.debug('[hypothesis B] groupParentMap lookup failed', {
      failedGroupKeyStrings: failedLookups,
      mapKeysSample,
      entitiesCount: entities.length,
      groupParentMapSize: groupParentMap.size
    })
  }

  return Array.from(groupedMap.values())
}

/**
 * Build GroupedEntities[] from a list of valid shape IDs (e.g. validCascades on block shape).
 * Ensures every valid shape gets a group with correct label even when it has zero instances.
 */
export function buildGroupedEntitiesFromValidShapeIds(
  validShapeIds: string[],
  entities: GlobalEntity<GlobalEntityKey>[],
  groupByKey: string,
  groupParentMap: Map<string, GlobalEntity<GlobalEntityKey>>,
  optionLabelKey: string
): GroupedEntities[] {
  const refKey = groupByKey === 'blockShapeRef' || groupByKey === 'partShapeRef'
    ? groupByKey
    : `${groupByKey}Ref`
  return validShapeIds.map((shapeId) => {
    const groupKeyString = String(shapeId)
    const groupParent = groupParentMap.get(toGlobalEntityId(groupKeyString))
    const groupLabel = groupParent
      ? getOptionTitle(groupParent, optionLabelKey)
      : groupKeyString
    const groupEntities = entities.filter((entity) => {
      const entityRef =
        getEntityFieldValue(entity, groupByKey) ?? getEntityFieldValue(entity, refKey)
      return entityRef != null && String(entityRef) === groupKeyString
    })
    return {
      groupKey: groupKeyString,
      groupLabel,
      entities: groupEntities,
    }
  })
}
