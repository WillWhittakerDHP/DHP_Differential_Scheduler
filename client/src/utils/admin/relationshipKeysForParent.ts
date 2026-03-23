import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS, type GlobalRelationshipKey } from '@/constants/relationships'

/**
 * Relationship kinds whose parent entity matches `entityKey` (for entity card Save → relationship CRUD).
 */
function getRelationshipKeysForParentCore(entityKey: GlobalEntityKey): GlobalRelationshipKey[] {
  return (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).filter(
    (k) => RELATIONSHIP_KEYS[k].parentEntity === entityKey
  )
}

export function getRelationshipKeysForParent(entityKey: GlobalEntityKey): GlobalRelationshipKey[] {
  return getRelationshipKeysForParentCore(entityKey)
}

/** Frontend form/store keys for those relationships (e.g. validAnnotations). */
export function getRelationshipFrontendKeysForParent(entityKey: GlobalEntityKey): string[] {
  return getRelationshipKeysForParentCore(entityKey).map((k) => RELATIONSHIP_KEYS[k].frontendKey)
}
