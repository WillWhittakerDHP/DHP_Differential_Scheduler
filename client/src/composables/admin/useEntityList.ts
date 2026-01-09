/**
 * Entity List Composable
 * 
 * LEARNING: Extracts list management logic from list components
 * WHY: Components should be thin UI wrappers - list logic belongs in composables
 * PATTERN: Composable that handles navigation and delete operations
 * 
 * This composable handles:
 * - Navigation to create/edit routes
 * - Delete confirmation and execution
 * - Error handling for delete operations
 */

import { useRouter } from 'vue-router'
import { useEntityCrud } from '../useEntity'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@/types/entities'

/**
 * Entity List Composable Options
 */
export interface UseEntityListOptions {
  /**
   * LEARNING: Entity key for CRUD operations
   * WHY: Determines which entity type to manage
   * PATTERN: GlobalEntityKey type
   */
  entityKey: GlobalEntityKey
  
  /**
   * LEARNING: Route names for navigation
   * WHY: Allows customization of route names
   * PATTERN: Object with route name properties
   */
  routes?: {
    /**
     * LEARNING: Route name for create page
     * WHY: Used when navigating to create new entity
     * PATTERN: Route name string
     */
    create?: string
    
    /**
     * LEARNING: Route name for edit page
     * WHY: Used when navigating to edit existing entity
     * PATTERN: Route name string (should accept :id param)
     */
    edit?: string
  }
  
  /**
   * LEARNING: Delete confirmation message
   * WHY: Allows customization of confirmation prompt
   * PATTERN: Function that returns confirmation message, or string
   */
  deleteConfirmation?: string | ((entityId: GlobalEntityId) => string)
  
  /**
   * LEARNING: Delete error message
   * WHY: Allows customization of error message
   * PATTERN: Function that returns error message, or string
   */
  deleteErrorMessage?: string | ((error: unknown) => string)
}

/**
 * Entity List Composable Return Type
 */
export interface UseEntityListReturn {
  /**
   * LEARNING: Navigate to create page
   * WHY: Component needs navigation function for create button
   * PATTERN: Function that uses router to navigate
   */
  goToCreate: () => void
  
  /**
   * LEARNING: Navigate to edit page
   * WHY: Component needs navigation function for edit action
   * PATTERN: Function that uses router to navigate with entity ID
   */
  goToEdit: (id: GlobalEntityId) => void
  
  /**
   * LEARNING: Handle delete with confirmation
   * WHY: Component needs delete function with confirmation
   * PATTERN: Async function that confirms and deletes entity
   */
  handleDelete: (id: GlobalEntityId) => Promise<void>
}

/**
 * Entity List Composable
 * 
 * LEARNING: Provides list management logic extracted from components
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with navigation and delete operations
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
  
  /**
   * LEARNING: Get create route name
   * WHY: Defaults to entityKey-create pattern if not provided
   * PATTERN: Use provided route or construct default
   */
  const createRouteName = routes.create || `${entityKey}-create`
  
  /**
   * LEARNING: Get edit route name
   * WHY: Defaults to entityKey-edit pattern if not provided
   * PATTERN: Use provided route or construct default
   */
  const editRouteName = routes.edit || `${entityKey}-edit`
  
  /**
   * LEARNING: Navigate to create page
   * WHY: Component needs navigation function for create button
   * PATTERN: Function that uses router to navigate
   */
  const goToCreate = (): void => {
    router.push({ name: createRouteName })
  }
  
  /**
   * LEARNING: Navigate to edit page
   * WHY: Component needs navigation function for edit action
   * PATTERN: Function that uses router to navigate with entity ID
   */
  const goToEdit = (id: GlobalEntityId): void => {
    router.push({ name: editRouteName, params: { id: String(id) } })
  }
  
  /**
   * LEARNING: Get delete confirmation message
   * WHY: Supports both string and function-based messages
   * PATTERN: Check if function, call with entityId, otherwise return string
   */
  const getDeleteConfirmation = (entityId: GlobalEntityId): string => {
    if (typeof deleteConfirmation === 'function') {
      return deleteConfirmation(entityId)
    }
    return deleteConfirmation
  }
  
  /**
   * LEARNING: Get delete error message
   * WHY: Supports both string and function-based error messages
   * PATTERN: Check if function, call with error, otherwise return string
   */
  const getDeleteErrorMessage = (error: unknown): string => {
    if (typeof deleteErrorMessage === 'function') {
      return deleteErrorMessage(error)
    }
    return deleteErrorMessage
  }
  
  /**
   * LEARNING: Handle delete with confirmation
   * WHY: Component needs delete function with confirmation
   * PATTERN: Async function that confirms and deletes entity with error handling
   */
  const handleDelete = async (id: GlobalEntityId): Promise<void> => {
    const confirmation = getDeleteConfirmation(id)
    
    if (!confirm(confirmation)) {
      return
    }
    
    try {
      await remove(id)
    } catch (err) {
      const errorMsg = getDeleteErrorMessage(err)
      alert(errorMsg)
      throw err // Re-throw so caller can handle if needed
    }
  }
  
  return {
    goToCreate,
    goToEdit,
    handleDelete
  }
}

