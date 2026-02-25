/**
 * PATTERN: Global Entity Composable — reads from Vue Query.
 * WHY: attachDebugToWindow is dev-only debug tooling; SSR-safe via utility guard. Not a production side effect.
 */
import { useQuery } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { globalTransformer } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray, asEmptyString } from '@/utils/safeDefaults'
import { attachDebugToWindow } from '@/utils/debug/windowDebug'

let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

let globalInstance: ReturnType<typeof createGlobalInstance> | null = null

function getCallSiteInfo(): { caller: string; stack: string } {
  const stack = asEmptyString(new Error().stack)
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
  
  function getGlobalEntities<GE extends GlobalEntityKey>(entityKey: GE): GlobalEntity<GE>[] {
    const data = globalData.value
    if (!data || !data.entities) return []
    return asEmptyArray(data.entities[entityKey]) as GlobalEntity<GE>[]
  }
  
  function getGlobalEntityById<GE extends GlobalEntityKey>(
    entityKey: GE,
    id: string
  ): GlobalEntity<GE> | undefined {
    const entities = getGlobalEntities(entityKey)
    return entities.find((e) => e.id === id)
  }
  
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
 * PATTERN: Global entity composable
PATTERN: Singleton pattern - creates instance o...
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

