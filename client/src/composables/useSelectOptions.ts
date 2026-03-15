/**
 * PATTERN: Select Options Composable

PATTERN: Composable that transforms entities ...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useAdmin } from './admin/useAdmin'
import { createLogger } from '@/utils/logger'
import {
  buildGroupedOptionsMap,
  entitiesToFlatOptions,
  groupedMapToSelectOptions,
  resolveGroupEntityKey,
} from '@/utils/admin/selectOptionTransforms'
import type {
  SelectOption,
  UseSelectOptionsOptions,
  UseSelectOptionsReturn,
} from '@/types/selectOptions'

export type {
  GroupedEntities,
  SelectOption,
  SelectOptionBase,
  UseSelectOptionsOptions,
  UseSelectOptionsReturn,
} from '@/types/selectOptions'

const logger = createLogger('useSelectOptions')

export function useSelectOptions(opts: UseSelectOptionsOptions): UseSelectOptionsReturn {
  const {
    filteredEntities,
    selectConfig,
    optionLabelKey,
    isMultiple,
    rawFieldValue,
    adminComp: providedAdminComp
  } = opts

  const adminComp = providedAdminComp || useAdmin()

  const options = computed((): SelectOption[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value

    if (config && 'groupByKey' in config && config.groupByKey && entities.length > 0) {
      try {
        const groupByKey = config.groupByKey
        if (!groupByKey) {
          return entitiesToFlatOptions(entities, String(optionLabelKey.value))
        }
        const groupEntityKey =
          resolveGroupEntityKey(String(groupByKey), 'candidateParentKey' in config ? config : undefined) ??
          (groupByKey as GlobalEntityKey)
        const groupParentMap = adminComp.getEntityMap(groupEntityKey)
        const groupedMap = buildGroupedOptionsMap(entities, String(groupByKey), groupParentMap)
        const withHeaders = isMultiple.value
        return groupedMapToSelectOptions(
          groupedMap,
          String(optionLabelKey.value),
          isMultiple.value,
          withHeaders
        )
      } catch (error) {
        logger.debug('Failed to group select options', { error, groupByKey: config?.groupByKey })
      }
    }

    return entitiesToFlatOptions(entities, String(optionLabelKey.value))
  })
  
  /**
   */
  const normalizedValue = computed(() => {
    const value = rawFieldValue.value
    
    if (isMultiple.value) {
      if (Array.isArray(value)) {
        return value.map(v => String(v)).filter(v => v !== '')
      }
      if (value === null || value === undefined || value === '') {
        return []
      }
      if (typeof value === 'string') {
        return [String(value)]
      }
      return [String(value)]
    }
    
    if (value === null || value === undefined || value === '') {
      return null
    }
    return String(value)
  })
  
  return {
    options,
    normalizedValue
  }
}

