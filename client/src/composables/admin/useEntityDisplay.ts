/**
 * WHY: useEntityDisplay Composable

WHY: Moves display name calculation logic t...
 */
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import {
  getEntityDeleteTitle as getEntityDeleteTitleText,
  getEntitySuccessMessage as getEntitySuccessMessageText,
  getEntityCreateMessage as getEntityCreateMessageText,
} from '@/utils/admin/entityDisplayText'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export interface UseEntityDisplayReturn {
  getEntityDisplayName: (entityKey: GlobalEntityKey, entity: GlobalEntity<GlobalEntityKey>) => string
  getEntityName: (entityKey: GlobalEntityKey, entity: GlobalEntity<GlobalEntityKey>) => string
  getEntitySuccessMessage: (entityKey: GlobalEntityKey) => string
  getEntityCreateMessage: (entityKey: GlobalEntityKey) => string
  getEntityDeleteTitle: (entityKey: GlobalEntityKey) => string
}

/**
 * WHY: useEntityDisplay composable

WHY: Extracts display name logic from compo...
 */
export function useEntityDisplay(): UseEntityDisplayReturn {
  const adminConfig = useAdminConfig()

  /**
   * NOTE: This function accesses entity properties directly, which Vue can track for reactivity
   */
  const getEntityDisplayName = (
    entityKey: GlobalEntityKey,
    entity: GlobalEntity<GlobalEntityKey>
  ): string => {
    try {
      const config = adminConfig.getInstanceConfig(entityKey).value
      const titleField = config?.titleField as string | undefined
      if (titleField) {
        // WHY: Direct property access ensures reactivity when entity properties change
        // PATTERN: Access entity[titleField] directly, Vue will track this access
        const value = getEntityFieldValue(entity, titleField)
        return value !== undefined && value !== null && value !== '' ? String(value) : ''
      }
      // LEARNING: Access entity.name directly for reactivity
      return entity.name || `${entityKey} ${entity.id}`
    } catch {
      return entity.name || `${entityKey} ${entity.id}`
    }
  }

  /**
   */
  const getEntityName = (
    entityKey: GlobalEntityKey,
    entity: GlobalEntity<GlobalEntityKey>
  ): string => {
    return entity.name || `${entityKey} ${entity.id}`
  }

  /**
   * PATTERN: Function that formats message based on entityKey
   */
  const getEntitySuccessMessage = (entityKey: GlobalEntityKey): string => {
    return getEntitySuccessMessageText(entityKey)
  }

  /**
   * PATTERN: Function that formats message based on entityKey
   */
  const getEntityCreateMessage = (entityKey: GlobalEntityKey): string => {
    return getEntityCreateMessageText(entityKey)
  }

  /**
   * PATTERN: Function that formats title based on entityKey
   */
  const getEntityDeleteTitle = (entityKey: GlobalEntityKey): string => {
    return getEntityDeleteTitleText(entityKey)
  }

  return {
    getEntityDisplayName,
    getEntityName,
    getEntitySuccessMessage,
    getEntityCreateMessage,
    getEntityDeleteTitle
  }
}

