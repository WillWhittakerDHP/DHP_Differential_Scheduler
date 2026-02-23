/**
 * EntityCard Constants
 * 
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
 */
export const ENTITY_CARD_SAVE_KEY = Symbol('entityCardSave')

export interface EntityCardSaveContext {
  handleSave: () => Promise<void>
  isNew: boolean
  disableAutoSave?: boolean
}

/**
 * Symbol key for EntityCard auto-save disable flag
 */
export const ENTITY_CARD_DISABLE_AUTOSAVE_KEY = Symbol('entityCardDisableAutoSave')
