/**
 * Relationship Collection Data Composable
 * 
 * LEARNING: Generic version of usePartInstanceData - works for any relationship collection type
 * WHY: Encapsulates relationship data transformation logic for parts, annotations, events
 * PATTERN: Composable that manages relationship data transformations and helper functions
 * 
 * This composable provides:
 * - Valid shapes/entities from parent type
 * - Existing child entities from relationships
 * - Helper functions for finding entities by shape
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { useGlobal } from '@/composables/useGlobal'
import { useAdmin } from '@/composables/useAdmin'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export interface UseRelationshipCollectionDataOptions {
  parentEntityId: ComputedRef<string> | Ref<string> | string
  parentEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  childEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  shapeEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey // e.g., 'partShape', 'annotationShape', 'eventShape'
  relationshipKey: ComputedRef<string> | string // e.g., 'partAssignments', 'annotationAssignments', 'eventAssignments'
  optionsFieldKey: ComputedRef<string> | string // e.g., 'validParts', 'validAnnotations', 'validEvents'
  parentTypeEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey // e.g., 'blockShape', 'partShape'
  parentTypeRef: ComputedRef<string | null> | Ref<string | null> | string | null // Reference to parent type entity
  shapeRefProperty: string // Property name on child entity that references shape (e.g., 'partShapeRef', 'annotationShapeRef', 'eventShapeRef')
}

export interface UseRelationshipCollectionDataReturn {
  validShapes: Ref<GlobalEntity<GlobalEntityKey>[]>
  existingChildren: Ref<GlobalEntity<GlobalEntityKey>[]>
  
  getChildForShape: (shapeId: string) => GlobalEntity<GlobalEntityKey> | undefined
  getShapeName: (shapeId: string) => string
}

/**
 * Relationship Collection Data Composable
 * 
 * LEARNING: Manages relationship data transformations for any collection type
 * WHY: Prevents recursion by moving all logic to computed properties
 * PATTERN: Composable with computed properties for data transformations and helper functions
 */
