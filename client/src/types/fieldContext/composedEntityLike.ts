import type { GlobalEntityId } from '@shared/types/primitiveBrands'

/**
 * Narrow shape for instanceComponents field (derivation + save) without importing useComponentEntity in graph-hot paths.
 */
export interface ComposedEntityLike {
  data: {
    getComponents: (entityId: GlobalEntityId) => Array<{ childId: GlobalEntityId | string }>
  }
  actions: {
    addToComponent: (args: {
      composerId: GlobalEntityId
      componentId: GlobalEntityId
      orderIndex?: number
    }) => Promise<void>
    removeFromComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId }) => Promise<void>
  }
}
