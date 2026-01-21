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
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { getEntityTypeForMetadata, getMetadataEntityId, BLOCK_INSTANCE_GLOBAL_CONFIG_ID, PART_INSTANCE_GLOBAL_CONFIG_ID } from '@/utils/entities/entityTypeMapping'

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
  
  /**
   * Get metadata for an entity (synchronous, from GlobalData)
   * LEARNING: Reads metadata from GlobalData transformation, handles inheritance automatically
   * WHY: Metadata should be available as early and reliably as entities (same pattern as getEntity)
   * PATTERN: Synchronous function that reads from transformed GlobalData, handles instance inheritance
   *          Aligns with AdminObject pattern - keeps primitives and relationships separate until merge
   * 
   * @param entityKey - Entity key (blockShape, partShape, blockInstance, partInstance)
   * @param entity - Entity object (GlobalEntity or AdminObject, used to determine metadata ID and inheritance)
   * @returns Record<fieldKey, FieldMetadataEntry> - combined primitive + relationship metadata
   */
  function getMetadata<GE extends GlobalEntityKey>(
    entityKey: GE,
    entity: AdminObject<GE> | import('@/types/entities').GlobalEntity<GE>
  ): Record<string, FieldMetadataEntry> {
    const data = globalData?.value
    if (!data || !data.metadata) {
      return {}
    }
    
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      return {}
    }
    
    const metadataId = getMetadataEntityId(entityKey, entity as import('@/types/entities').GlobalEntity<GE>)
    if (!metadataId) {
      return {}
    }
    
    // LEARNING: For blockInstance entities, check for BlockShape-specific metadata
    // WHY: Each BlockShape's instances can have their own metadata configuration
    // PATTERN: Try blockShapeRef-specific metadata first, fall back to global config
    if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
      const blockInstanceEntity = entity as import('@/types/entities').GlobalEntity<'blockInstance'>
      const blockShapeRef = blockInstanceEntity.blockShapeRef
      
      // If blockShapeRef exists, try to get BlockShape-specific metadata
      if (blockShapeRef) {
        const compositeId = `${BLOCK_INSTANCE_GLOBAL_CONFIG_ID}:${blockShapeRef}`
        const blockShapeSpecificMetadata = data.metadata?.[entityType]?.[compositeId]
        
        // If BlockShape-specific metadata exists, return it
        if (blockShapeSpecificMetadata && Object.keys(blockShapeSpecificMetadata).length > 0) {
          return blockShapeSpecificMetadata
        }
      }
      
      // Fall back to global config (blockShapeRef = null)
      const globalMetadata = data.metadata?.[entityType]?.[BLOCK_INSTANCE_GLOBAL_CONFIG_ID] || {}
      return globalMetadata
    }
    
    // LEARNING: For partInstance entities, check for instance-specific metadata and fall back to global config
    // WHY: PartInstance metadata is stored globally, but individual instances may have overrides
    // PATTERN: Try instance-specific metadata first, fall back to global config (matches backend behavior)
    if (entityType === 'partInstance' && entityKey === 'partInstance') {
      // Try instance-specific metadata first
      const instanceMetadata = data.metadata?.[entityType]?.[metadataId]
      
      // If instance-specific metadata exists, return it
      if (instanceMetadata && Object.keys(instanceMetadata).length > 0) {
        return instanceMetadata
      }
      
      // Fall back to global config (same as backend behavior)
      const globalMetadata = data.metadata?.[entityType]?.[PART_INSTANCE_GLOBAL_CONFIG_ID] || {}
      return globalMetadata
    }
    
    // LEARNING: Get unified metadata (primitives + relationships already merged by backend)
    // WHY: Backend returns unified metadata - no hydration needed
    // PATTERN: Direct access to unified metadata structure
    // Session 1.4.10: Unified metadata - single structure, no separation
    const metadata = data.metadata?.[entityType]?.[metadataId] || {}
    
    // LEARNING: All entity types have completely independent metadata
    // WHY: blockInstance has fields like baseSqFt that don't exist in blockShape
    //      partInstance has fields that don't exist in partShape
    //      Shapes and instances have different properties, so there's nothing to inherit
    // PATTERN: Return metadata directly for the specified entity type - no inheritance/merging
    return metadata
  }
  
  
  return {
    getEntity,
    getEntities,
    getEntitiesByKey,
    getEntityMap,
    getGlobalEntities, // Keep for backward compatibility
    getGlobalEntityById, // Keep for backward compatibility
    getMetadata,
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

