/**
 * Select Options Composable
 * 
 * LEARNING: Provides select option transformation logic extracted from SelectInputs component
 * WHY: Encapsulates all option mapping, grouping, value normalization, and transformation logic
 * PATTERN: Composable that transforms entities into select options format with grouping support
 * 
 * This composable addresses recursion issues by moving all data transformations out of components
 * and into properly memoized computed properties.
 */

import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { useAdmin } from './useAdmin'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

/**
 * Select Option Format
 */
export interface SelectOption {
  title: string
  value: string
  children?: SelectOption[]
}

/**
 * Grouped Entities Format (for multiple selects)
 */
export interface GroupedEntities {
  groupKey: string
  groupLabel: string
  entities: GlobalEntity<GlobalEntityKey>[]
}

/**
 * Select Options Composable Options
 */
export interface UseSelectOptionsOptions {
  filteredEntities: Ref<GlobalEntity<GlobalEntityKey>[]>
  selectConfig: Ref<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  optionLabelKey: Ref<string>
  isMultiple: Ref<boolean>
  rawFieldValue: Ref<unknown>
  fieldKey?: Ref<string>
  adminComp?: ReturnType<typeof useAdmin>
}

/**
 * Select Options Composable Return Type
 */
export interface UseSelectOptionsReturn {
  // Transformed options
  options: Ref<SelectOption[]>
  groupedByKey: Ref<GroupedEntities[]>
  shouldUseMultipleSelects: Ref<boolean>
  
  // Helper functions
  getGroupOptions: (group: GroupedEntities) => SelectOption[]
  getGroupValue: (group: GroupedEntities) => string | string[] | null
  
  // Value normalization
  normalizedValue: Ref<string | string[] | null>
}

