/**
 * WHY: Entity List Composable

WHY: Components should be thin UI wrappers - lis...
 */
import { useRouter } from 'vue-router'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useEntityList')

export interface UseEntityListOptions {
  /**
   */
  entityKey: GlobalEntityKey
  
  /**
   */
  routes?: {
    /**
     */
    create?: string
    
    /**
     */
    edit?: string
  }
  
  /**
   */
  deleteConfirmation?: string | ((entityId: GlobalEntityId) => string)
  
  /**
   */
  deleteErrorMessage?: string | ((error: unknown) => string)
}

export interface UseEntityListReturn {
  /**
   */
  goToCreate: () => void
  
  /**
   */
  goToEdit: (id: GlobalEntityId) => void
  
  /**
   */
  handleDelete: (id: GlobalEntityId) => Promise<void>
}

/**
 * WHY: Entity List Composable

WHY: Moves business logic out of components into...
 */
export function useEntityList(
  options: UseEntityListOptions
): UseEntityListReturn {
  const {
    entityKey,
    routes = {},
    deleteConfirmation = 'Are you sure you want to delete this item?',
    deleteErrorMessage = 'Failed to delete item'
  } = options
  
  const router = useRouter()
  const { remove } = useEntityCrud(entityKey)
  const { error: notifyError } = useNotification()
  
  /**
   * WHY: Defaults to entityKey-create pattern if not provided
   */
  const createRouteName = routes.create || `${entityKey}-create`
  
  /**
   * WHY: Defaults to entityKey-edit pattern if not provided
   */
  const editRouteName = routes.edit || `${entityKey}-edit`
  
  /**
   */
  const goToCreate = (): void => {
    router.push({ name: createRouteName })
  }
  
  /**
   */
  const goToEdit = (id: GlobalEntityId): void => {
    router.push({ name: editRouteName, params: { id: String(id) } })
  }
  
  /**
   */
  const getDeleteConfirmation = (entityId: GlobalEntityId): string => {
    if (typeof deleteConfirmation === 'function') {
      return deleteConfirmation(entityId)
    }
    return deleteConfirmation
  }
  
  /**
   */
  const getDeleteErrorMessage = (error: unknown): string => {
    if (typeof deleteErrorMessage === 'function') {
      return deleteErrorMessage(error)
    }
    return deleteErrorMessage
  }
  
  /**
   */
  const handleDelete = async (id: GlobalEntityId): Promise<void> => {
    const confirmation = getDeleteConfirmation(id)
    
    if (!confirm(confirmation)) {
      return
    }
    
    try {
      await remove(id)
    } catch (err) {
      logger.error('Delete entity failed', { err })
      const errorMsg = getDeleteErrorMessage(err)
      notifyError(errorMsg)
      throw err // Re-throw so caller can handle if needed
    }
  }
  
  return {
    goToCreate,
    goToEdit,
    handleDelete
  }
}

