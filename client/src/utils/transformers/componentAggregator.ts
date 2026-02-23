import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import { GlobalEntityKey } from '@/constants/entities';
import type { InstanceComponent } from '@/types/component'
import type { GlobalData } from './fetchToGlobalTransformer'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { composePropertiesFromComponents } from './composePropertyValue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { createLogger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'

const logger = createLogger('componentAggregator')

function getActiveComponentsFromRelationships<GE extends GlobalEntityKey>(
  entityKind: GE,
  globalData: GlobalData
): InstanceComponent[] {
  const relationships = asEmptyArray(globalData.relationships.instanceComponents)
  
  // PATTERN: Use flatMap to transform relationships to InstanceComponents immutably
  return relationships
    .filter(rel => 
      rel.parent.entityKey === entityKind && 
      rel.relationshipKind === 'instanceComponents'
    )
    .flatMap(rel => 
      rel.children.map(child => ({
        id: toGlobalEntityId(`${rel.parent.id}-${child.id}`), // Generate ID from parent-child pair
        parentId: rel.parent.id,
        childId: child.id,
        orderIndex: 0, // Default orderIndex (not available in GlobalRelationship)
        disabled: false, // Default disabled (not available in GlobalRelationship)
        createdAt: new Date(), // Default date
        updatedAt: new Date(), // Default date
      }))
    )
}

export function getComponentsRecursive(
  composerId: string,
  entityKind: GlobalEntityKey,
  instanceComponents: InstanceComponent[],
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(composerId)) {
    return [] // Circular reference detected, return empty
  }
  
  visited.add(composerId)
  
  const directComponents = instanceComponents
    .filter(ac => 
      ac.parentId === composerId && 
      !ac.disabled
    )
    .map(ac => ac.childId)
  
  // PATTERN: Use flatMap to recursively collect components immutably
  return directComponents.flatMap(componentId => {
    const isComponentAlsoComposer = instanceComponents.some(
      ac => ac.parentId === componentId && !ac.disabled
    )
    
    if (isComponentAlsoComposer) {
      return getComponentsRecursive(componentId, entityKind, instanceComponents, visited)
    } else {
      return [componentId]
    }
  })
}


export function composePartInstances(
  composedBlockIds: string[],
  globalData: GlobalData
): string[] {
  const partAssignmentsRelationships = asEmptyArray(globalData.relationships.partAssignments)
  
  // PATTERN: Use flatMap to collect all part instance IDs immutably, then deduplicate with Set
  const allPartInstanceIds = new Set(
    composedBlockIds.flatMap(blockId => {
      const blockInstance = globalData.entities.blockInstance.find(bp => bp.id === blockId)
      if (!blockInstance) return []
      
      const blockRelationships = partAssignmentsRelationships.filter(
        rel => rel.parent.id === blockId
      )
      
      return blockRelationships.flatMap(rel => 
        rel.children.map(partInstance => partInstance.id)
      )
    })
  )
  
  return Array.from(allPartInstanceIds)
}

/**

LEARNING: Computed view pattern - al...
 */
export function composeProperties<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  globalData: GlobalData
): Partial<GlobalEntity<GE>> {
  const instanceComponents = getActiveComponentsFromRelationships(entityKind, globalData)
  
  const componentIds = getComponentsRecursive(composerId, entityKind, instanceComponents)
  
  if (componentIds.length === 0) {
    return {}
  }
  
  const { resolved: components, missingIds } = resolveByIds(asEmptyArray(globalData.entities[entityKind]), componentIds)

  // PATTERN: Log and continue with resolved entities only
  if (missingIds.length > 0 && isDevModeEnabled()) {
    logger.warn('Missing component entity IDs', {
      composerId,
      missingIds,
      entityKind,
    })
  }
  
  if (components.length === 0) {
    return {}
  }
  
  const composed = composePropertiesFromComponents(
    components,
    entityKind,
    globalData.entities.blockShape
  )
  
  return composed as Partial<GlobalEntity<GE>>
}

export function getComposedEntity<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  globalData: GlobalData
): GlobalEntity<GE> | null {
  const composerEntity = globalData.entities[entityKind]?.find(e => e.id === composerId)
  if (!composerEntity) {
    return null
  }
  
  // LEARNING: Type assertion needed because entities array is union type
  // PATTERN: Assert to specific entity type when we know the entityKind
  const composer = composerEntity as GlobalEntity<GE>
  
  const composed = composeProperties(composerId, entityKind, globalData)
  
  const composedEntity: GlobalEntity<GE> = {
    ...composer,
    ...composed,
    isComposer: true,
    instanceComponents: getComponentsRecursive(
      composerId,
      entityKind,
      getActiveComponentsFromRelationships(entityKind, globalData)
    ),
  } as GlobalEntity<GE>
  
  return composedEntity
}

