import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

export type GlobalData = {
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
}
