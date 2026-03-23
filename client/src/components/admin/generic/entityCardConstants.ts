
import type { GlobalEntityKey } from '@/constants/entities'

export * from './entityCardKeyboardConstants'

/** Shared props for entity card subcomponents that need entityId and entityKey only. */
export interface EntityCardSharedProps {
  entityId: string
  entityKey: GlobalEntityKey
}

export const ENTITY_CARD_SAVE_KEY = Symbol('entityCardSave')

export interface EntityCardSaveContext {
  handleSave: () => Promise<void>
  isNew: boolean
  disableAutoSave?: boolean
}

export const ENTITY_CARD_DISABLE_AUTOSAVE_KEY = Symbol('entityCardDisableAutoSave')
