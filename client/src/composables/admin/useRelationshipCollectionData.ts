/**
 * PATTERN: Relationship Collection Data Composable

PATTERN: Composable that manage...
 */
import { computed, unref } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { useGlobal } from '@/composables/useGlobal'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type {
  UseRelationshipCollectionDataOptions,
  UseRelationshipCollectionDataReturnBase,
} from '@/types/admin/relationshipCollectionData'

/**
 * PATTERN: Relationship Collection Data Composable

PATTERN: Composable with comput...
 */
export function useRelationshipCollectionData(
  options: UseRelationshipCollectionDataOptions
): UseRelationshipCollectionDataReturnBase {
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
  
  const parentEntityIdRef = computed(() => unref(parentEntityId))
  const childEntityKey = computed(() => unref(childEntityKeyInput) as GlobalEntityKey)
  const shapeEntityKey = computed(() => unref(shapeEntityKeyInput) as GlobalEntityKey)
  const relationshipKey = computed(() => unref(relationshipKeyInput))
  const optionsFieldKey = computed(() => unref(optionsFieldKeyInput))
  const parentTypeEntityKey = computed(() => unref(parentTypeEntityKeyInput) as GlobalEntityKey)
  const parentTypeRef = computed(() => unref(parentTypeRefInput))
  
  const { getGlobalEntityById } = useGlobal()
  const adminComp = useAdmin()
  const { relationships: relationshipsRef } = useRelationshipCrud(relationshipKey.value as GlobalRelationshipKey)
  
  
  const parentTypeEntity = computed(() => {
    if (!parentTypeRef.value) return null
    return adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value)) || null
  })
  
  const validShapes = computed((): GlobalEntity<GlobalEntityKey>[] => {
    if (!parentTypeEntity.value) return []
    
    const typeEntityWithRels = adminComp.getEntity(parentTypeEntityKey.value, parentTypeEntity.value.id)
    if (!typeEntityWithRels) return []
    
    const validOptions = getEntityFieldValue(typeEntityWithRels, optionsFieldKey.value)
    if (!validOptions || !Array.isArray(validOptions)) return []
    
    const shapes = adminComp.getEntitiesByKey(shapeEntityKey.value) as GlobalEntity<GlobalEntityKey>[]
    const { resolved } = resolveByIds(shapes, validOptions)
    return resolved.sort((a, b) => {
      const aOrder = getEntityFieldValue(a, FIELD_NAMES.ORDER_INDEX) as number ?? 0
      const bOrder = getEntityFieldValue(b, FIELD_NAMES.ORDER_INDEX) as number ?? 0
      return aOrder - bOrder
    })
  })
  
  const existingChildren = computed((): GlobalEntity<GlobalEntityKey>[] => {
    if (!relationshipsRef.value) return []
    
    const relationships = relationshipsRef.value.filter(
      rel => String(rel.parentId) === parentEntityIdRef.value && !rel.disabled
    )
    
    const children = adminComp.getEntitiesByKey(childEntityKey.value) as GlobalEntity<GlobalEntityKey>[]
    const childIds = relationships.map((rel) => String(rel.childId))
    const { resolved } = resolveByIds(children, childIds)
    const filtered = resolved.filter((c): c is GlobalEntity<GlobalEntityKey> => c != null)
    return filtered.sort((a, b) => {
      const aOrder = getEntityFieldValue(a, FIELD_NAMES.ORDER_INDEX) as number ?? 0
      const bOrder = getEntityFieldValue(b, FIELD_NAMES.ORDER_INDEX) as number ?? 0
      return aOrder - bOrder
    })
  })
  
  const getChildForShape = (shapeId: string): GlobalEntity<GlobalEntityKey> | undefined => {
    return existingChildren.value.find(child => {
      const shapeRef = getEntityFieldValue(child, shapeRefProperty)
      return shapeRef === shapeId
    })
  }
  
  const getShapeName = (shapeId: string): string => {
    const shape = getGlobalEntityById(shapeEntityKey.value, shapeId)
    const name = shape?.name
    return name !== undefined && name !== null && name !== '' ? name : `${shapeEntityKey.value} ${shapeId.slice(0, 8)}`
  }
  
  return {
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName
  }
}
