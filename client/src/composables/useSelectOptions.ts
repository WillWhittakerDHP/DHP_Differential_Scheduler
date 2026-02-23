/**
 * PATTERN: Select Options Composable

PATTERN: Composable that transforms entities ...
 */
import { computed, type Ref } from 'vue'
import type { SelectGroup } from '@/types/entity/selectOptions'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { useAdmin } from './admin/useAdmin'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useSelectOptions')

/** Map from property/ref names to entity keys for group resolution. Single source for groupedByKey and options. */
const PROPERTY_TO_ENTITY_KEY_MAP: Record<string, GlobalEntityKey> = {
  blockShapeRef: 'blockShape',
  partShapeRef: 'partShape',
  blockShape: 'blockShape',
  partShape: 'partShape',
}

/**
 * Resolve groupByKey (and optional candidateParentKey) to the entity key used for group parent lookup.
 */
function resolveGroupEntityKey(
  groupByKey: string,
  config?: { candidateParentKey?: GlobalEntityKey }
): GlobalEntityKey | null {
  if (config?.candidateParentKey) {
    return config.candidateParentKey
  }
  return PROPERTY_TO_ENTITY_KEY_MAP[groupByKey] ?? null
}

/** Base shape for select options (P2 type-similarity); USStateOption matches, SelectOption adds children. */
export interface SelectOptionBase {
  title: string
  value: string
}

export interface SelectOption extends SelectOptionBase {
  children?: SelectOption[]
}

/** SelectGroup plus entities list; extends shared group key/label shape. */
export interface GroupedEntities extends SelectGroup {
  entities: GlobalEntity<GlobalEntityKey>[]
}

export interface UseSelectOptionsOptions {
  filteredEntities: Ref<GlobalEntity<GlobalEntityKey>[]>
  selectConfig: Ref<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  optionLabelKey: Ref<string>
  isMultiple: Ref<boolean>
  rawFieldValue: Ref<unknown>
  fieldKey?: Ref<string>
  adminComp?: ReturnType<typeof useAdmin>
}

export interface UseSelectOptionsReturn {
  options: Ref<SelectOption[]>
  groupedByKey: Ref<GroupedEntities[]>
  shouldUseMultipleSelects: Ref<boolean>
  
  getGroupOptions: (group: GroupedEntities) => SelectOption[]
  getGroupValue: (group: GroupedEntities) => string | string[] | null
  
  normalizedValue: Ref<string | string[] | null>
}

