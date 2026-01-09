/**
 * EntityCard Constants
 * 
 * LEARNING: Shared constants for EntityCard component
 * WHY: Symbols and constants that need to be shared between EntityCard and child components
 * PATTERN: Separate constants file for symbols used in provide/inject
 */

/**
 * Symbol key for EntityCard save context injection
 * LEARNING: Used for provide/inject to pass handleSave and isNew to child input components
 * WHY: Allows input components to trigger full form save on Enter key when creating new entities
 * PATTERN: Symbol ensures unique injection key
 */
export const ENTITY_CARD_SAVE_KEY = Symbol('entityCardSave')

/**
 * Type definition for EntityCard save context
 */
export interface EntityCardSaveContext {
  handleSave: () => Promise<void>
  isNew: boolean
}

