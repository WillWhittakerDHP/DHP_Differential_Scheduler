import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export function collectionFieldChildParentId<GE extends GlobalEntityKey>(params: {
  composableName: string
  entityKey: string
  entityId: string
  fieldKey: string
  parentEntity: GlobalEntity<GE> | undefined | null
  relationshipKey: string
  child: GlobalEntity<GlobalEntityKey>
}): string {
  const {
    composableName,
    entityKey,
    entityId,
    fieldKey,
    parentEntity,
    relationshipKey,
    child,
  } = params
  if (!parentEntity) {
    throw new Error(
      `[${composableName}] Missing parentEntity for ${entityKey}.${entityId}. Cannot determine child parent ID.`
    )
  }
  if (!relationshipKey) {
    throw new Error(
      `[${composableName}] Missing relationshipKey for ${entityKey}.${fieldKey}. Cannot determine child parent ID.`
    )
  }
  const parentRelationshipIds = getEntityFieldValue(parentEntity, String(relationshipKey))
  if (Array.isArray(parentRelationshipIds) && parentRelationshipIds.includes(child.id)) {
    return parentEntity.id
  }
  return ''
}
