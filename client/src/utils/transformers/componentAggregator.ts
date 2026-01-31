/**
 * Component Transformer
 * 
 * Composes properties from components to create computed composed entities.
 * Component relationships are lateral component relationships (same shape, e.g., service → service).
 * 
 * LEARNING: Computed view pattern - composers are always calculated from components at query time
 * WHY: No stored composed values, ensures data consistency
 * PATTERN: Property-specific component strategies (sum, merge, first, every)
 */

import type { GlobalEntity } from '@/types/entities'
import { GlobalEntityKey } from '@/constants/entities';
import type { InstanceComponent } from '@/types/component'
import type { GlobalData } from './fetchToGlobalTransformer'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { composePropertiesFromComponents } from './composePropertyValue'
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * Convert GlobalRelationship[] to InstanceComponent[] format
 * 
 * LEARNING: Components are now stored as relationships, need to convert format
 * WHY: Component functions expect InstanceComponent[] format
 * PATTERN: Transform relationship structure to component structure
 */
function getActiveComponentsFromRelationships<GE extends GlobalEntityKey>(
  entityKind: GE,
  globalData: GlobalData
): InstanceComponent[] {
  const relationships = globalData.relationships.instanceComponents || []
  
  // Filter relationships for this entity kind and convert to InstanceComponent format
  const instanceComponents: InstanceComponent[] = []
  
  for (const rel of relationships) {
    // Check if this relationship is for the correct entity kind
    if (rel.parent.entityKey !== entityKind || rel.relationshipKind !== 'instanceComponents') {
      continue
    }
    
    // Convert each child to an InstanceComponent
    // LEARNING: GlobalRelationship has parent/children structure, InstanceComponent is flat
    // WHY: Need to flatten relationship structure for component functions
    // PATTERN: One InstanceComponent per child entity
    for (const child of rel.children) {
      instanceComponents.push({
        id: `${rel.parent.id}-${child.id}`, // Generate ID from parent-child pair
        parentId: rel.parent.id,
        childId: child.id,
        orderIndex: 0, // Default orderIndex (not available in GlobalRelationship)
        disabled: false, // Default disabled (not available in GlobalRelationship)
        createdAt: new Date(), // Default date
        updatedAt: new Date(), // Default date
      })
    }
  }
  
  return instanceComponents
}

/**
 * Get components recursively (handles hierarchical component relationships)
 * 
 * LEARNING: Components can themselves be composers
 * WHY: Enables complex component structures
 * PATTERN: Recursive traversal with visited set to prevent infinite loops
 */
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
  
  // Get direct components
  const directComponents = instanceComponents
    .filter(ac => 
      ac.parentId === composerId && 
      !ac.disabled
    )
    .map(ac => ac.childId)
  
  // Get recursive components (components that are themselves composers)
  const recursiveComponents: string[] = []
  for (const componentId of directComponents) {
    // Check if this component is itself a composer
    const isComponentAlsoComposer = instanceComponents.some(
      ac => ac.parentId === componentId && !ac.disabled
    )
    
    if (isComponentAlsoComposer) {
      // Recursively get components of this component
      const nestedComponents = getComponentsRecursive(componentId, entityKind, instanceComponents, visited)
      recursiveComponents.push(...nestedComponents)
    } else {
      // Direct component, not a composer
      recursiveComponents.push(componentId)
    }
  }
  
  return recursiveComponents
}


/**
 * Compose part instances from composed block instances
 * 
 * LEARNING: When composing block instances, compose all part instances from all composed blocks
 * WHY: Composer should show all part instances from all component blocks
 * PATTERN: Merge partAssignments relationships from all composed blocks
 */
export function composePartInstances(
  composedBlockIds: string[],
  globalData: GlobalData
): string[] {
  const allPartInstanceIds = new Set<string>()
  
  for (const blockId of composedBlockIds) {
    const blockInstance = globalData.entities.blockInstance.find(bp => bp.id === blockId)
    if (!blockInstance) continue
    
    // Get partAssignments relationships for this block
    const partAssignmentsRelationships = globalData.relationships.partAssignments || []
    const blockRelationships = partAssignmentsRelationships.filter(
      rel => rel.parent.id === blockId
    )
    
    // Collect all part instance IDs from this block's partAssignments
    blockRelationships.forEach(rel => {
      rel.children.forEach(partInstance => {
        allPartInstanceIds.add(partInstance.id)
      })
    })
  }
  
  return Array.from(allPartInstanceIds)
}

/**
 * Compose properties from components
 * 
 * LEARNING: Computed view pattern - always recalculate from components
 * WHY: Ensures data consistency, no stored composed values
 * PATTERN: Property-specific component based on config rules
 */
export function composeProperties<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  globalData: GlobalData
): Partial<GlobalEntity<GE>> {
  const instanceComponents = getActiveComponentsFromRelationships(entityKind, globalData)
  
  // Get all components (recursive to handle hierarchical component)
  const componentIds = getComponentsRecursive(composerId, entityKind, instanceComponents)
  
  if (componentIds.length === 0) {
    return {}
  }
  
  // Get component entities
  const { resolved: components, missingIds } = resolveByIds(globalData.entities[entityKind] || [], componentIds)

  // LEARNING: Missing IDs can happen if relationships reference entities that were deleted or not loaded
  // WHY: We want visibility in dev without crashing the UI
  // PATTERN: Log and continue with resolved entities only
  if (missingIds.length > 0 && isDevModeEnabled()) {
     
    console.warn('[componentAggregator.composeProperties] Missing component entity IDs:', {
      composerId,
      missingIds,
      entityKind,
    })
  }
  
  if (components.length === 0) {
    return {}
  }
  
  // Compose properties using shared utility
  const composed = composePropertiesFromComponents(
    components,
    entityKind,
    globalData.entities.blockShape
  )
  
  // Special handling for blockInstance component: compose part instances
  // Note: partAssignments is a relationship, not a direct property
  // This will be handled separately in the relationship component
  if (entityKind === 'blockInstance') {
    // Future: composePartInstances(componentIds, globalData) could be used here
    // when we need to compose part instances from composed blocks
  }
  
  return composed as Partial<GlobalEntity<GE>>
}

/**
 * Get composed entity
 * 
 * LEARNING: Creates computed view of composer from components
 * WHY: Composers are computed views, not stored entities
 * PATTERN: Merge composer base properties with composed component properties
 */
export function getComposedEntity<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  globalData: GlobalData
): GlobalEntity<GE> | null {
  // Get composer entity (base properties)
  const composerEntity = globalData.entities[entityKind]?.find(e => e.id === composerId)
  if (!composerEntity) {
    return null
  }
  
  // LEARNING: Type assertion needed because entities array is union type
  // WHY: TypeScript can't infer specific entity type from union type array
  // PATTERN: Assert to specific entity type when we know the entityKind
  const composer = composerEntity as GlobalEntity<GE>
  
  // Compose properties from components
  const composed = composeProperties(composerId, entityKind, globalData)
  
  // Merge composer with composed properties
  // Composed properties override composer properties (computed view)
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

