/**
 * PATTERN: Part Instance Data Composable

PATTERN: Composable that manages PartInst...
 */
import { computed, type Ref } from 'vue'
import type { BlockInstanceEntity, GlobalEntity } from '@/types/entities'
import { useGlobal } from './useGlobal'
import { useAdmin } from './admin/useAdmin'
import { useRelationshipCrud } from './useRelationship'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export interface UsePartInstanceDataOptions {
  blockInstanceId: Ref<string> | string
}

export interface UsePartInstanceDataReturn {
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
  
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
 * PATTERN: Part Instance Data Composable

PATTERN: Composable with computed propert...
 */
export function usePartInstanceData(options: UsePartInstanceDataOptions): UsePartInstanceDataReturn {
  const { blockInstanceId } = options
  
  const blockInstanceIdRef = typeof blockInstanceId === 'string' 
    ? computed(() => blockInstanceId)
    : blockInstanceId
  
  
  const { getGlobalEntityById } = useGlobal()
  const adminComp = useAdmin()
  const { relationships: partAssignments } = useRelationshipCrud('partAssignments')
  
  /**
   */
  const blockInstance = computed(() => {
    return getGlobalEntityById('blockInstance', blockInstanceIdRef.value)
  })
  
  /**
   */
  const blockShape = computed(() => {
    if (!blockInstance.value) return null
    const blockInstanceEntity = blockInstance.value as BlockInstanceEntity
    return getGlobalEntityById('blockShape', blockInstanceEntity.blockShapeRef) || null
  })
  
  /**
   */
  const validPartShapes = computed((): GlobalEntity<'partShape'>[] => {
    if (!blockShape.value) return []
    
    const blockShapeWithRels = adminComp.getEntity('blockShape', blockShape.value.id)
    if (!blockShapeWithRels) return []
    
    const validParts = blockShapeWithRels.validParts
    if (!validParts || !Array.isArray(validParts)) return []
    
    const partShapes = adminComp.getEntitiesByKey('partShape') as GlobalEntity<'partShape'>[]
    const { resolved } = resolveByIds(partShapes, validParts)
    return resolved.sort((a, b) => a.orderIndex - b.orderIndex)
  })
  
  /**
   */
  const existingPartInstances = computed((): GlobalEntity<'partInstance'>[] => {
    if (!partAssignments.value) return []
    
    const relationships = partAssignments.value.filter(
      rel => String(rel.parentId) === blockInstanceIdRef.value && !rel.disabled
    )
    
    const partInstances = adminComp.getEntitiesByKey('partInstance') as GlobalEntity<'partInstance'>[]
    const childIds = relationships.map((rel) => String(rel.childId))
    const { resolved } = resolveByIds(partInstances, childIds)
    return resolved.sort((a, b) => a.orderIndex - b.orderIndex)
  })
  
  /**
   */
  const getPartInstanceForShape = (partShapeId: string): GlobalEntity<'partInstance'> | undefined => {
    return existingPartInstances.value.find(pi => pi.partShapeRef === partShapeId)
  }
  
  /**
   */
  const getPartShapeName = (partShapeId: string): string => {
    const partShape = getGlobalEntityById('partShape', partShapeId)
    const name = partShape?.name
    return name !== undefined && name !== null && name !== '' ? name : `PartShape ${partShapeId.slice(0, 8)}`
  }
  
  /**
   */
  const generatePartInstanceName = (
    blockInstanceName: string,
    partShapeName: string,
    blockInstanceRef: string,
    partShapeRef: string
  ): string => {
    const allPartInstances = adminComp.getEntitiesByKey('partInstance')
    const matchingPartInstances = allPartInstances.filter((pp) => {
      const partInstance = pp as GlobalEntity<'partInstance'>
      return getEntityFieldValue(partInstance, 'blockInstanceRef') === blockInstanceRef && 
             getEntityFieldValue(partInstance, 'partShapeRef') === partShapeRef
    })
    
    const baseName = `${blockInstanceName}-${partShapeName}`
    
    if (matchingPartInstances.length === 0) {
      return baseName
    }
    
    const baseNameExists = matchingPartInstances.some((pp) => (pp as GlobalEntity<'partInstance'>).name === baseName)
    if (!baseNameExists) {
      return baseName
    }
    
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

