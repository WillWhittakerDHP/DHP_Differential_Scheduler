/**
 * useEntityDisplay Composable
 * 
 * LEARNING: Extracts entity display name logic from ShapesTab component
 * WHY: Moves display name calculation logic to composable
 * PATTERN: Composable that provides display name function
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
 * useEntityDisplay composable
 * 
 * LEARNING: Provides entity display name function
 * WHY: Extracts display name logic from component to composable
 * PATTERN: Composable that returns display name function
 */
export function useEntityDisplay(): UseEntityDisplayReturn {
  const adminConfig = useAdminConfig()

  /**
   * LEARNING: Helper function to get entity display name (reactive)
   * WHY: Gets display name for collapsed state, reactive to entity property changes
   * PATTERN: Use titleField value if available, fallback to entity.name or ID
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
   * LEARNING: Get entity name for display
   * WHY: Gets entity name for display in title and delete dialog
   * PATTERN: Computed property that accesses entity.name with fallback
   */
  const getEntityName = (
    entityKey: GlobalEntityKey,
    entity: GlobalEntity<GlobalEntityKey>
  ): string => {
    return entity.name || `${entityKey} ${entity.id}`
  }

  /**
   * LEARNING: Get success message for entity type
   * WHY: Provides entity-type-specific success message
   * PATTERN: Function that formats message based on entityKey
   */
  const getEntitySuccessMessage = (entityKey: GlobalEntityKey): string => {
    return getEntitySuccessMessageText(entityKey)
  }

  /**
   * LEARNING: Get create message for entity type
   * WHY: Provides entity-type-specific create success message
   * PATTERN: Function that formats message based on entityKey
   */
  const getEntityCreateMessage = (entityKey: GlobalEntityKey): string => {
    return getEntityCreateMessageText(entityKey)
  }

  /**
   * LEARNING: Get delete dialog title for entity type
   * WHY: Provides entity-type-specific delete dialog title
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

