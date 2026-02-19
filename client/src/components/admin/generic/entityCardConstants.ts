/**
 * EntityCard Constants
 * 
 * LEARNING: Shared constants for EntityCard component
 * WHY: Symbols and constants that need to be shared between EntityCard and child components
 * PATTERN: Separate constants file for symbols used in provide/inject
 */

import type { GlobalEntityKey } from '@/constants/entities'

/** Shared props for entity card subcomponents that need entityId and entityKey only. */
export interface EntityCardSharedProps {
  entityId: string
  entityKey: GlobalEntityKey
}

/** Keyboard key for Enter (used in title keydown handler to avoid hardcoding magic strings) */
export const KEY_ENTER = 'Enter'

/**
 * Symbol key for EntityCard save context injection
 * LEARNING: Used for provide/inject to pass handleSave and isNew to child input components
 * WHY: Allows input components to trigger full form save on Enter key when creating new entities
 * PATTERN: Symbol ensures unique injection key
 */
export const ENTITY_CARD_SAVE_KEY = Symbol('entityCardSave')

export interface EntityCardSaveContext {
  handleSave: () => Promise<void>
  isNew: boolean
  disableAutoSave?: boolean
}

/**
 * Symbol key for EntityCard auto-save disable flag
 * LEARNING: Used for provide/inject to pass disableAutoSave flag to child input components
 * WHY: Allows parent to disable field blur auto-save (e.g., in bulk edit modals)
 * PATTERN: Symbol ensures unique injection key
 */
export const ENTITY_CARD_DISABLE_AUTOSAVE_KEY = Symbol('entityCardDisableAutoSave')
