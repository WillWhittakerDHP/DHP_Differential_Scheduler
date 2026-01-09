/**
 * Admin Composable
 * 
 * LEARNING: Provides admin-specific entity operations with transformed entities
 * WHY: Encapsulates admin context and entity management with relationships attached
 * PATTERN: Composable that transforms GlobalData to AdminObject using transformer
 * COMPARISON: React uses AdminContext. Vue uses composables + Vue Query + transformer
 */

import { computed } from 'vue'
import { useGlobal } from './useGlobal'
import type { GlobalEntityId } from '@/types/entities'
import { GlobalEntityKey } from '@/constants/entities'
import { adminTransformer } from '@/utils/transformers/globalToAdminTransformer'
import type { AdminObject } from '@/utils/transformers/globalToAdminTransformer'
import { isDevModeEnabled } from '@/utils/env/devMode'

// DIAGNOSTICS: Track instance creation
let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

// SINGLETON: Shared instance created on first call
let adminInstance: ReturnType<typeof createAdminInstance> | null = null

/**
 * Helper to extract call site info from stack trace
 */
function getCallSiteInfo(): { caller: string; stack: string } {
  const stack = new Error().stack || ''
  const lines = stack.split('\n')
  // Skip first 3 lines: Error, getCallSiteInfo, useAdmin
  // Look for the actual caller (usually line 4 or 5)
  const callerLine = lines[3] || lines[4] || 'unknown'
  return {
    caller: callerLine.trim(),
    stack: stack
  }
}

/**
 * Create the actual composable instance
 * LEARNING: Separated from useAdmin to enable singleton pattern
 * WHY: Allows creating instance once and reusing it, preventing recalculation
 */
function createAdminInstance() {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })
  
  
  // SINGLETON: This will now reuse the singleton useGlobal instance
  const { getGlobalEntities, getGlobalEntityById, globalData } = useGlobal()
  
  /**
   * Transform GlobalData to AdminObjectMap
   * LEARNING: Caches transformed entities to avoid re-transforming on every access
   * WHY: Transformation includes relationship attachment and validation - expensive operation
   * PATTERN: Use computed to reactively transform when GlobalData changes
   * 
   * PERFORMANCE: Vue's computed automatically caches the result and only recalculates when
   * globalData.value changes. Since globalData comes from VueQuery cache, it's stable and
   * only changes when actual data updates occur (not reference changes).
   */
  const transformedEntities = computed(() => {
    const data = globalData?.value ?? null
    
    if (!data) {
      return {
        blockInstance: [],
        blockShape: [],
        partInstance: [],
        partShape: []
      }
    }
    
    // Transform GlobalData to AdminObjectMap
    // NOTE: adminTransformer is a singleton, so no instance creation overhead
    return adminTransformer.transformGlobalToAdmin(data)
  })
  
  /**
   * Get entity by key and ID from transformed entities
   * LEARNING: Returns AdminObject with relationships attached
   * WHY: Ensures correct entity type and ID matching with relationships
   * PATTERN: Generic function with type constraints, uses transformed entities
   */
  function getEntity<GE extends GlobalEntityKey>(
    entityKey: GE,
    entityId: GlobalEntityId
  ): AdminObject<GE> | undefined {
    const entities = transformedEntities.value[entityKey]
    return entities.find((e) => String(e.id) === String(entityId)) as AdminObject<GE> | undefined
  }
  
  /**
   * Get all entities of a type from transformed entities
   * LEARNING: Returns AdminObject[] with relationships attached
   * WHY: Ensures correct entity type with relationships
   * PATTERN: Generic function with type constraints, uses transformed entities
   */
  function getEntities<GE extends GlobalEntityKey>(entityKey: GE): AdminObject<GE>[] {
    const entities = transformedEntities.value[entityKey] as AdminObject<GE>[] | undefined
    // LEARNING: Always return an array, even if entityKey doesn't exist
    // WHY: Prevents undefined errors when accessing entities that haven't been loaded yet
    // PATTERN: Return empty array as safe default
    return entities ?? []
  }
  
  /**
   * Get entities by key (alias for getEntities)
   * LEARNING: Matches React's AdminContext API
   * WHY: Consistent API with React version
   * PATTERN: Alias function for compatibility
   */
  function getEntitiesByKey<GE extends GlobalEntityKey>(entityKey: GE): AdminObject<GE>[] {
    return getEntities(entityKey)
  }

  /**
   * Get entity map for O(1) lookups
   * LEARNING: Returns Map<GlobalEntityId, AdminObject> for efficient entity lookups
   * WHY: Grouping logic needs O(1) lookups instead of O(n) array searches
   * PATTERN: Create Map from entities array, keyed by entity ID
   */
  function getEntityMap<GE extends GlobalEntityKey>(entityKey: GE): Map<GlobalEntityId, AdminObject<GE>> {
    const entities = getEntities(entityKey)
    const entityMap = new Map<GlobalEntityId, AdminObject<GE>>()
    // LEARNING: Ensure entities is an array before iterating
    // WHY: Prevents errors when entities haven't been loaded yet or entityKey doesn't exist
    // PATTERN: Check if entities is array before forEach
    if (Array.isArray(entities)) {
    entities.forEach(entity => {
      entityMap.set(entity.id, entity)
    })
    }
    return entityMap
  }
  
  /**
   * Collect all admin entities for logging
   * LEARNING: Computed property that collects all admin entities
   * WHY: Matches React's adminData structure for debugging
   * PATTERN: Use computed to reactively collect entities
   */
  const adminData = computed(() => {
    return {
      blockInstance: getEntities('blockInstance'),
      blockShape: getEntities('blockShape'),
      partInstance: getEntities('partInstance'),
      partShape: getEntities('partShape'),
    }
  })
  
  
  return {
    getEntity,
    getEntities,
    getEntitiesByKey,
    getEntityMap,
    getGlobalEntities, // Keep for backward compatibility
    getGlobalEntityById, // Keep for backward compatibility
    adminData,
  }
}

/**
 * Admin composable
 * LEARNING: Provides admin operations for entities with relationships attached
 * WHY: Centralized admin operations with transformed entity access
 * PATTERN: Singleton pattern - creates instance on first call, reuses it afterwards
 *          This prevents recalculation of transformedEntities on every component mount
 * 
 * @returns Admin operations and entity access with relationships attached
 */
export function useAdmin() {
  callCount++
  
  // SINGLETON: Create instance on first call, reuse afterwards
  if (!adminInstance) {
    adminInstance = createAdminInstance()
  }
  
  return adminInstance
}

// DIAGNOSTICS: Export instance count for debugging
if (isDevModeEnabled()) {
  interface WindowWithDebug extends Window {
    __useAdminDebug?: {
      instanceCount: () => number
      callCount: () => number
      callSites: () => Array<{ count: number; stack: string }>
      reset: () => void
    }
  }
  (window as WindowWithDebug).__useAdminDebug = {
    instanceCount: () => instanceCount,
    callCount: () => callCount,
    callSites: () => instanceCallSites,
    reset: () => {
      instanceCount = 0
      callCount = 0
      instanceCallSites.length = 0
      adminInstance = null
    }
  }
}

