/**
 * PATTERN: Select Options Composable

PATTERN: Composable that transforms entities ...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useAdmin } from './admin/useAdmin'
import { createLogger } from '@/utils/logger'
import {
  buildGroupedEntities,
  buildGroupedOptionsMap,
  entitiesToFlatOptions,
  groupedMapToSelectOptions,
  resolveGroupEntityKey,
} from '@/utils/admin/selectOptionTransforms'
import type {
  GroupedEntities,
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
  
  const groupedByKey = computed((): GroupedEntities[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value
    if (!config || !('groupByKey' in config) || !config.groupByKey || entities.length === 0) {
      return []
    }
    const groupByKey = config.groupByKey
    const groupEntityKey = resolveGroupEntityKey(String(groupByKey), 'candidateParentKey' in config ? config : undefined)
    const groupParentMap = groupEntityKey ? adminComp.getEntityMap(groupEntityKey) : new Map()
    return buildGroupedEntities(
      entities,
      String(groupByKey),
      groupParentMap,
      String(optionLabelKey.value)
    )
  })
  
  /**
   */
  const shouldUseMultipleSelects = computed(() => {
    const config = selectConfig.value
    if (!config || !('groupByKey' in config) || !config.groupByKey) {
      return false
    }
    
    const groups = groupedByKey.value
    return groups.length > 1
  })
  
  const getGroupOptions = (group: GroupedEntities): SelectOption[] => {
    return entitiesToFlatOptions(group.entities, String(optionLabelKey.value))
  }
  
  /**
   */
  const getGroupValue = (group: GroupedEntities): string | string[] | null => {
    const currentValue = rawFieldValue.value
    const groupEntityIds = new Set(group.entities.map(e => e.id))
    
    if (isMultiple.value) {
      const valueArray = Array.isArray(currentValue) 
        ? currentValue.map(v => String(v))
        : currentValue ? [String(currentValue)] : []
      
      const groupValues = valueArray.filter(v => groupEntityIds.has(toGlobalEntityId(v)))
      return groupValues.length > 0 ? groupValues : []
    } else {
      const valueString = currentValue ? String(currentValue) : null
      return valueString && groupEntityIds.has(toGlobalEntityId(valueString)) ? valueString : null
    }
  }
  
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
        return groupedMapToSelectOptions(
          groupedMap,
          String(optionLabelKey.value),
          isMultiple.value
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
    groupedByKey,
    shouldUseMultipleSelects,
    getGroupOptions,
    getGroupValue,
    normalizedValue
  }
}