/**
 * WHY: Select Options Composable

LEARNING: Transforms entities into select opt...
 */
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
  
  /**
   */
  const groupedByKey = computed((): GroupedEntities[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value
    
    if (!config || !('groupByKey' in config) || !config.groupByKey || entities.length === 0) {
      return []
    }
    
    const groupByKey = config.groupByKey
    const groupEntityKey = resolveGroupEntityKey(String(groupByKey), 'candidateParentKey' in config ? config : undefined)
    const groupParentMap = groupEntityKey ? adminComp.getEntityMap(groupEntityKey) : new Map()
    
    const groupedMap = new Map<string, { 
      groupKey: string
      groupLabel: string
      entities: GlobalEntity<GlobalEntityKey>[]
    }>()
    
    entities.forEach((entity) => {
      const groupKeyStr = String(groupByKey)
      const groupKey =
        getEntityFieldValue(entity, groupKeyStr) ??
        getEntityFieldValue(entity, `${groupKeyStr}Ref`)
      
      if (!groupKey) {
        return // Skip entities without group key
      }
      
      const groupKeyString = String(groupKey)
      
      if (!groupedMap.has(groupKeyString)) {
        const groupParent = groupEntityKey ? groupParentMap.get(groupKeyString) : null
        const groupLabel = groupParent 
          ? (getEntityFieldValue(groupParent, String(optionLabelKey.value)) as string | undefined) || String(groupParent.id)
          : groupKeyString // Use group key when parent not found
        
        groupedMap.set(groupKeyString, {
          groupKey: groupKeyString,
          groupLabel,
          entities: []
        })
      }
      
      const group = groupedMap.get(groupKeyString)
      if (group) {
        group.entities.push(entity)
      }
    })
    
    return Array.from(groupedMap.values())
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
  
  /**
   * PATTERN: Map entities in group to { title, value } format
   */
  const getGroupOptions = (group: GroupedEntities): SelectOption[] => {
    return group.entities.map((entity) => ({
      title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String(entity.id),
      value: entity.id
    }))
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
  
  /**
   * WHY: /**
LEARNING: Transform entities to select options format
WHY: AppSelect...
   */
  const options = computed((): SelectOption[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value
    
    // NOTE: AppSelect with grouped options and multiple selection (chips) has issues finding items
    if (config && 'groupByKey' in config && config.groupByKey && entities.length > 0) {
      try {
        // PATTERN: Get entity map for groupByKey entity type (e.g., blockShape)
        const groupByKey = config.groupByKey
        if (!groupByKey) {
          return entities.map((entity) => ({
            title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String((entity as GlobalEntity<GlobalEntityKey>).id),
            value: String((entity as GlobalEntity<GlobalEntityKey>).id)
          }))
        }
        
        const groupEntityKey = resolveGroupEntityKey(String(groupByKey), 'candidateParentKey' in config ? config : undefined) ?? (groupByKey as GlobalEntityKey)
        
        const groupParentMap = adminComp.getEntityMap(groupEntityKey)
        
        const groupedMap = new Map<string, { parent: GlobalEntity<GlobalEntityKey>; children: GlobalEntity<GlobalEntityKey>[] }>()
        
        // LEARNING: Handle both direct property access and ref pattern (e.g., blockShape vs blockShapeRef)
        // PATTERN: Try direct property first, then ref pattern, matching React's getProperty fallback
        let _skippedCount = 0
        let _addedCount = 0
        
        entities.forEach((entity) => {
          const groupKeyStr = String(groupByKey)
          const groupKey =
            getEntityFieldValue(entity, groupKeyStr) ??
            getEntityFieldValue(entity, `${groupKeyStr}Ref`)
          
          if (!groupKey) {
            _skippedCount++
            return
          }
          
          if (!groupedMap.has(String(groupKey))) {
            const groupParent = groupParentMap.get(toGlobalEntityId(String(groupKey)))
            if (groupParent) {
              groupedMap.set(String(groupKey), {
                parent: groupParent,
                children: []
              })
            } else {
              _skippedCount++
              return
            }
          }
          
          if (groupedMap.has(String(groupKey))) {
            groupedMap.get(String(groupKey))!.children.push(entity as GlobalEntity<GlobalEntityKey>)
            _addedCount++
          } else {
            _skippedCount++
          }
        })
        
        /**
         * LEARNING: Transform grouped entities to select options format
         */
        const groupedEntities = Array.from(groupedMap.values())
        const result = groupedEntities.map(group => ({
          title: (getEntityFieldValue(group.parent, String(optionLabelKey.value)) as string | undefined) || String(group.parent.id),
          value: `group-${group.parent.id}`, // Group header value (not selectable)
          children: group.children.map((entity) => {
            const title = (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String(entity.id)
            return {
              title,
              value: entity.id
            }
          })
        }))
        
        if (isMultiple.value) {
          const flattened = result.flatMap(group => group.children)
          return flattened
        }
        
        return result
      } catch (error) {
        logger.debug('Failed to group select options', { error, groupByKey: config.groupByKey })
      }
    }
    
    const flatOptions = entities.map((entity) => ({
      title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String((entity as GlobalEntity<GlobalEntityKey>).id),
      value: String((entity as GlobalEntity<GlobalEntityKey>).id)
    }))
    
    return flatOptions
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

