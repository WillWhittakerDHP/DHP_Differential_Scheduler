/**
 * Global Entity Composable
 * 
 * LEARNING: Provides access to global configuration entities from Vue Query cache
 * WHY: Centralized access to configuration entity data without prop drilling
 * PATTERN: Composable that reads from Vue Query cache
 * COMPARISON: React uses Context API. Vue uses composables + Vue Query cache
 * ARCHITECTURAL REFACTOR: Only handles configuration data (entities, relationships, annotations)
 * Business entities (appointments, properties, users) use separate composables with separate cache keys
 */

import { useQuery } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { globalTransformer } from '@/utils/transformers/fetchToGlobalTransformer'
import { attachDebugToWindow } from '@/utils/debug/windowDebug'

let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

let globalInstance: ReturnType<typeof createGlobalInstance> | null = null

function getCallSiteInfo(): { caller: string; stack: string } {
  const stack = new Error().stack || ''
  const lines = stack.split('\n')
  const callerLine = lines[3] || lines[4] || 'unknown'
  return {
    caller: callerLine.trim(),
    stack: stack
  }
}

function createGlobalInstance() {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })
  
  
  /**
   * LEARNING: Use Vue Query to fetch and cache globalData (configuration data only)
   * WHY: Enables automatic refetching when cache is invalidated
   * PATTERN: useQuery with queryFn that fetches and transforms data
   * NOTE: This query will automatically refetch when ['globalData'] is invalidated
   * ARCHITECTURAL REFACTOR: globalData now only contains static configuration data
   * Business entities (appointments, properties, users) use separate cache keys
   */
  /**
   * LEARNING: Avoid destructuring `data = null` from vue-query.
   * WHY: `data = null` creates a union like `null | Ref<T | undefined>`, which then forces
   *      null-checks everywhere and triggers TS18047 ("possibly null").
   * PATTERN: Keep the query object, then use its `.data` ref directly.
   */
  const globalDataQuery = useQuery<GlobalData>({
    queryKey: ['globalData'],
    queryFn: async () => {
      // WHY: Matches main.ts prefetch pattern, ensures consistent data structure
      // PATTERN: Stage (fetch) then hydrate (transform) to GlobalData format
      const staged = await globalTransformer.stageForHydration()
      const hydrated = globalTransformer.hydrate(staged)
      return hydrated
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists (prefetched in main.ts)
    refetchOnReconnect: false, // Don't refetch on reconnect if data exists
  })
  const globalData = globalDataQuery.data
  
  /**
   * Get entities by type from cache
   * LEARNING: Reads from globalData.entities (matching React pattern)
   * WHY: Efficient access to already-loaded data from prefetched globalData
   * PATTERN: Extract entities from globalData object
   */
  function getGlobalEntities<GE extends GlobalEntityKey>(entityKey: GE): GlobalEntity<GE>[] {
    const data = globalData.value
    if (!data || !data.entities) return []
    return (data.entities[entityKey] || []) as GlobalEntity<GE>[]
  }
  
  /**
   * Get entity by ID from cache
   * LEARNING: Searches cached entities for specific ID
   * WHY: Quick lookup without API call
   * PATTERN: Filter cached array
   */
  function getGlobalEntityById<GE extends GlobalEntityKey>(
    entityKey: GE,
    id: string
  ): GlobalEntity<GE> | undefined {
    const entities = getGlobalEntities(entityKey)
    return entities.find((e) => String(e.id) === String(id))
  }
  
  /**
   * Get global data value
   * LEARNING: Returns the current value of globalData ref
   * WHY: Provides synchronous access to globalData value (non-reactive)
   * PATTERN: Access ref value directly
   */
  function getGlobalData(): GlobalData | null {
    return globalData.value || null
  }
  
  
  return {
    getGlobalEntities,
    getGlobalEntityById,
    getGlobalData,
    globalData,
    isLoading: globalDataQuery.isLoading,
    error: globalDataQuery.error,
    refetch: () => globalDataQuery.refetch(), // Expose refetch to manually refresh cache
  }
}

/**
 * Global entity composable
 * LEARNING: Reads entities from Vue Query cache
 * WHY: Provides reactive access to cached entity data
 * PATTERN: Singleton pattern - creates instance on first call, reuses it afterwards
 * 
 * @returns Functions to get entities by type
 */
export function useGlobal() {
  callCount++
  
  if (!globalInstance) {
    globalInstance = createGlobalInstance()
  }
  
  return globalInstance
}

attachDebugToWindow('__useGlobalDebug', {
  instanceCount: () => instanceCount,
  callCount: () => callCount,
  callSites: () => instanceCallSites,
  reset: () => {
    instanceCount = 0
    callCount = 0
    instanceCallSites.length = 0
    globalInstance = null
  }
})

