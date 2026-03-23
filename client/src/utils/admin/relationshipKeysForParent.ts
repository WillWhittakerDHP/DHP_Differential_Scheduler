import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS, type GlobalRelationshipKey } from '@/constants/relationships'

/**
 * Relationship kinds whose parent entity matches `entityKey` (for entity card Save → relationship CRUD).
 */
export function getRelationshipKeysForParent(entityKey: GlobalEntityKey): GlobalRelationshipKey[] {
  return (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).filter(
    (k) => RELATIONSHIP_KEYS[k].parentEntity === entityKey
  )
}

/** Frontend form/store keys for those relationships (e.g. validAnnotations). */
export function getRelationshipFrontendKeysForParent(entityKey: GlobalEntityKey): string[] {
  return getRelationshipKeysForParent(entityKey).map((k) => RELATIONSHIP_KEYS[k].frontendKey)
}