/**
 * Select Options Composable
 * 
 * LEARNING: Transforms entities into select options format with grouping and value normalization
 * WHY: Prevents recursion by moving all transformations to computed properties
 * PATTERN: Composable with computed options and helper functions for group operations
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
  
  // Initialize admin composable
  const adminComp = providedAdminComp || useAdmin()
  
  /**
   * LEARNING: Group entities by groupByKey value
   * WHY: When groupByKey is configured, we want to group entities by that property (e.g., blockShapeRef)
   * PATTERN: Group filtered entities by groupByKey value, get group labels from parent entities
   */
  const groupedByKey = computed((): GroupedEntities[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value
    
    if (!config || !('groupByKey' in config) || !config.groupByKey || entities.length === 0) {
      return []
    }
    
    const groupByKey = config.groupByKey
    
    // LEARNING: Map property keys to entity keys for entity map lookup
    // WHY: groupByKey is a property key (e.g., 'blockShapeRef'), but getEntityMap needs entity key (e.g., 'blockShape')
    // PATTERN: Infer entity key from groupByKey pattern or use config's candidateParentKey
    let groupEntityKey: GlobalEntityKey | null = null
    
    // Try to infer from config's candidateParentKey if available
    if ('candidateParentKey' in config && config.candidateParentKey) {
      groupEntityKey = config.candidateParentKey as GlobalEntityKey
    } else {
      // Fallback: infer from groupByKey pattern
      const propertyToEntityKeyMap: Record<string, GlobalEntityKey> = {
        'blockShapeRef': 'blockShape',
        'partShapeRef': 'partShape',
        'blockShape': 'blockShape',
        'partShape': 'partShape'
      }
      groupEntityKey = propertyToEntityKeyMap[groupByKey] || null
    }
    
    // Get parent entity map if we have an entity key
    const groupParentMap = groupEntityKey ? adminComp.getEntityMap(groupEntityKey) : new Map()
    
    // Group entities by their groupByKey property value
    const groupedMap = new Map<string, { 
      groupKey: string
      groupLabel: string
      entities: GlobalEntity<GlobalEntityKey>[]
    }>()
    
    entities.forEach((entity) => {
      // Try direct property first, then ref pattern
      const groupKey =
        getEntityFieldValue(entity, groupByKey) ??
        getEntityFieldValue(entity, `${groupByKey}Ref`)
      
      if (!groupKey) {
        return // Skip entities without group key
      }
      
      const groupKeyString = String(groupKey)
      
      // Initialize group if not exists
      if (!groupedMap.has(groupKeyString)) {
        // Try to get parent entity for label
        const groupParent = groupEntityKey ? groupParentMap.get(groupKeyString) : null
        const groupLabel = groupParent 
          ? (getEntityFieldValue(groupParent, String(optionLabelKey.value)) as string | undefined) || String(groupParent.id)
          : groupKeyString // Fallback to group key if parent not found
        
        groupedMap.set(groupKeyString, {
          groupKey: groupKeyString,
          groupLabel,
          entities: []
        })
      }
      
      // Add entity to its group
      const group = groupedMap.get(groupKeyString)
      if (group) {
        group.entities.push(entity)
      }
    })
    
    return Array.from(groupedMap.values())
  })
  
  /**
   * LEARNING: Detect when to use multiple select fields instead of single grouped select
   * WHY: When there are multiple distinct groups, separate selects provide clearer UX
   * PATTERN: Use multiple selects when groupByKey is configured AND there are multiple groups
   */
  const shouldUseMultipleSelects = computed(() => {
    const config = selectConfig.value
    if (!config || !('groupByKey' in config) || !config.groupByKey) {
      return false
    }
    
    const groups = groupedByKey.value
    // Use multiple selects when there are 2+ distinct groups
    return groups.length > 1
  })
  
  /**
   * LEARNING: Get options for a specific group
   * WHY: When using multiple selects, each select needs its own options
   * PATTERN: Map entities in group to { title, value } format
   */
  const getGroupOptions = (group: GroupedEntities): SelectOption[] => {
    return group.entities.map((entity) => ({
      title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String(entity.id),
      value: String(entity.id)
    }))
  }
  
  /**
   * LEARNING: Get selected values for a specific group
   * WHY: When using multiple selects, need to split fieldValue across groups
   * PATTERN: Filter fieldValue to only include entities that belong to this group
   */
  const getGroupValue = (group: GroupedEntities): string | string[] | null => {
    const currentValue = rawFieldValue.value
    const groupEntityIds = new Set(group.entities.map(e => String(e.id)))
    
    if (isMultiple.value) {
      const valueArray = Array.isArray(currentValue) 
        ? currentValue.map(v => String(v))
        : currentValue ? [String(currentValue)] : []
      
      const groupValues = valueArray.filter(v => groupEntityIds.has(v))
      return groupValues.length > 0 ? groupValues : []
    } else {
      const valueString = currentValue ? String(currentValue) : null
      return valueString && groupEntityIds.has(valueString) ? valueString : null
    }
  }
  
  /**
   * LEARNING: Transform entities to select options format
   * WHY: AppSelect needs { title, value } format, optionally grouped
   * PATTERN: Map entities to option format, handle grouping if configured
   */
  const options = computed((): SelectOption[] => {
    const entities = filteredEntities.value
    const config = selectConfig.value
    
    // Handle grouping if configured (e.g., bookingCascades grouped by blockShape)
    // NOTE: AppSelect with grouped options and multiple selection (chips) has issues finding items
    // When chips render, AppSelect/Vuetify looks for items by value but can't find them in nested children structure
    // Solution: For multiple selection, flatten grouped options so chips can display titles correctly
    if (config && 'groupByKey' in config && config.groupByKey && entities.length > 0) {
      try {
        // LEARNING: Use Map for O(1) lookups instead of O(n) array searches
        // WHY: Efficient entity lookups for grouping parent entities
        // PATTERN: Get entity map for groupByKey entity type (e.g., blockShape)
        const groupByKey = config.groupByKey
        if (!groupByKey) {
          return entities.map((entity) => ({
            title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String((entity as GlobalEntity<GlobalEntityKey>).id),
            value: String((entity as GlobalEntity<GlobalEntityKey>).id)
          }))
        }
        
        // LEARNING: Map property keys to entity keys for entity map lookup
        // WHY: groupByKey is a property key (e.g., 'blockShapeRef'), but getEntityMap needs entity key (e.g., 'blockShape')
        // PATTERN: Map common property keys to their corresponding entity keys
        const propertyToEntityKeyMap: Record<string, GlobalEntityKey> = {
          'blockShapeRef': 'blockShape',
          'partShapeRef': 'partShape',
          'blockShape': 'blockShape', // In case it's already an entity key
          'partShape': 'partShape'    // In case it's already an entity key
        }
        
        const groupEntityKey = propertyToEntityKeyMap[groupByKey] || groupByKey as GlobalEntityKey
        
        const groupParentMap = adminComp.getEntityMap(groupEntityKey)
        
        const groupedMap = new Map<string, { parent: GlobalEntity<GlobalEntityKey>; children: GlobalEntity<GlobalEntityKey>[] }>()
        
        // Group entities by their groupByKey property value
        // LEARNING: Handle both direct property access and ref pattern (e.g., blockShape vs blockShapeRef)
        // WHY: Entities may have direct property (blockShape) or ref property (blockShapeRef)
        // PATTERN: Try direct property first, then ref pattern, matching React's getProperty fallback
        let skippedCount = 0
        let addedCount = 0
        
        entities.forEach((entity) => {
          // Get the group key from entity
          // For blockInstance grouped by blockShape: try entity.blockShape, then entity.blockShapeRef
          const groupKey =
            getEntityFieldValue(entity, groupByKey) ??
            getEntityFieldValue(entity, `${groupByKey}Ref`)
          
          if (!groupKey) {
            skippedCount++
            return
          }
          
          // Initialize group if not exists
          if (!groupedMap.has(String(groupKey))) {
            const groupParent = groupParentMap.get(String(groupKey))
            if (groupParent) {
              groupedMap.set(String(groupKey), {
                parent: groupParent,
                children: []
              })
            } else {
              skippedCount++
              return
            }
          }
          
          // Add entity to its group
          if (groupedMap.has(String(groupKey))) {
            groupedMap.get(String(groupKey))!.children.push(entity as GlobalEntity<GlobalEntityKey>)
            addedCount++
          } else {
            skippedCount++
          }
        })
        
        /**
         * LEARNING: Transform grouped entities to select options format
         * WHY: Allows grouping options by parent entity (e.g., blockInstances grouped by blockShape)
         * PATTERN: Group header has title and children array, children have title and value
         */
        const groupedEntities = Array.from(groupedMap.values())
        const result = groupedEntities.map(group => ({
          title: (getEntityFieldValue(group.parent, String(optionLabelKey.value)) as string | undefined) || String(group.parent.id),
          value: `group-${group.parent.id}`, // Group header value (not selectable)
          children: group.children.map((entity) => {
            const title = (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String(entity.id)
            return {
              title,
              value: String(entity.id)
            }
          })
        }))
        
        // For multiple selection with chips, AppSelect/Vuetify can't resolve nested children
        // Flatten grouped options so chips can find items by value
        if (isMultiple.value) {
          const flattened = result.flatMap(group => group.children)
          return flattened
        }
        
        return result
      } catch (error) {
        // Grouping failed, falling back to flat options
      }
    }
    
    // Return flat options
    // Use optionLabelKey (defaults to 'name') as title, 'id' as value
    // LEARNING: AppSelect uses 'title' property for display (configured via item-title prop)
    const flatOptions = entities.map((entity) => ({
      title: (getEntityFieldValue(entity, String(optionLabelKey.value)) as string | undefined) || String((entity as GlobalEntity<GlobalEntityKey>).id),
      value: String((entity as GlobalEntity<GlobalEntityKey>).id)
    }))
    
    return flatOptions
  })
  
  /**
   * LEARNING: Normalize field value for select component
   * WHY: AppSelect with multiple prop expects an array, but stored value might be string or single value
   * PATTERN: Convert to array for multiple selects, ensure it's always an array when multiple is true
   */
  const normalizedValue = computed(() => {
    const value = rawFieldValue.value
    
    // For multiple selects, ensure value is always an array of strings
    if (isMultiple.value) {
      if (Array.isArray(value)) {
        // Ensure all values are strings (item-value uses String(entity.id))
        return value.map(v => String(v)).filter(v => v !== '')
      }
      if (value === null || value === undefined || value === '') {
        return []
      }
      // If it's a string, convert to array with string value
      if (typeof value === 'string') {
        return [String(value)]
      }
      // For any other type (number, etc.), convert to string and wrap in array
      return [String(value)]
    }
    
    // For single selects, ensure value is string to match item-value format
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

