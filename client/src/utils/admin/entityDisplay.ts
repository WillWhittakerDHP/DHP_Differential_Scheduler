/**
 * Entity display name and message formatters.
 */
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { InstanceConfig } from '@/configs/adminConfig'
import {
  getEntityDeleteTitle as getEntityDeleteTitleText,
  getEntitySuccessMessage as getEntitySuccessMessageText,
  getEntityCreateMessage as getEntityCreateMessageText,
} from '@/utils/admin/entityDisplayText'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

export interface EntityDisplayConfig {
  getInstanceConfig: (entityKey: GlobalEntityKey) => { value: InstanceConfig[GlobalEntityKey] }
}

export interface EntityDisplayReturn {
  getEntityDisplayName: (entityKey: GlobalEntityKey, entity: GlobalEntity<GlobalEntityKey>) => string
  getEntityName: (entityKey: GlobalEntityKey, entity: GlobalEntity<GlobalEntityKey>) => string
  getEntitySuccessMessage: (entityKey: GlobalEntityKey) => string
  getEntityCreateMessage: (entityKey: GlobalEntityKey) => string
  getEntityDeleteTitle: (entityKey: GlobalEntityKey) => string
}

export function entityDisplay(adminConfig: EntityDisplayConfig): EntityDisplayReturn {
  const getEntityDisplayName = (
    entityKey: GlobalEntityKey,
    entity: GlobalEntity<GlobalEntityKey>
  ): string => {
    try {
      const config = adminConfig.getInstanceConfig(entityKey).value
      const titleField = config?.titleField as string | undefined
      if (titleField) {
        const value = getEntityFieldValue(entity, titleField)
        return value !== undefined && value !== null && value !== '' ? String(value) : ''
      }
      return entity.name || `${entityKey} ${entity.id}`
    } catch {
      return entity.name || `${entityKey} ${entity.id}`
    }
  }

  const getEntityName = (
    entityKey: GlobalEntityKey,
    entity: GlobalEntity<GlobalEntityKey>
  ): string => {
    return entity.name || `${entityKey} ${entity.id}`
  }

  const getEntitySuccessMessage = (entityKey: GlobalEntityKey): string => {
    return getEntitySuccessMessageText(entityKey)
  }

  const getEntityCreateMessage = (entityKey: GlobalEntityKey): string => {
    return getEntityCreateMessageText(entityKey)
  }

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
