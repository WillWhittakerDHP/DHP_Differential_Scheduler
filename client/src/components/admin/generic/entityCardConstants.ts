
import type { GlobalEntityKey } from '@/constants/entities'

/** Shared props for entity card subcomponents that need entityId and entityKey only. */
export interface EntityCardSharedProps {
  entityId: string
  entityKey: GlobalEntityKey
}

/** Keyboard key constants (DOM KeyboardEvent.key values; avoid hardcoding in keydown handlers). */
export const KEY_ENTER = 'Enter'
export const KEY_SPACE = ' '
export const KEY_SPACEBAR = 'Spacebar'
export const KEY_TAB = 'Tab'

/** Key codes for keyboard events (KeyboardEvent.keyCode). */
export const KEY_CODE_ENTER = 13
export const KEY_CODE_SPACE = 32
export const KEY_CODE_TAB = 9

export const ENTITY_CARD_SAVE_KEY = Symbol('entityCardSave')

export interface EntityCardSaveContext {
  handleSave: () => Promise<void>
  isNew: boolean
  disableAutoSave?: boolean
}

export const ENTITY_CARD_DISABLE_AUTOSAVE_KEY = Symbol('entityCardDisableAutoSave')
