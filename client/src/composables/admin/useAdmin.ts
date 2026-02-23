/**
 * PATTERN: Admin Composable
PATTERN: Composable that transforms GlobalData to Admin...
 */
import { computed } from 'vue'
import { useGlobal } from '../useGlobal'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import { GlobalEntityKey } from '@/constants/entities'
import { adminTransformer } from '@/utils/transformers/globalToAdminTransformer'
import type { AdminObject } from '@/utils/transformers/globalToAdminTransformer'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { asEmptyArray, asEmptyString } from '@/utils/safeDefaults'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { attachDebugToWindow } from '@/utils/debug/windowDebug'

let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

let adminInstance: ReturnType<typeof createAdminInstance> | null = null

function getCallSiteInfo(): { caller: string; stack: string } {
  const stack = asEmptyString(new Error().stack)
  const lines = stack.split('\n')
  const callerLine = lines[3] || lines[4] || 'unknown'
  return {
    caller: callerLine.trim(),
    stack: stack
  }
}

function createAdminInstance() {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })


  const { globalData } = useGlobal()

  // LEARNING: Use metadata cache composable for lazy-loaded admin metadata
  // PATTERN: Separate cache key ['adminMetadata'] from globalData
  const metadataCache = useMetadataCache()

  /**
   * Transform GlobalData to AdminObjectMap
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
        partShape: [],
        eventShape: [],
        eventInstance: [],
        annotationShape: [],
        annotationInstance: []
      }
    }

    return adminTransformer.transformGlobalToAdmin(data)
  })

  /**
   * Get entity by key and ID from transformed entities
   */
  function getEntity<GE extends GlobalEntityKey>(
    entityKey: GE,
    entityId: GlobalEntityId
  ): AdminObject<GE> | undefined {
    const entities = transformedEntities.value[entityKey]
    return entities.find((e) => e.id === entityId) as AdminObject<GE> | undefined
  }

  /**
   * Get all entities of a type from transformed entities
   */
  function getEntities<GE extends GlobalEntityKey>(entityKey: GE): AdminObject<GE>[] {
    const entities = transformedEntities.value[entityKey] as AdminObject<GE>[] | undefined
    // WHY: Prevents undefined errors when accessing entities that haven't been loaded yet
    // PATTERN: Return empty array as safe default
    return asEmptyArray(entities)
  }

  /**
   * Get entities by key (alias for getEntities)
   */
  function getEntitiesByKey<GE extends GlobalEntityKey>(entityKey: GE): AdminObject<GE>[] {
    return getEntities(entityKey)
  }

  /**
   * Get entity map for O(1) lookups
   */
  function getEntityMap<GE extends GlobalEntityKey>(entityKey: GE): Map<GlobalEntityId, AdminObject<GE>> {
    const entities = getEntities(entityKey)
    const entityMap = new Map<GlobalEntityId, AdminObject<GE>>()
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
   */
  const adminData = computed(() => {
    return {
      blockInstance: getEntities('blockInstance'),
      blockShape: getEntities('blockShape'),
      partInstance: getEntities('partInstance'),
      partShape: getEntities('partShape'),
      eventShape: getEntities('eventShape'),
      eventInstance: getEntities('eventInstance'),
      annotationShape: getEntities('annotationShape'),
      annotationInstance: getEntities('annotationInstance'),
    }
  })

  /**
   * Get metadata for an entity (from lazy-loaded metadata cache)
   *
   * @param entityKey - Entity key (blockShape, partShape, blockInstance, partInstance)
   * @param entity - Entity object (GlobalEntity or AdminObject, used to determine blockShapeRef for blockInstance)
   * @returns Record<fieldKey, FieldMetadataEntry> - combined primitive + relationship metadata
   */
  function getMetadata<GE extends GlobalEntityKey>(
    entityKey: GE,
    entity: AdminObject<GE> | GlobalEntity<GE>
  ): Record<string, FieldMetadataEntry> {
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      return {}
    }

    // PATTERN: useMetadataCache.getMetadata handles the fallback logic
    let blockShapeRef: string | null = null
    if (entityType === 'blockInstance' && entityKey === 'blockInstance') {
      const blockInstanceEntity = entity as GlobalEntity<'blockInstance'>
      blockShapeRef = blockInstanceEntity.blockShapeRef || null
    }

    // LEARNING: Delegate to metadata cache composable
    // PATTERN: Single source of truth for metadata access
    return metadataCache.getMetadata(entityType, blockShapeRef)
  }

  /**
   * Ensure metadata is loaded (call on admin page mount)
   * FIX: Changed from async to sync to prevent race condition - enables query immediately
   */
  function ensureMetadataLoaded(): void {
    metadataCache.ensureMetadataLoaded()
  }

  /**
   * WHY: /**
Check if metadata is loaded
LEARNING: Reactive property for metadata...
   */
  const isMetadataLoaded = metadataCache.isLoaded

  return {
    getEntity,
    getEntities,
    getEntitiesByKey,
    getEntityMap,
    getMetadata,
    ensureMetadataLoaded, // Call on admin page mount to trigger metadata fetch
    isMetadataLoaded, // Check if metadata has been loaded
    adminData,
  }
}

/**
 * PATTERN: Admin composable
PATTERN: Singleton pattern - creates instance on first ...
 */
export function useAdmin() {
  callCount++

  if (!adminInstance) {
    adminInstance = createAdminInstance()
  }

  return adminInstance
}

attachDebugToWindow('__useAdminDebug', {
  instanceCount: () => instanceCount,
  callCount: () => callCount,
  callSites: () => instanceCallSites,
  reset: () => {
    instanceCount = 0
    callCount = 0
    instanceCallSites.length = 0
    adminInstance = null
  }
})
