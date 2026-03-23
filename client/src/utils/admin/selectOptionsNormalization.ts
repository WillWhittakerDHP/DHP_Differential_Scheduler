import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { SelectOptionOrHeader } from '@/types/selectOptions'
import type { UseAdminReturn } from '@/composables/admin/useAdmin'
import type { createLogger } from '@/utils/logger'
import {
  buildGroupedOptionsMap,
  entitiesToFlatOptions,
  groupedMapToSelectOptions,
  resolveGroupEntityKey,
} from '@/utils/admin/selectOptionTransforms'

type SelectConfig = RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined

type Logger = ReturnType<typeof createLogger>

export function normalizeRawValueForSelect(isMultiple: boolean, value: unknown): string[] | string | null {
  if (isMultiple) {
    if (Array.isArray(value)) {
      return value.map((v) => String(v)).filter((v) => v !== '')
    }
    if (value === null || value === undefined || value === '') {
      return []
    }
    return [String(value)]
  }
  if (value === null || value === undefined || value === '') {
    return null
  }
  return String(value)
}

export function buildSelectOptionsList(
  entities: GlobalEntity<GlobalEntityKey>[],
  config: SelectConfig,
  optionLabelKey: string,
  isMultiple: boolean,
  adminComp: UseAdminReturn,
  logger: Logger
): SelectOptionOrHeader[] {
  if (config && 'groupByKey' in config && config.groupByKey && entities.length > 0) {
    try {
      const groupByKey = config.groupByKey
      if (!groupByKey) {
        return entitiesToFlatOptions(entities, optionLabelKey)
      }
      const groupEntityKey =
        resolveGroupEntityKey(String(groupByKey), 'candidateParentKey' in config ? config : undefined) ??
        (groupByKey as GlobalEntityKey)
      const groupParentMap = adminComp.getEntityMap(groupEntityKey)
      const groupedMap = buildGroupedOptionsMap(entities, String(groupByKey), groupParentMap)
      const withHeaders = isMultiple
      return groupedMapToSelectOptions(groupedMap, optionLabelKey, isMultiple, withHeaders)
    } catch (error) {
      logger.debug('Failed to group select options', {
        error,
        groupByKey: config && 'groupByKey' in config ? config.groupByKey : undefined,
      })
    }
  }

  return entitiesToFlatOptions(entities, optionLabelKey)
}