export function useRelationshipCollectionData(
  options: UseRelationshipCollectionDataOptions
): UseRelationshipCollectionDataReturn {
  const {
    parentEntityId,
    childEntityKey: childEntityKeyInput,
    shapeEntityKey: shapeEntityKeyInput,
    relationshipKey: relationshipKeyInput,
    optionsFieldKey: optionsFieldKeyInput,
    parentTypeEntityKey: parentTypeEntityKeyInput,
    parentTypeRef: parentTypeRefInput,
    shapeRefProperty
  } = options
  
  const parentEntityIdRef = typeof parentEntityId === 'string' 
    ? computed(() => parentEntityId)
    : typeof parentEntityId === 'object' && 'value' in parentEntityId
    ? computed(() => parentEntityId.value)
    : parentEntityId as ComputedRef<string>
  
  const childEntityKey = typeof childEntityKeyInput === 'string'
    ? computed(() => childEntityKeyInput as GlobalEntityKey)
    : typeof childEntityKeyInput === 'object' && 'value' in childEntityKeyInput
    ? computed(() => childEntityKeyInput.value as GlobalEntityKey)
    : childEntityKeyInput as ComputedRef<GlobalEntityKey>
  
  const shapeEntityKey = typeof shapeEntityKeyInput === 'string'
    ? computed(() => shapeEntityKeyInput as GlobalEntityKey)
    : typeof shapeEntityKeyInput === 'object' && 'value' in shapeEntityKeyInput
    ? computed(() => shapeEntityKeyInput.value as GlobalEntityKey)
    : shapeEntityKeyInput as ComputedRef<GlobalEntityKey>
  
  const relationshipKey = typeof relationshipKeyInput === 'string'
    ? computed(() => relationshipKeyInput)
    : typeof relationshipKeyInput === 'object' && 'value' in relationshipKeyInput
    ? computed(() => relationshipKeyInput.value)
    : relationshipKeyInput as ComputedRef<string>
  
  const optionsFieldKey = typeof optionsFieldKeyInput === 'string'
    ? computed(() => optionsFieldKeyInput)
    : typeof optionsFieldKeyInput === 'object' && 'value' in optionsFieldKeyInput
    ? computed(() => optionsFieldKeyInput.value)
    : optionsFieldKeyInput as ComputedRef<string>
  
  const parentTypeEntityKey = typeof parentTypeEntityKeyInput === 'string'
    ? computed(() => parentTypeEntityKeyInput as GlobalEntityKey)
    : typeof parentTypeEntityKeyInput === 'object' && 'value' in parentTypeEntityKeyInput
    ? computed(() => parentTypeEntityKeyInput.value as GlobalEntityKey)
    : parentTypeEntityKeyInput as ComputedRef<GlobalEntityKey>
  
  const parentTypeRef = typeof parentTypeRefInput === 'string' || parentTypeRefInput === null
    ? computed(() => parentTypeRefInput)
    : typeof parentTypeRefInput === 'object' && 'value' in parentTypeRefInput
    ? computed(() => parentTypeRefInput.value)
    : parentTypeRefInput as ComputedRef<string | null>
  
  const { getGlobalEntityById } = useGlobal()
  const adminComp = useAdmin()
  const { relationships: relationshipsRef } = useRelationshipCrud(relationshipKey.value as import('@/constants/relationships').GlobalRelationshipKey)
  
  
  /**
   * LEARNING: Get parent type entity
   * WHY: Need parent type entity to get valid shapes/options
   * PATTERN: Get type entity from parentTypeRef
   */
  const parentTypeEntity = computed(() => {
    if (!parentTypeRef.value) return null
    return adminComp.getEntity(parentTypeEntityKey.value, parentTypeRef.value) || null
  })
  
  /**
   * LEARNING: Get valid shapes for this parent type
   * WHY: Shows all shapes that can be added to this parent
   * PATTERN: Get valid options from parent type entity (via admin store for relationships)
   */
  const validShapes = computed((): GlobalEntity<GlobalEntityKey>[] => {
    if (!parentTypeEntity.value) return []
    
    const typeEntityWithRels = adminComp.getEntity(parentTypeEntityKey.value, parentTypeEntity.value.id)
    if (!typeEntityWithRels) return []
    
    const validOptions = getEntityFieldValue(typeEntityWithRels, optionsFieldKey.value)
    if (!validOptions || !Array.isArray(validOptions)) return []
    
    const shapes = adminComp.getEntitiesByKey(shapeEntityKey.value) as GlobalEntity<GlobalEntityKey>[]
    const { resolved } = resolveByIds(shapes, validOptions)
    return resolved.sort((a, b) => {
      const aOrder = getEntityFieldValue(a, 'orderIndex') as number ?? 0
      const bOrder = getEntityFieldValue(b, 'orderIndex') as number ?? 0
      return aOrder - bOrder
    })
  })
  
  /**
   * LEARNING: Get existing child entities for this parent
   * WHY: Shows child entities that are already associated with this parent
   * PATTERN: Filter relationships by parent_id
   */
  const existingChildren = computed((): GlobalEntity<GlobalEntityKey>[] => {
    if (!relationshipsRef.value) return []
    
    const relationships = relationshipsRef.value.filter(
      rel => String(rel.parent_id) === parentEntityIdRef.value && !rel.disabled
    )
    
    const children = adminComp.getEntitiesByKey(childEntityKey.value) as GlobalEntity<GlobalEntityKey>[]
    const childIds = relationships.map((rel) => String(rel.child_id))
    const { resolved } = resolveByIds(children, childIds)
    return resolved.sort((a, b) => {
      const aOrder = getEntityFieldValue(a, 'orderIndex') as number ?? 0
      const bOrder = getEntityFieldValue(b, 'orderIndex') as number ?? 0
      return aOrder - bOrder
    })
  })
  
  /**
   * LEARNING: Get child entity for a specific shape
   * WHY: Check if a child entity exists for a given shape
   * PATTERN: Find child where shapeRefProperty matches shape ID
   */
  const getChildForShape = (shapeId: string): GlobalEntity<GlobalEntityKey> | undefined => {
    return existingChildren.value.find(child => {
      const shapeRef = getEntityFieldValue(child, shapeRefProperty)
      return String(shapeRef) === String(shapeId)
    })
  }
  
  /**
   * LEARNING: Get shape name for display
   * WHY: Show shape name in "Add [Shape]" cards
   * PATTERN: Get shape entity and return name
   */
  const getShapeName = (shapeId: string): string => {
    const shape = getGlobalEntityById(shapeEntityKey.value, shapeId)
    return shape?.name || `${shapeEntityKey.value} ${shapeId.slice(0, 8)}`
  }
  
  return {
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName
  }
}
