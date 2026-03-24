/**
 * Shared types for select filtering resolution (avoids circular imports between resolve + branches).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface ComponentEntityData {
  getAvailableComponents: (entityId: string) => GlobalEntity<GlobalEntityKey>[]
  getComponents: (entityId: string) => { childId: string }[]
}
