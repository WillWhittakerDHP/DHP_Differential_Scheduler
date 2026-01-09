/**
 * Part Instance Data Composable
 * 
 * LEARNING: Provides PartInstance data transformation logic extracted from PartInstancesNestedSection component
 * WHY: Encapsulates all PartInstance filtering, sorting, and name generation logic
 * PATTERN: Composable that manages PartInstance data transformations and helper functions
 * 
 * This composable addresses recursion issues by moving all data transformations out of components
 * and into properly memoized computed properties.
 */

import { computed, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import { useGlobal } from './useGlobal'
import { useAdmin } from './useAdmin'
import { useRelationshipCrud } from './useRelationship'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

/**
 * Part Instance Data Composable Options
 */
export interface UsePartInstanceDataOptions {
  blockInstanceId: Ref<string> | string
}

/**
 * Part Instance Data Composable Return Type
 */
export interface UsePartInstanceDataReturn {
  // Computed properties
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
  
  // Helper functions
  getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
  getPartShapeName: (partShapeId: string) => string
  generatePartInstanceName: (
    blockInstanceName: string,
    partShapeName: string,
    blockInstanceRef: string,
    partShapeRef: string
  ) => string
}

/**
 * Part Instance Data Composable
 * 
 * LEARNING: Manages PartInstance data transformations including filtering, sorting, and name generation
 * WHY: Prevents recursion by moving all logic to computed properties, not functions called during render
 * PATTERN: Composable with computed properties for data transformations and helper functions
 */
export function usePartInstanceData(options: UsePartInstanceDataOptions): UsePartInstanceDataReturn {
  const { blockInstanceId } = options
  
  // Convert blockInstanceId to Ref if it's a string
  const blockInstanceIdRef = typeof blockInstanceId === 'string' 
    ? computed(() => blockInstanceId)
    : blockInstanceId
  
  // Initialize composables
  const { getGlobalEntityById } = useGlobal()
  const adminComp = useAdmin()
  const { relationships: activeConstituents } = useRelationshipCrud('activeConstituents')
  
  /**
   * LEARNING: Get BlockInstance entity
   * WHY: Need BlockInstance to get blockShapeRef
   * PATTERN: Get entity by ID from global entities
   */
  const blockInstance = computed(() => {
    return getGlobalEntityById('blockInstance', blockInstanceIdRef.value)
  })
  
  /**
   * LEARNING: Get BlockShape entity
   * WHY: Need BlockShape to check constituable and get validConstituents
   * PATTERN: Get BlockShape from blockInstance.blockShapeRef
   */
  const blockShape = computed(() => {
    if (!blockInstance.value) return null
    const blockInstanceEntity = blockInstance.value as import('../types/entities').BlockInstanceEntity
    return getGlobalEntityById('blockShape', blockInstanceEntity.blockShapeRef) || null
  })
  
  /**
   * LEARNING: Get valid PartShapes for this BlockShape
   * WHY: Shows all PartShapes that can be added to this BlockInstance
   * PATTERN: Get validConstituents from BlockShape (via admin store for relationships)
   */
  const validPartShapes = computed((): GlobalEntity<'partShape'>[] => {
    if (!blockShape.value) return []
    
    // Get BlockShape with relationships from admin store
    const blockShapeWithRels = adminComp.getEntity('blockShape', blockShape.value.id)
    if (!blockShapeWithRels) return []
    
    // Get validConstituents relationship array (contains PartShape IDs)
    const validConstituents = blockShapeWithRels.validConstituents
    if (!validConstituents || !Array.isArray(validConstituents)) return []
    
    // Map PartShape IDs to PartShape entities
    const partShapes = adminComp.getEntitiesByKey('partShape') as GlobalEntity<'partShape'>[]
    const { resolved } = resolveByIds(partShapes, validConstituents)
    return resolved.sort((a, b) => a.orderIndex - b.orderIndex)
  })
  
  /**
   * LEARNING: Get existing PartInstances for this BlockInstance
   * WHY: Shows PartInstances that are already associated with this BlockInstance
   * PATTERN: Filter activeConstituents relationships by parent_id
   */
  const existingPartInstances = computed((): GlobalEntity<'partInstance'>[] => {
    if (!activeConstituents.value) return []
    
    const relationships = activeConstituents.value.filter(
      rel => String(rel.parent_id) === blockInstanceIdRef.value && !rel.disabled
    )
    
    const partInstances = adminComp.getEntitiesByKey('partInstance') as GlobalEntity<'partInstance'>[]
    const childIds = relationships.map((rel) => String(rel.child_id))
    const { resolved } = resolveByIds(partInstances, childIds)
    return resolved.sort((a, b) => a.orderIndex - b.orderIndex)
  })
  
  /**
   * LEARNING: Get PartInstance for a specific PartShape
   * WHY: Check if a PartInstance exists for a given PartShape
   * PATTERN: Find PartInstance where partShapeRef matches PartShape ID
   */
  const getPartInstanceForShape = (partShapeId: string): GlobalEntity<'partInstance'> | undefined => {
    return existingPartInstances.value.find(pi => pi.partShapeRef === partShapeId)
  }
  
  /**
   * LEARNING: Get PartShape name for display
   * WHY: Show PartShape name in "Add [PartShape]" cards
   * PATTERN: Get PartShape entity and return name
   */
  const getPartShapeName = (partShapeId: string): string => {
    const partShape = getGlobalEntityById('partShape', partShapeId)
    return partShape?.name || `PartShape ${partShapeId.slice(0, 8)}`
  }
  
  /**
   * LEARNING: Generate auto name for partInstance
   * WHY: Creates name in format: blockInstanceName-partShapeName-numberIfThatApplies
   * PATTERN: Check existing partInstances with same blockInstanceRef and partShapeRef to determine number
   */
  const generatePartInstanceName = (
    blockInstanceName: string,
    partShapeName: string,
    blockInstanceRef: string,
    partShapeRef: string
  ): string => {
    // Get all existing partInstances with same blockInstanceRef and partShapeRef
    const allPartInstances = adminComp.getEntitiesByKey('partInstance')
    const matchingPartInstances = allPartInstances.filter((pp) => {
      const partInstance = pp as GlobalEntity<'partInstance'>
      return getEntityFieldValue(partInstance, 'blockInstanceRef') === blockInstanceRef && 
             getEntityFieldValue(partInstance, 'partShapeRef') === partShapeRef
    })
    
    // Base name without number
    const baseName = `${blockInstanceName}-${partShapeName}`
    
    // If no matching profiles exist, use base name
    if (matchingPartInstances.length === 0) {
      return baseName
    }
    
    // Check if base name exists
    const baseNameExists = matchingPartInstances.some((pp) => (pp as GlobalEntity<'partInstance'>).name === baseName)
    if (!baseNameExists) {
      return baseName
    }
    
    // Find the next available number
    let number = 1
    while (matchingPartInstances.some((pp) => (pp as GlobalEntity<'partInstance'>).name === `${baseName}-${number}`)) {
      number++
    }
    
    return `${baseName}-${number}`
  }
  
  return {
    validPartShapes,
    existingPartInstances,
    getPartInstanceForShape,
    getPartShapeName,
    generatePartInstanceName
  }
}

